import { Action, ActionPanel, Color, Icon, List, showToast, Toast } from "@raycast/api";
import { toggleSite } from "../libs/api";
import { MutatePromise } from "@raycast/utils";
import { DomainListItem } from "../types/nextdns";
import AddSite from "./add-site";

//TODO: Implement optimistic update
//TODO: Ensure naming, site or domain?
export function ListItem(props: { id: string; active: boolean; type: string, mutate: MutatePromise<{ result: DomainListItem[]; profileName: string; }> }) {
  const { id, active, type, mutate } = props;

  async function toggle(newStatus: boolean) {
    const toast = await showToast({ style: Toast.Style.Animated, title: newStatus ? "Activating Site" : "Deactivating Site" });
    try {
      await mutate(
        toggleSite({ id, type, active: newStatus }),
        {
          optimisticUpdate(data) {
            const { result, profileName } = data;
            const index = result.findIndex(item => item.id===id);
            result[index].active = newStatus;
            return { result, profileName };
          },
        },
      );
      toast.style = Toast.Style.Success;
      toast.title = newStatus ? "Activated Site" : "Deactivated Site";
    } catch (error) {
      toast.style = Toast.Style.Failure;
      toast.title = `Could not ${newStatus ? "Activate" : "Deactivate"} Site`;
    }
  }

  return (
    <List.Item
      title={`*.${id}`}
      icon={
        active
          ? { source: Icon.CheckCircle, tintColor: Color.Green }
          : { source: Icon.Circle, tintColor: Color.SecondaryText }
      }
      actions={
        <ActionPanel title={`Manage ${id}`}>
          <Action
            title={`${active ? "Deactivate" : "Activate"} Site`}
            icon={active ? Icon.XMarkCircle : Icon.CheckCircle}
            onAction={() => toggle(!active)}
          />
          <Action.Push icon={Icon.Plus} title="Add New Site" target={<AddSite type={type} mutate={mutate} />} />
        </ActionPanel>
      }
    />
  );
}