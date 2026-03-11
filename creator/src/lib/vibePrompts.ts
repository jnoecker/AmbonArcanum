import type { WorldFile } from "@/types/world";
import { STYLE_GUIDE_REFERENCE } from "./arcanumPrompts";

/** System prompt for the vibe generation LLM, incorporating the full Surreal Gentle Magic design system. */
export const VIBE_SYSTEM_PROMPT = `You are an art director for a fantasy MUD game working within the Surreal Gentle Magic design system.

${STYLE_GUIDE_REFERENCE}

Given a list of room descriptions from a zone, produce a 2-3 sentence atmosphere/vibe summary that captures the zone's overall visual identity AS IT WOULD APPEAR in the Surreal Gentle Magic style. Focus on lighting, mood, dominant colors from the approved palette, and environmental feel. Even if the zone descriptions reference modern or mundane settings, describe the vibe as it would look after being transformed into this dreamy, painterly aesthetic. Be evocative but concise.`;

/** Build a summary of zone content for the vibe generation LLM. */
export function buildVibeInput(world: WorldFile): string {
  const parts: string[] = [];

  parts.push(`Zone: ${world.zone}`);

  if (world.rooms) {
    const roomSummaries = Object.entries(world.rooms).map(([id, room]) => {
      const desc = room.description ? ` — ${room.description}` : "";
      return `  ${room.title ?? id}${desc}`;
    });
    parts.push(`Rooms:\n${roomSummaries.join("\n")}`);
  }

  if (world.mobs) {
    const mobNames = Object.entries(world.mobs).map(
      ([id, mob]) => `  ${mob.name ?? id} (${mob.tier ?? "standard"}, level ${mob.level ?? 1})`,
    );
    parts.push(`Mobs:\n${mobNames.join("\n")}`);
  }

  if (world.items) {
    const itemNames = Object.entries(world.items).map(
      ([id, item]) => `  ${item.displayName ?? id}`,
    );
    parts.push(`Items:\n${itemNames.join("\n")}`);
  }

  if (world.shops) {
    const shopNames = Object.entries(world.shops).map(
      ([id, shop]) => `  ${shop.name ?? id}`,
    );
    parts.push(`Shops:\n${shopNames.join("\n")}`);
  }

  return parts.join("\n\n");
}
