import { List, Action, ActionPanel, Icon, Keyboard, openExtensionPreferences } from "@raycast/api";
import { useScores } from "./hooks/hooks";
import { openScore } from "./utils/utils";

export default function Command() {
  const { data: scores, isLoading, error } = useScores();

  if (error) {
    return (
      <List searchBarPlaceholder="Search scores...">
        <List.EmptyView
          icon={Icon.XMarkCircle}
          title="Error Loading Scores"
          description={error.message}
          actions={
            <ActionPanel>
              <Action title="Open Extension Preferences" icon={Icon.Gear} onAction={openExtensionPreferences} />
            </ActionPanel>
          }
        />
      </List>
    );
  }

  return (
    <List isLoading={isLoading} searchBarPlaceholder="Search scores...">
      {scores?.map((score, index) => (
        <List.Item
          key={index}
          icon={Icon.Document}
          title={score.title}
          subtitle={score.composers}
          accessories={[
            ...(score.tags ? [{ tag: score.tags, icon: Icon.Tag, tooltip: "Tags" }] : []),
            ...(score.genres ? [{ tag: score.genres, icon: Icon.Music, tooltip: "Genres" }] : []),
          ]}
          actions={
            <ActionPanel>
              <Action title="Open in forScore" icon={Icon.Play} onAction={() => openScore(score)} />
              <Action.CopyToClipboard
                title="Copy Title"
                content={score.title}
                shortcut={Keyboard.Shortcut.Common.Copy}
              />
              <ActionPanel.Section title="Settings">
                <Action
                  title="Open Extension Preferences"
                  icon={Icon.Gear}
                  onAction={openExtensionPreferences}
                  shortcut={{ modifiers: ["cmd", "shift"], key: "," }}
                />
              </ActionPanel.Section>
            </ActionPanel>
          }
        />
      ))}
    </List>
  );
}
