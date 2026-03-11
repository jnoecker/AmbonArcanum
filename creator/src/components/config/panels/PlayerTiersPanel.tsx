import type { ConfigPanelProps } from "./types";
import type { TierDefinitionConfig } from "@/types/config";
import { Section, FieldRow, TextInput, CommitTextarea } from "@/components/ui/FormWidgets";
import { DEFAULT_TIER_DEFINITIONS, TIER_ORDER } from "@/lib/defaultSpriteData";

export function PlayerTiersPanel({ config, onChange }: ConfigPanelProps) {
  const tiers = config.playerTiers ?? DEFAULT_TIER_DEFINITIONS;

  const patchTier = (tierId: string, p: Partial<TierDefinitionConfig>) => {
    const existing = tiers[tierId]!;
    const updated: TierDefinitionConfig = {
      displayName: p.displayName ?? existing.displayName,
      levels: p.levels ?? existing.levels,
      visualDescription: p.visualDescription ?? existing.visualDescription,
    };
    onChange({
      playerTiers: { ...tiers, [tierId]: updated },
    });
  };

  // Show tiers in canonical order, then any extras
  const orderedIds = [
    ...TIER_ORDER.filter((t) => t in tiers),
    ...Object.keys(tiers).filter((t) => !TIER_ORDER.includes(t)),
  ];

  return (
    <>
      <p className="mb-3 text-xs leading-relaxed text-text-muted">
        Player tiers control the visual progression of character sprites. Each tier defines how
        equipment, magical effects, and overall power level appear in generated sprite art.
      </p>
      {orderedIds.map((tierId) => {
        const tier = tiers[tierId]!;
        return (
          <Section key={tierId} title={tier.displayName} description={`Tier ${tierId} — ${tier.levels}`}>
            <div className="flex flex-col gap-1.5">
              <FieldRow label="Display Name">
                <TextInput
                  value={tier.displayName}
                  onCommit={(v) => patchTier(tierId, { displayName: v })}
                />
              </FieldRow>
              <FieldRow label="Levels" hint="Level range this tier covers (e.g. '1-9')">
                <TextInput
                  value={tier.levels}
                  onCommit={(v) => patchTier(tierId, { levels: v })}
                />
              </FieldRow>
              <CommitTextarea
                label="Visual Description"
                value={tier.visualDescription}
                onCommit={(v) => patchTier(tierId, { visualDescription: v })}
                placeholder="Describe how this tier's power level appears visually in sprite art..."
                rows={4}
              />
            </div>
          </Section>
        );
      })}
    </>
  );
}
