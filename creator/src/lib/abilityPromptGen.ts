import { invoke } from "@tauri-apps/api/core";
import { STYLE_SUFFIX } from "./arcanumPrompts";
import type { AbilityDefinitionConfig, StatusEffectDefinitionConfig } from "@/types/config";

const FORMAT_SPEC =
  "1:1 square ability icon centered in frame, symbolic/iconic representation, solid pale lavender (#d8d0e8) background";

const SYSTEM_PROMPT = `You are an expert image prompt engineer for AI image generators. You create prompts for fantasy RPG ability/spell/status-effect icons in the Surreal Gentle Magic design system.

Your task: given a game ability or status effect definition, create an image generation prompt for a symbolic icon. The icon should:
- Be a single centered symbolic/iconic illustration (NOT a scene, NOT a character portrait)
- Visually represent the ability's effect and flavor through symbolic imagery
- Use color cues matching the ability's class. Each class has a distinct color identity:
  - BULWARK: warm golds (#bea873), amber, burnished bronze — stalwart shields, fortified barriers, golden radiance
  - WARDEN: terracotta (#c4956a), warm earth tones, burnt sienna — natural protection, earthen strength, organic resilience
  - ARCANIST: soft lavender (#a897d2), pale violet, crystalline whites — arcane geometry, shimmering runes, ethereal energy
  - FAEWEAVER: moss green (#8da97b), verdant emerald, living wood — woven vines, sprouting magic, natural enchantment
  - NECROMANCER: ghostly sage (#7a8a6e), pallid green-gray, spectral mist — soul wisps, bone motifs, deathly stillness
  - VEIL: deep purple (#6e5a8a), midnight indigo, smoky shadow — hidden daggers, dissipating smoke, void rifts
  - BINDER: amber-gold (#bea873), warm chain-links, luminous sigils — binding circles, golden chains, sealing runes
  - STORMBLADE: pale blue (#8caec9), silver-white, electric frost — crackling arcs, frozen edges, storm winds
  - HERALD: warm ivory-gold (#d4c8a0), soft radiance, sacred light — holy symbols, healing auras, divine warmth
  - STARWEAVER: dusty rose (#b88faa), cosmic pink, starlight silver — celestial patterns, constellation threads, astral shimmer
- Effect type modifiers (combine with the class palette above):
  - Healing/regeneration: warm golden-white light, green life energy
  - Shields/protection: translucent barriers, dome shapes, soft glowing edges
  - Damage-over-time: smoldering embers, dripping venom, crackling energy
  - Stun/crowd-control: stars, shattered glass, frozen shards
  - Buffs: ascending arrows, radiant auras, empowering glows
  - Debuffs: descending spirals, dark mists, weakening auras
  - Area effects: radiating rings, expanding waves, ground sigils
  - Taunt/threat: blazing eye motifs, roaring silhouettes, magnetic pull
- Combine the class palette with the effect modifier — e.g., a Faeweaver heal uses living greens with golden-white life energy; a Veil damage-over-time uses deep indigos with smoldering shadow embers
- For abilities without a class, default to the effect type modifier colors above
- Status effects use moss green (#8da97b) as their base palette, with secondary colors reflecting the effect type
- AVOID depicting full characters, hands, or faces — keep it iconic and symbolic
- The icon should read clearly at small sizes (256x256)

Output ONLY the prompt text — no labels, no markdown, no commentary.`;

/**
 * Generate an image prompt for an ability/spell icon.
 */
export async function generateAbilityPrompt(
  ability: AbilityDefinitionConfig,
  _abilityId: string,
): Promise<string> {
  const userContent = `Format: ${FORMAT_SPEC}

Ability: ${ability.displayName}
${ability.description ? `Description: ${ability.description}` : ""}
${ability.requiredClass ? `Class: ${ability.requiredClass}` : ""}
Target: ${ability.targetType}
Effect type: ${ability.effect.type}
Level: ${ability.levelRequired}

Required style suffix (include verbatim at the end):
${STYLE_SUFFIX}`;

  return invoke<string>("llm_complete", {
    systemPrompt: SYSTEM_PROMPT,
    userPrompt: userContent,
  });
}

/**
 * Generate an image prompt for a status effect icon.
 */
export async function generateStatusEffectPrompt(
  effect: StatusEffectDefinitionConfig,
  _effectId: string,
): Promise<string> {
  const details = [
    `Effect type: ${effect.effectType}`,
    effect.durationMs ? `Duration: ${(effect.durationMs / 1000).toFixed(0)}s` : null,
    effect.shieldAmount ? `Shield amount: ${effect.shieldAmount}` : null,
    effect.tickMinValue != null ? `Tick damage/heal: ${effect.tickMinValue}-${effect.tickMaxValue}` : null,
    effect.stackBehavior ? `Stacking: ${effect.stackBehavior}` : null,
  ].filter(Boolean).join("\n");

  const userContent = `Format: ${FORMAT_SPEC}

Status Effect: ${effect.displayName}
${details}

Required style suffix (include verbatim at the end):
${STYLE_SUFFIX}`;

  return invoke<string>("llm_complete", {
    systemPrompt: SYSTEM_PROMPT,
    userPrompt: userContent,
  });
}
