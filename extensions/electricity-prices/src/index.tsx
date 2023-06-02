import { List, Color, getPreferenceValues, ActionPanel, Action, Icon, popToRoot } from "@raycast/api";
import { useFetch } from "@raycast/utils";
import { Entries, Entry } from "./interfaces";
import { calculateAverage, dateString, monthString, yearString } from "./utils";
import { API_URL, smallestAmountPronunciation } from "./const";
import { useEffect, useState } from "react";

export default function Command() {
  const preferences = getPreferenceValues<ExtensionPreferences>();

  const [dateObject, setDateObject] = useState(new Date());
  const [selectedItem, setSelectedItem] = useState<string | undefined>(undefined);

  const [currentDate, setCurrentDate] = useState(dateString(dateObject));
  const [currentMonth, setCurrentMonth] = useState(monthString(dateObject));
  const [currentFullYear, setCurrentFullYear] = useState(yearString(dateObject));

  const isShowingToday = () => {
    return new Date().toDateString() === dateObject.toDateString();
  };

  const toggleDate = () => {
    //Toggle between showing current day and tomorrow
    if (isShowingToday()) {
      const nextDate = new Date(dateObject.getTime());
      nextDate.setDate(nextDate.getDate() + 1);
      setDateObject(nextDate);

      setCurrentDate(dateString(nextDate));
      setCurrentMonth(monthString(nextDate));
      setCurrentFullYear(yearString(nextDate));
    } else {
      const yesterDate = new Date(dateObject.getTime());
      yesterDate.setDate(yesterDate.getDate() - 1);
      setDateObject(yesterDate);

      setCurrentDate(dateString(yesterDate));
      setCurrentMonth(monthString(yesterDate));
      setCurrentFullYear(yearString(yesterDate));
    }
  };

  const currentHour = dateObject.getHours().toString().padStart(2, "0");

  const { data, isLoading, error } = useFetch<Entries>(
    `${API_URL.dk}${currentFullYear}/${currentMonth}-${currentDate}_${preferences.priceclass}.json`,
    {
      parseResponse: parseFetchResponse,
    }
  );

  if (error) {
    popToRoot();
  }

  useEffect(() => {
    setSelectedItem("id6");
    console.log("here");
  }, [data]);

  console.log(selectedItem);

  return (
    <List isLoading={isLoading} selectedItemId={selectedItem}>
      <List.Section
        title={`${currentDate}/${currentMonth}/${currentFullYear} - ${preferences.priceclass}`}
        subtitle={`Daily Average: ${data?.average.toFixed(2)} ${smallestAmountPronunciation.dk}/kWh`}
      >
        {data?.entries.map((searchResult, i) => {
          return (
            <List.Item
              key={`id${i.toString()}`}
              title={searchResult.time_start_time + " - " + searchResult.time_end_time}
              subtitle={currentHour + ":00" == searchResult.time_start_time ? "Current Hour" : `id${i.toString()}`}
              accessories={accessories(searchResult, data.average)}
              actions={
                <ActionPanel>
                  <Action
                    onAction={() => {
                      toggleDate();
                    }}
                    title={isShowingToday() ? "Show Tomorrow" : "Show Today"}
                    icon={Icon.Calendar}
                  />
                </ActionPanel>
              }
            ></List.Item>
          );
        })}
        <List.Item id="hello" title={"hello"}></List.Item>
      </List.Section>
    </List>
  );
}

function accessories(result: Entry, average: number) {
  const accessories = [];

  if (result.kwh_diff_below_average > 0) {
    accessories.push({
      icon: "🤯",
      tooltip: "Cheapest, below zero",
    });
  } else if (result.kwh_diff_below_average > 50) {
    accessories.push({
      icon: "🔥",
      tooltip: "Cheapest of the cheapest hours",
    });
  } else if (result.kwh_diff_below_average > 40) {
    accessories.push({
      icon: "🧨",
      tooltip: "Cheapest of the cheap hours",
    });
  }

  return [
    ...accessories,
    {
      tag: {
        color: average > result.DKK_per_kWh ? Color.Green : Color.Red,
        value:
          result.DKK_per_kWh_with_vat_string +
          (result.kWh_diff_percent_string !== "" ? " (" + result.kWh_diff_percent_string + ")" : ""),
      },
    },
    { tag: result.kWh_diff_way },
  ];
}

async function parseFetchResponse(response: Response) {
  if (!response.ok) {
    throw new Error("No data available yet...");
  }

  const json = (await response.json()) as Entry[];
  const average = calculateAverage(json);

  const entries = json.map((result, i) => {
    result.EUR_per_kWh_with_vat = 0;
    result.DKK_per_kWh_with_vat = 0;

    if (result.DKK_per_kWh > 0) {
      result.DKK_per_kWh_with_vat = ((result.DKK_per_kWh * 1.25) / 100) * 10000;
    } else {
      result.DKK_per_kWh_with_vat = ((result.DKK_per_kWh * 1.25) / 100) * 10000;
    }

    if (result.EUR_per_kWh > 0) {
      result.EUR_per_kWh_with_vat = ((result.EUR_per_kWh * 1.25) / 100) * 10000;
    }

    if (result.DKK_per_kWh_with_vat != undefined) {
      result.DKK_per_kWh_with_vat_string =
        result.DKK_per_kWh_with_vat.toFixed(2) + " " + smallestAmountPronunciation.dk + "/kWh";
    }

    if (result.EUR_per_kWh_with_vat != undefined) {
      result.EUR_per_kWh_with_vat_string =
        result.EUR_per_kWh_with_vat.toFixed(2) + " " + smallestAmountPronunciation.dk + "/kWh";
    }

    result.time_start_time = result.time_start.substring(11, 16);
    result.time_end_time = result.time_end.substring(11, 16);

    // Get the percentage cheaper than average
    result.kwh_diff_below_average = ((average / 2 - result.DKK_per_kWh) / average) * 100;

    // Calculate difference from last hour as percentage
    if (i > 0) {
      result.kWh_diff = result.DKK_per_kWh - json[i - 1].DKK_per_kWh;
      result.kWh_diff_way = result.kWh_diff > 0 ? "⬆" : "⬇";

      result.kWh_diff_percent_string = "";
      if (!isNaN(result.DKK_per_kWh) && result.DKK_per_kWh > 0) {
        result.kWh_diff_percent_string = ((result.kWh_diff / json[i - 1].DKK_per_kWh) * 100).toFixed(2) + "%";
      }
    } else {
      result.kWh_diff = 0;
      result.kWh_diff_way = "⤵";
      result.kWh_diff_percent_string = "0%";
    }

    return result;
  });

  return { average: average, entries: entries } as Entries;
}
