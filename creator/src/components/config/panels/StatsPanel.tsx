import { useState, useCallback } from "react";
import type { ConfigPanelProps } from "./types";
import type { StatDefinition, StatBindings } from "@/types/config";
import {
  Section,
  FieldRow,
  NumberInput,
  TextInput,
  SelectInput,
  IconButton,
} from "@/components/ui/FormWidgets";

export function StatsPanel({ config, onChange }: ConfigPanelProps) {
  const { definitions, bindings } = config.stats;
  const statIds = Object.keys(definitions);

  const patchDef = (id: string, p: Partial<StatDefinition>) =>
    onChange({
      stats: {
        ...config.stats,
        definitions: {
          ...definitions,
          [id]: { ...definitions[id]!, ...p },
        },
      },
    });

  const patchBindings = (p: Partial<StatBindings>) =>
    onChange({
      stats: { ...config.stats, bindings: { ...bindings, ...p } },
    });

  const deleteStat = (id: string) => {
    const next = { ...definitions };
    delete next[id];
    onChange({ stats: { ...config.stats, definitions: next } });
  };

  const [newId, setNewId] = useState("");

  const addStat = useCallback(() => {
    const id = newId.trim().toUpperCase();
    if (!id || definitions[id]) return;
    onChange({
      stats: {
        ...config.stats,
        definitions: {
          ...definitions,
          [id]: {
            id,
            displayName: id,
            abbreviation: id.slice(0, 3),
            description: "",
            baseStat: 10,
          },
        },
      },
    });
    setNewId("");
  }, [newId, definitions, config.stats, onChange]);

  const statOptions = statIds.map((id) => ({
    value: id,
    label: definitions[id]!.displayName,
  }));

  return (
    <>
      <Section
        title="Stat Definitions"
        actions={
          <div className="flex items-center gap-1">
            <input
              className="w-20 rounded border border-border-default bg-bg-primary px-1.5 py-0.5 text-xs text-text-primary outline-none focus:border-accent/50"
              placeholder="NEW_ID"
              value={newId}
              onChange={(e) => setNewId(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") addStat();
              }}
            />
            <IconButton onClick={addStat} title="Add stat">
              +
            </IconButton>
          </div>
        }
      >
        {statIds.length === 0 ? (
          <p className="text-xs text-text-muted">No stats defined</p>
        ) : (
          <div className="flex flex-col gap-3">
            {statIds.map((id) => {
              const def = definitions[id]!;
              return (
                <div
                  key={id}
                  className="rounded border border-border-muted bg-bg-primary p-2"
                >
                  <div className="mb-1.5 flex items-center justify-between">
                    <span className="text-xs font-semibold text-text-primary">
                      {id}
                    </span>
                    <IconButton
                      onClick={() => deleteStat(id)}
                      title="Delete stat"
                      danger
                    >
                      x
                    </IconButton>
                  </div>
                  <div className="flex flex-col gap-1">
                    <FieldRow label="Display Name">
                      <TextInput
                        value={def.displayName}
                        onCommit={(v) => patchDef(id, { displayName: v })}
                      />
                    </FieldRow>
                    <FieldRow label="Abbreviation">
                      <TextInput
                        value={def.abbreviation}
                        onCommit={(v) => patchDef(id, { abbreviation: v })}
                      />
                    </FieldRow>
                    <FieldRow label="Description">
                      <TextInput
                        value={def.description}
                        onCommit={(v) => patchDef(id, { description: v })}
                      />
                    </FieldRow>
                    <FieldRow label="Base Value">
                      <NumberInput
                        value={def.baseStat}
                        onCommit={(v) => patchDef(id, { baseStat: v ?? 10 })}
                        min={0}
                      />
                    </FieldRow>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Section>

      <Section title="Stat Bindings">
        <div className="flex flex-col gap-1.5">
          <FieldRow label="Melee Dmg Stat">
            <SelectInput
              value={bindings.meleeDamageStat}
              onCommit={(v) => patchBindings({ meleeDamageStat: v })}
              options={statOptions}
            />
          </FieldRow>
          <FieldRow label="Melee Divisor">
            <NumberInput
              value={bindings.meleeDamageDivisor}
              onCommit={(v) =>
                patchBindings({ meleeDamageDivisor: v ?? 3 })
              }
              min={1}
            />
          </FieldRow>
          <FieldRow label="Dodge Stat">
            <SelectInput
              value={bindings.dodgeStat}
              onCommit={(v) => patchBindings({ dodgeStat: v })}
              options={statOptions}
            />
          </FieldRow>
          <FieldRow label="Dodge / Point">
            <NumberInput
              value={bindings.dodgePerPoint}
              onCommit={(v) => patchBindings({ dodgePerPoint: v ?? 2 })}
              min={0}
              step={0.1}
            />
          </FieldRow>
          <FieldRow label="Max Dodge %">
            <NumberInput
              value={bindings.maxDodgePercent}
              onCommit={(v) =>
                patchBindings({ maxDodgePercent: v ?? 30 })
              }
              min={0}
              max={100}
            />
          </FieldRow>
          <FieldRow label="Spell Dmg Stat">
            <SelectInput
              value={bindings.spellDamageStat}
              onCommit={(v) => patchBindings({ spellDamageStat: v })}
              options={statOptions}
            />
          </FieldRow>
          <FieldRow label="Spell Divisor">
            <NumberInput
              value={bindings.spellDamageDivisor}
              onCommit={(v) =>
                patchBindings({ spellDamageDivisor: v ?? 3 })
              }
              min={1}
            />
          </FieldRow>
          <FieldRow label="HP Scaling Stat">
            <SelectInput
              value={bindings.hpScalingStat}
              onCommit={(v) => patchBindings({ hpScalingStat: v })}
              options={statOptions}
            />
          </FieldRow>
          <FieldRow label="HP Divisor">
            <NumberInput
              value={bindings.hpScalingDivisor}
              onCommit={(v) =>
                patchBindings({ hpScalingDivisor: v ?? 5 })
              }
              min={1}
            />
          </FieldRow>
          <FieldRow label="Mana Stat">
            <SelectInput
              value={bindings.manaScalingStat}
              onCommit={(v) => patchBindings({ manaScalingStat: v })}
              options={statOptions}
            />
          </FieldRow>
          <FieldRow label="Mana Divisor">
            <NumberInput
              value={bindings.manaScalingDivisor}
              onCommit={(v) =>
                patchBindings({ manaScalingDivisor: v ?? 5 })
              }
              min={1}
            />
          </FieldRow>
          <FieldRow label="HP Regen Stat">
            <SelectInput
              value={bindings.hpRegenStat}
              onCommit={(v) => patchBindings({ hpRegenStat: v })}
              options={statOptions}
            />
          </FieldRow>
          <FieldRow label="HP Regen ms/pt">
            <NumberInput
              value={bindings.hpRegenMsPerPoint}
              onCommit={(v) =>
                patchBindings({ hpRegenMsPerPoint: v ?? 200 })
              }
              min={1}
            />
          </FieldRow>
          <FieldRow label="Mana Regen Stat">
            <SelectInput
              value={bindings.manaRegenStat}
              onCommit={(v) => patchBindings({ manaRegenStat: v })}
              options={statOptions}
            />
          </FieldRow>
          <FieldRow label="Mana Regen ms/pt">
            <NumberInput
              value={bindings.manaRegenMsPerPoint}
              onCommit={(v) =>
                patchBindings({ manaRegenMsPerPoint: v ?? 200 })
              }
              min={1}
            />
          </FieldRow>
          <FieldRow label="XP Bonus Stat">
            <SelectInput
              value={bindings.xpBonusStat}
              onCommit={(v) => patchBindings({ xpBonusStat: v })}
              options={statOptions}
            />
          </FieldRow>
          <FieldRow label="XP / Point">
            <NumberInput
              value={bindings.xpBonusPerPoint}
              onCommit={(v) =>
                patchBindings({ xpBonusPerPoint: v ?? 0.005 })
              }
              min={0}
              step={0.001}
            />
          </FieldRow>
        </div>
      </Section>
    </>
  );
}
