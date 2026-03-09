import type { ConfigPanelProps, AppConfig } from "./types";
import { Section, FieldRow, NumberInput, TextInput } from "@/components/ui/FormWidgets";

export function NavigationPanel({ config, onChange }: ConfigPanelProps) {
  const recall = config.navigation.recall;

  const patchRecall = (p: Partial<AppConfig["navigation"]["recall"]>) =>
    onChange({ navigation: { ...config.navigation, recall: { ...recall, ...p } } });

  const patchMessages = (p: Partial<AppConfig["navigation"]["recall"]["messages"]>) =>
    patchRecall({ messages: { ...recall.messages, ...p } });

  return (
    <>
      <Section
        title="Recall"
        description="Recall teleports a player back to their start room. The cooldown prevents abuse as an instant escape from danger. Longer cooldowns make recall a strategic decision; shorter ones prioritize convenience."
      >
        <div className="flex flex-col gap-1.5">
          <FieldRow label="Cooldown (ms)" hint="300000ms = 5 minutes (classic MUD default). Set to 0 for unlimited recall. 600000ms (10 min) for a more punishing world.">
            <NumberInput
              value={recall.cooldownMs}
              onCommit={(v) => patchRecall({ cooldownMs: v ?? 300000 })}
              min={0}
            />
          </FieldRow>
        </div>
      </Section>

      <Section
        title="Recall Messages"
        description="Customize the messages players see during the recall process. These add flavor and communicate state to the player. Use {seconds} as a placeholder in the cooldown message."
      >
        <div className="flex flex-col gap-1.5">
          <FieldRow label="Combat Blocked" hint="Shown when a player tries to recall while in combat.">
            <TextInput
              value={recall.messages.combatBlocked}
              onCommit={(v) => patchMessages({ combatBlocked: v })}
            />
          </FieldRow>
          <FieldRow label="Cooldown" hint="Shown when recall is still on cooldown. Use {seconds} for the remaining time.">
            <TextInput
              value={recall.messages.cooldownRemaining}
              onCommit={(v) => patchMessages({ cooldownRemaining: v })}
              placeholder="Use {seconds} for remaining time"
            />
          </FieldRow>
          <FieldRow label="Cast Begin" hint="Shown to the player when they start casting recall.">
            <TextInput
              value={recall.messages.castBegin}
              onCommit={(v) => patchMessages({ castBegin: v })}
            />
          </FieldRow>
          <FieldRow label="Unreachable" hint="Shown when the destination room cannot be reached (e.g. deleted or inaccessible).">
            <TextInput
              value={recall.messages.unreachable}
              onCommit={(v) => patchMessages({ unreachable: v })}
            />
          </FieldRow>
          <FieldRow label="Depart Notice" hint="Broadcast to other players in the room when someone recalls away.">
            <TextInput
              value={recall.messages.departNotice}
              onCommit={(v) => patchMessages({ departNotice: v })}
            />
          </FieldRow>
          <FieldRow label="Arrive Notice" hint="Broadcast to other players in the destination room when someone arrives via recall.">
            <TextInput
              value={recall.messages.arriveNotice}
              onCommit={(v) => patchMessages({ arriveNotice: v })}
            />
          </FieldRow>
          <FieldRow label="Arrival" hint="Shown to the player themselves upon arriving at their recall destination.">
            <TextInput
              value={recall.messages.arrival}
              onCommit={(v) => patchMessages({ arrival: v })}
            />
          </FieldRow>
        </div>
      </Section>
    </>
  );
}
