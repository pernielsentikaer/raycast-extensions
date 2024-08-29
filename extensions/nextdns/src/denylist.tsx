import { getDomains } from "./libs/api";
import { ErrorView } from "./components/error-view";
import { DomainList } from "./libs/domainList";

export default function Command() {
  const type = "deny";
  const { data, isLoading, error, mutate } = getDomains({ type });

  if (error) {
    return <ErrorView />;
  }

  return (
    <DomainList data={data} type={type} isLoading={isLoading} mutate={mutate} />
  );
}
