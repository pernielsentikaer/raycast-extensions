import { getDomains } from "./libs/api";
import { ErrorView } from "./components/error-view";
import { DomainListItem } from "./types/nextdns";
import { removeItem } from "./libs/utils";
import { DomainList } from "./libs/domainList";

export default function Command() {
  const type = "allow";
  const { data, isLoading, error, mutate } = getDomains({ type });

  if (error) {
    return <ErrorView />;
  }

return (
    <List
      isLoading={isLoading}
      searchBarPlaceholder={`Search allowlist of ${data?.profileName ?? "..."} (${PREFERENCES.nextdns_profile_id})`}
    >
      {data && (
        <>
          {data.result?.map((element) => <ListItem key={element.id} id={element.id} active={element.active} type="allow" mutate={mutate} />)}

          {Object.keys(data).length === 0 && (
            <EmptyView title="No domains in allowlist" icon={{ source: "no_view.png" }} />
          )}
        </>
      )}
      <EmptyView title="No Results" icon={{ source: "no_view.png" }} />
    </List>
  );
}
