import { List, Color, ActionPanel, Action, Icon, showToast, Toast } from "@raycast/api";
import { useFetch } from "@raycast/utils";
import { Entries, Entry } from "../interfaces";
import { calculateAverage, currentHourString, dateString, monthString, yearString } from "../utils";
import { CONFIG as CFG, ConfigItem } from "../const";
import { useEffect, useState } from "react";

interface ElectricityProps {
  country: string | "dk" | "se" | "no";
  preferences: Preferences;
}

export default function ElectricityPriceList(props: ElectricityProps) {
  const { country, preferences } = props;

  const CONFIG = CFG[country as keyof typeof CFG] as ConfigItem;

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

  const currentHour = currentHourString(dateObject);

  const { data, isLoading, error } = useFetch<Entries>(
    `${CONFIG.API_URL}${currentFullYear}/${currentMonth}-${currentDate}_${preferences.priceclass}.json`,
    {
      parseResponse: parseFetchResponse,
    }
  );

  if (error) {
    showToast(Toast.Style.Failure, "Error", error.message);
  }

  useEffect(() => {
    setSelectedItem(currentHourString(dateObject));
  }, [data]);

  return (
    <List isLoading={isLoading} selectedItemId={selectedItem}>
      <List.Section
        title={`${currentDate}/${currentMonth}/${currentFullYear} - ${preferences.priceclass}`}
        subtitle={`Daily Average: ${data?.average.toFixed(2)} ${CONFIG.smallestAmountPronunciation}/kWh`}
      >
        {data?.entries.map((searchResult, i) => {
          return (
            <List.Item
              key={i}
              id={i.toString()}
              title={searchResult.time_start_time + " - " + searchResult.time_end_time}
              subtitle={currentHour + ":00" == searchResult.time_start_time ? "Current Hour" : ""}
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

  async function parseFetchResponse(response: Response) {
    if (!response.ok) {
      throw new Error("No data available for tomorrow yet...");
    }

    const json = (await response.json()) as Entry[];
    const average = calculateAverage(json, CONFIG);

    const entries = json.map((result, i) => {
      result.EUR_per_kWh_with_vat = 0;

      result[CONFIG.price_with_vat] = 0;

      if (result[CONFIG.per_kWh] > 0) {
        result[CONFIG.price_with_vat] = ((result[CONFIG.per_kWh] * 1.25) / 100) * 10000;
      } else {
        result[CONFIG.price_with_vat] = ((result[CONFIG.per_kWh] * 1.25) / 100) * 10000;
      }

      if (result.EUR_per_kWh > 0) {
        result.EUR_per_kWh_with_vat = ((result.EUR_per_kWh * 1.25) / 100) * 10000;
      }

      if (result[CONFIG.price_with_vat] != undefined) {
        result[CONFIG.price_with_vat_string] =
          result[CONFIG.price_with_vat].toFixed(2) + " " + CONFIG.smallestAmountPronunciation + "/kWh";
      }

      if (result.EUR_per_kWh_with_vat != undefined) {
        result.EUR_per_kWh_with_vat_string =
          result.EUR_per_kWh_with_vat.toFixed(2) + " " + CONFIG.smallestAmountPronunciation + "/kWh";
      }

      result.time_start_time = result.time_start.substring(11, 16);
      result.time_end_time = result.time_end.substring(11, 16);

      // Get the percentage cheaper than average
      result.kwh_diff_below_average = ((average / 2 - result[CONFIG.per_kWh]) / average) * 100;

      // Calculate difference from last hour as percentage
      if (i > 0) {
        result.kWh_diff = result[CONFIG.per_kWh] - json[i - 1][CONFIG.per_kWh];
        result.kWh_diff_way = result.kWh_diff > 0 ? "⬆" : "⬇";

        result.kWh_diff_percent_string = "";

        if (!isNaN(result[CONFIG.per_kWh]) && result[CONFIG.per_kWh] > 0) {
          result.kWh_diff_percent_string = ((result.kWh_diff / json[i - 1][CONFIG.per_kWh]) * 100).toFixed(2) + "%";
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
          color: average > Number(result[CONFIG.per_kWh]) ? Color.Green : Color.Red,
          value:
            result[CONFIG.price_with_vat_string] +
            (result.kWh_diff_percent_string !== "" ? " (" + result.kWh_diff_percent_string + ")" : ""),
        },
      },
      { tag: result.kWh_diff_way },
    ];
  }
}
