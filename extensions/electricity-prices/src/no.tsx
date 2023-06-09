import { getPreferenceValues } from "@raycast/api";
import ElectricityPriceList from "./components/ElectricityPriceList";

export default function Command() {
  const preferences = getPreferenceValues<Preferences.No>();
  return <ElectricityPriceList country="no" preferences={preferences} />;
}
