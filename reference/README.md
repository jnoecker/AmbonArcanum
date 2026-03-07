# AmbonMUD Reference Files

These files are copied from the AmbonMUD server codebase for reference when building the Creator tool. The Creator's TypeScript types and validation rules must mirror these Kotlin sources.

## Directory Layout

### `docs/`
- **CREATOR_PLAN.md** — Full design plan for the Creator app
- **WORLD_YAML_SPEC.md** — YAML format specification for world zone files

### `world-yaml-dtos/` (14 files)
Kotlin data classes that define the YAML schema for world zone files. These are the **primary source of truth** for TypeScript type generation.

- `WorldFile.kt` — Top-level zone file: zone name, lifespan, startRoom, rooms, mobs, items, shops, quests, etc.
- `RoomFile.kt` — Room: title, description, exits, features, station, image, video, music, ambient
- `ExitValue.kt` — Exit: target room ID + optional door
- `DoorFile.kt` — Door on an exit: closed/locked state, key item
- `MobFile.kt` — Mob spawn: name, room, tier, level, stats, drops, behavior, dialogue, quests
- `MobDropFile.kt` — Mob drop: item ID + chance percentage
- `ItemFile.kt` — Item: displayName, slot, 6 stats, damage, armor, consumable, onUse, basePrice
- `ShopFile.kt` — Shop: name, room, item list
- `BehaviorFile.kt` — Mob behavior: template + params (patrol, flee, aggro, wander)
- `DialogueNodeFile.kt` — Dialogue tree: text, choices with conditions and actions
- `QuestFile.kt` — Quest: objectives, rewards
- `FeatureFile.kt` — Room feature: CONTAINER/LEVER/SIGN with state, key, items, text
- `GatheringNodeFile.kt` — Gathering node: skill, yields, respawn
- `RecipeFile.kt` — Crafting recipe: skill, materials, output, station

### `domain-model/` (33 files)
Core domain types used throughout the engine. These define enums, value objects, and runtime models.

Key files for TypeScript mirroring:
- `StatBlock.kt` — 6-stat block (str/dex/con/int/wis/cha)
- `ItemSlot.kt` — Equipment slots enum
- `Direction.kt` — Movement directions (N/S/E/W/U/D)
- `Gender.kt` — Gender enum
- `PlayerClassDef.kt` / `RaceDef.kt` — Data-driven class/race definitions (new, from feature branch)
- `PlayerClass.kt` / `Race.kt` — Old enums (being replaced, included for migration reference)
- `DamageRange.kt`, `Rewards.kt`, `Progress.kt` — Value types
- `QuestDef.kt`, `AchievementDef.kt` — Quest/achievement definitions
- `CraftingSkill.kt`, `CraftingStationType.kt`, `GatheringNodeDef.kt`, `RecipeDef.kt` — Crafting types
- `Room.kt`, `World.kt` — Runtime world model (post-loading)
- `MobTemplate.kt`, `MobSpawn.kt`, `MobDrop.kt`, `ItemSpawn.kt`, `ShopDefinition.kt` — Runtime entities
- `RoomFeature.kt`, `FeatureState.kt` — Room feature model

### `config/` (2 files)
- **AppConfig.kt** — Full configuration schema (~33K). Contains all config data classes: abilities, status effects, combat, mob tiers, progression, economy, regen, classes, races. The Creator must parse and write the managed sections.
- **application.yaml** — Default config with all 104 ability definitions, 27 status effects, combat params, mob tiers, progression curve, economy, regen, class/race definitions.

### `registries/` (11 files)
Registry and loader patterns — shows how config is parsed into runtime data. Useful for understanding data relationships.

- `AbilityDefinition.kt` / `AbilityRegistry.kt` / `AbilityRegistryLoader.kt` — Ability system
- `StatusEffectDefinition.kt` / `StatusEffectRegistry.kt` / `StatusEffectRegistryLoader.kt` — Status effects
- `PlayerClassRegistry.kt` / `PlayerClassRegistryLoader.kt` — Class registry (new, from feature branch)
- `RaceRegistry.kt` / `RaceRegistryLoader.kt` — Race registry (new, from feature branch)
- `PlayerProgression.kt` — XP curve, level-up rewards, class-specific HP/mana scaling

### `world-loader/` (1 file)
- **WorldLoader.kt** (~30K) — Parses zone YAML files into the runtime world model. Contains all validation rules that the Creator's client-side validation engine must mirror.

### `example-zones/` (6 files)
Representative zone YAML files showing real-world content and formatting conventions:
- `tutorial_glade.yaml` — Small starter zone with basic rooms, mobs, items
- `ambon_hub.yaml` — Central hub zone with shops, NPCs, exits to other zones
- `demo_ruins.yaml` — Combat-focused zone with mobs, drops, quests
- `low_training_barrens.yaml` — Training zone with mob tiers and behaviors
- `crafting_workshop.yaml` — Crafting-focused zone with gathering nodes, recipes, stations
- `achievements.yaml` — Achievement definitions (different structure — achievement config, not a zone)
