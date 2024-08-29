import { List } from "@raycast/api";
import { DomainListItem, DomainListProps } from "../types/nextdns";
import { EmptyView } from "../components/empty-view";
import { ListItem } from "../components/list-item";
import { PREFERENCES } from "./constants";

export const DomainList: React.FC<DomainListProps> = ({ data, type, isLoading, mutate}) => (
  <List
    isLoading={isLoading}
    searchBarPlaceholder={`Search ${type}list of ${data.profileName} (${PREFERENCES.nextdns_profile_id}`}
  >
    {data.result?.map((element: DomainListItem) => (
      <ListItem key={element.id} siteItem={element} type={type} mutate={mutate} />
    ))}

    {Object.keys(data).length === 0 && <EmptyView title={`No domains in ${type}list`} icon={{ source: "no_view.png" }} />}
    <EmptyView title="No Results" icon={{ source: "no_view.png" }} />
  </List>
);
