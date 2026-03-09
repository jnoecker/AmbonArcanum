import { useState } from "react";
import type { ConfigPanelProps, AppConfig } from "./types";
import { Section, FieldRow, TextInput, NumberInput } from "@/components/ui/FormWidgets";

export function ImagesPanel({ config, onChange }: ConfigPanelProps) {
  const img = config.images;
  const patch = (p: Partial<AppConfig["images"]>) =>
    onChange({ images: { ...img, ...p } });

  const [tierDraft, setTierDraft] = useState(img.spriteLevelTiers.join(", "));

  const commitTiers = (value: string) => {
    const nums = value
      .split(/[,\s]+/)
      .map(Number)
      .filter((n) => !isNaN(n) && n > 0)
      .sort((a, b) => b - a);
    if (nums.length > 0) {
      patch({ spriteLevelTiers: nums });
      setTierDraft(nums.join(", "));
    }
  };

  return (
    <>
      <Section
        title="Image Serving"
        description="Base URL for serving images to the game client. In production this typically points to your CDN or Cloudflare R2 custom domain."
      >
        <div className="flex flex-col gap-1.5">
          <FieldRow label="Base URL" hint="URL prefix for all image assets. Use '/images/' for local serving, or a full CDN URL like 'https://assets.yourgame.com/' for production.">
            <TextInput
              value={img.baseUrl}
              onCommit={(v) => patch({ baseUrl: v || "/images/" })}
              placeholder="/images/"
            />
          </FieldRow>
        </div>
      </Section>

      <Section
        title="Player Sprite Tiers"
        description="Player characters use different sprite art at different level ranges, giving visual progression as they advance. The server picks the highest tier threshold at or below the player's level."
      >
        <p className="mb-2 text-[10px] text-text-muted">
          Level breakpoints for player sprite art. Sprites use the filename
          format:{" "}
          <code className="font-mono">
            player_sprites/race_gender_class_l&#123;tier&#125;.png
          </code>
        </p>
        <div className="flex flex-col gap-1.5">
          <FieldRow label="Level Tiers" hint="Comma-separated descending thresholds. Level 25 matches l20 (highest threshold at or below level). More tiers = more visual variety.">
            <TextInput
              value={tierDraft}
              onCommit={commitTiers}
              placeholder="50, 40, 30, 20, 10, 1"
            />
          </FieldRow>
          <FieldRow label="Staff Tier" hint="Special tier used for staff/admin sprites. Default 60 is above the normal max (50) so staff always look distinct.">
            <NumberInput
              value={img.staffSpriteTier}
              onCommit={(v) => patch({ staffSpriteTier: v ?? 60 })}
              min={1}
            />
          </FieldRow>
        </div>
      </Section>
    </>
  );
}
