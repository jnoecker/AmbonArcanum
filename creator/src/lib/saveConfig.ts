import { readTextFile, writeTextFile } from "@tauri-apps/plugin-fs";
import { parseDocument } from "yaml";
import { useConfigStore } from "@/stores/configStore";

/**
 * Save the current AppConfig back to application.yaml.
 * Reads the existing file, patches known sections in-place, and writes back.
 */
export async function saveConfig(mudDir: string): Promise<void> {
  const state = useConfigStore.getState();
  const config = state.config;
  if (!config) throw new Error("No config loaded");

  const configPath = `${mudDir}/src/main/resources/application.yaml`;
  const content = await readTextFile(configPath);
  const doc = parseDocument(content);

  // Navigate to the ambonmud root node
  const root = doc.get("ambonmud", true) as any;
  if (!root) throw new Error("Missing 'ambonmud' root in application.yaml");

  // ─── Server ─────────────────────────────────────────────────
  setIn(root, ["server", "telnetPort"], config.server.telnetPort);
  setIn(root, ["server", "webPort"], config.server.webPort);

  // ─── Engine sections ────────────────────────────────────────
  const engine = root.get("engine", true);
  if (engine) {
    // Combat
    setIn(engine, ["combat", "maxCombatsPerTick"], config.combat.maxCombatsPerTick);
    setIn(engine, ["combat", "tickMillis"], config.combat.tickMillis);
    setIn(engine, ["combat", "minDamage"], config.combat.minDamage);
    setIn(engine, ["combat", "maxDamage"], config.combat.maxDamage);
    setIn(engine, ["combat", "feedback", "enabled"], config.combat.feedback.enabled);
    setIn(engine, ["combat", "feedback", "roomBroadcastEnabled"], config.combat.feedback.roomBroadcastEnabled);

    // Mob tiers
    for (const tier of ["weak", "standard", "elite", "boss"] as const) {
      const t = config.mobTiers[tier];
      for (const [key, val] of Object.entries(t)) {
        setIn(engine, ["mob", "tiers", tier, key], val);
      }
    }

    // Economy
    setIn(engine, ["economy", "buyMultiplier"], config.economy.buyMultiplier);
    setIn(engine, ["economy", "sellMultiplier"], config.economy.sellMultiplier);

    // Regen
    setIn(engine, ["regen", "maxPlayersPerTick"], config.regen.maxPlayersPerTick);
    setIn(engine, ["regen", "baseIntervalMillis"], config.regen.baseIntervalMillis);
    setIn(engine, ["regen", "minIntervalMillis"], config.regen.minIntervalMillis);
    setIn(engine, ["regen", "regenAmount"], config.regen.regenAmount);
    setIn(engine, ["regen", "mana", "baseIntervalMillis"], config.regen.mana.baseIntervalMillis);
    setIn(engine, ["regen", "mana", "minIntervalMillis"], config.regen.mana.minIntervalMillis);
    setIn(engine, ["regen", "mana", "regenAmount"], config.regen.mana.regenAmount);

    // Crafting
    setIn(engine, ["crafting", "maxSkillLevel"], config.crafting.maxSkillLevel);
    setIn(engine, ["crafting", "baseXpPerLevel"], config.crafting.baseXpPerLevel);
    setIn(engine, ["crafting", "xpExponent"], config.crafting.xpExponent);
    setIn(engine, ["crafting", "gatherCooldownMs"], config.crafting.gatherCooldownMs);
    setIn(engine, ["crafting", "stationBonusQuantity"], config.crafting.stationBonusQuantity);

    // Group
    setIn(engine, ["group", "maxSize"], config.group.maxSize);
    setIn(engine, ["group", "inviteTimeoutMs"], config.group.inviteTimeoutMs);
    setIn(engine, ["group", "xpBonusPerMember"], config.group.xpBonusPerMember);
  }

  // ─── Progression ────────────────────────────────────────────
  setIn(root, ["progression", "maxLevel"], config.progression.maxLevel);
  setIn(root, ["progression", "xp", "baseXp"], config.progression.xp.baseXp);
  setIn(root, ["progression", "xp", "exponent"], config.progression.xp.exponent);
  setIn(root, ["progression", "xp", "linearXp"], config.progression.xp.linearXp);
  setIn(root, ["progression", "xp", "multiplier"], config.progression.xp.multiplier);
  setIn(root, ["progression", "xp", "defaultKillXp"], config.progression.xp.defaultKillXp);
  setIn(root, ["progression", "rewards", "hpPerLevel"], config.progression.rewards.hpPerLevel);
  setIn(root, ["progression", "rewards", "manaPerLevel"], config.progression.rewards.manaPerLevel);
  setIn(root, ["progression", "rewards", "fullHealOnLevelUp"], config.progression.rewards.fullHealOnLevelUp);
  setIn(root, ["progression", "rewards", "fullManaOnLevelUp"], config.progression.rewards.fullManaOnLevelUp);

  await writeTextFile(configPath, doc.toString());
  state.markClean();
}

/**
 * Set a value at a nested YAML path, creating intermediate maps if needed.
 * Works with the yaml library's Document/YAMLMap nodes.
 */
function setIn(node: any, path: string[], value: unknown): void {
  let current = node;
  for (let i = 0; i < path.length - 1; i++) {
    let child = current.get(path[i], true);
    if (!child) {
      current.set(path[i], {});
      child = current.get(path[i], true);
    }
    current = child;
  }
  current.set(path[path.length - 1], value);
}
