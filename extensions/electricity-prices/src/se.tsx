import { getPreferenceValues } from "@raycast/api";
import ElectricityPriceList from "./components/ElectricityPriceList";

export default function Command() {
  const preferences = getPreferenceValues<Preferences.Se>();
  return <ElectricityPriceList country="se" preferences={preferences} />;
}
