import { useState } from "react";
import type { ConfigPanelProps } from "./types";
import { Section } from "@/components/ui/FormWidgets";
import { useImageSrc } from "@/lib/useImageSrc";

function AssetThumbnail({ filename }: { filename: string }) {
  const src = useImageSrc(filename);
  if (!src) {
    return (
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded border border-border-default bg-bg-primary text-[8px] text-text-muted">
        ?
      </div>
    );
  }
  return (
    <img
      src={src}
      alt=""
      className="h-10 w-10 shrink-0 rounded border border-border-default object-cover"
    />
  );
}

export function GlobalAssetsPanel({ config, onChange }: ConfigPanelProps) {
  const assets = config.globalAssets;
  const [newKey, setNewKey] = useState("");

  const updateAssets = (next: Record<string, string>) => {
    onChange({ globalAssets: next });
  };

  const handleAdd = () => {
    const key = newKey.trim().toLowerCase().replace(/\s+/g, "_");
    if (!key || key in assets) return;
    updateAssets({ ...assets, [key]: "" });
    setNewKey("");
  };

  const handleRemove = (key: string) => {
    const next = { ...assets };
    delete next[key];
    updateAssets(next);
  };

  const handleValueChange = (key: string, value: string) => {
    updateAssets({ ...assets, [key]: value });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAdd();
    }
  };

  const sortedEntries = Object.entries(assets).sort(([a], [b]) =>
    a.localeCompare(b),
  );

  return (
    <>
      <Section title="Global Assets">
        <p className="mb-3 text-xs text-text-secondary">
          Key-value pairs saved to <code className="font-mono text-accent">application.yaml</code> under{" "}
          <code className="font-mono text-accent">ambonmud.globalAssets</code>.
          Use the asset generator to create images, then register them here by key name.
        </p>

        {/* Add new */}
        <div className="mb-4 flex items-center gap-2">
          <input
            type="text"
            value={newKey}
            onChange={(e) => setNewKey(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="new_asset_key"
            className="flex-1 rounded border border-border-default bg-bg-primary px-3 py-1.5 font-mono text-xs text-text-primary placeholder:text-text-muted outline-none focus:border-accent/50"
          />
          <button
            onClick={handleAdd}
            disabled={!newKey.trim()}
            className="rounded bg-gradient-to-r from-accent-muted to-accent px-3 py-1.5 text-xs font-medium text-accent-emphasis transition-all hover:shadow-[var(--glow-aurum)] hover:brightness-110 disabled:opacity-40"
          >
            + Add
          </button>
        </div>

        {/* Asset list */}
        {sortedEntries.length === 0 ? (
          <p className="py-4 text-center text-xs italic text-text-muted">
            No global assets registered. Generate art and save it as a global asset, or add a key above.
          </p>
        ) : (
          <div className="flex flex-col gap-2">
            {sortedEntries.map(([key, value]) => (
              <div
                key={key}
                className="flex items-center gap-3 rounded border border-border-default bg-bg-primary/50 px-3 py-2"
              >
                <AssetThumbnail filename={value} />
                <div className="flex min-w-0 flex-1 flex-col gap-1">
                  <span className="font-mono text-xs font-medium text-accent">
                    {key}
                  </span>
                  <input
                    type="text"
                    value={value}
                    onChange={(e) => handleValueChange(key, e.target.value)}
                    placeholder="filename.png (e.g. abc123def456.png)"
                    className="w-full rounded border border-border-default bg-bg-primary px-2 py-1 font-mono text-[11px] text-text-secondary placeholder:text-text-muted outline-none focus:border-accent/50"
                  />
                </div>
                <button
                  onClick={() => handleRemove(key)}
                  className="shrink-0 rounded px-2 py-1 text-xs text-text-muted transition-colors hover:bg-status-error/20 hover:text-status-error"
                  title="Remove asset"
                >
                  &times;
                </button>
              </div>
            ))}
          </div>
        )}
      </Section>
    </>
  );
}
