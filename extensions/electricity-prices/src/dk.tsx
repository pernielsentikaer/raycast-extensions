import { getPreferenceValues } from "@raycast/api";
import ElectricityPriceList from "./components/ElectricityPriceList";

export default function Command() {
  const preferences = getPreferenceValues<Preferences.Dk>();
  return <ElectricityPriceList country="dk" preferences={preferences} />;
}
