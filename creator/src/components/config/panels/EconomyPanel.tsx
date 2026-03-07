import type { AppConfig } from "@/types/config";
import { Section, FieldRow, NumberInput } from "@/components/ui/FormWidgets";

interface PanelProps {
  config: AppConfig;
  onChange: (patch: Partial<AppConfig>) => void;
}

export function EconomyPanel({ config, onChange }: PanelProps) {
  const e = config.economy;
  const patch = (p: Partial<AppConfig["economy"]>) =>
    onChange({ economy: { ...e, ...p } });

  return (
    <>
      <Section title="Multipliers">
        <div className="flex flex-col gap-1.5">
          <FieldRow label="Buy Multiplier">
            <NumberInput
              value={e.buyMultiplier}
              onCommit={(v) => patch({ buyMultiplier: v ?? 1.0 })}
              min={0}
              step={0.1}
            />
          </FieldRow>
          <FieldRow label="Sell Multiplier">
            <NumberInput
              value={e.sellMultiplier}
              onCommit={(v) => patch({ sellMultiplier: v ?? 0.5 })}
              min={0}
              step={0.1}
            />
          </FieldRow>
        </div>
      </Section>
    </>
  );
}
