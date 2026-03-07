import { useState, useCallback } from "react";
import type { WorldFile, ExitValue } from "@/types/world";
import { updateRoom, deleteRoom, deleteExit } from "@/lib/zoneEdits";

interface RoomPanelProps {
  zoneId: string;
  roomId: string;
  world: WorldFile;
  onWorldChange: (world: WorldFile) => void;
  onRoomDeleted: () => void;
}

function resolveExitTarget(exit: string | ExitValue): {
  target: string;
  hasDoor: boolean;
  isLocked: boolean;
  keyItem?: string;
} {
  if (typeof exit === "string") {
    return { target: exit, hasDoor: false, isLocked: false };
  }
  return {
    target: exit.to,
    hasDoor: !!exit.door,
    isLocked: !!exit.door?.locked,
    keyItem: exit.door?.key,
  };
}

export function RoomPanel({
  zoneId,
  roomId,
  world,
  onWorldChange,
  onRoomDeleted,
}: RoomPanelProps) {
  const room = world.rooms[roomId];
  if (!room) return null;

  const isStartRoom = roomId === world.startRoom;

  const exits = Object.entries(room.exits ?? {}).map(([dir, val]) => ({
    direction: dir,
    ...resolveExitTarget(val),
  }));

  // Find entities in this room
  const mobs = Object.entries(world.mobs ?? {}).filter(
    ([, m]) => m.room === roomId,
  );
  const items = Object.entries(world.items ?? {}).filter(
    ([, i]) => i.room === roomId,
  );
  const shops = Object.entries(world.shops ?? {}).filter(
    ([, s]) => s.room === roomId,
  );
  const gatheringNodes = Object.entries(world.gatheringNodes ?? {}).filter(
    ([, g]) => g.room === roomId,
  );
  const quests = Object.entries(world.quests ?? {}).filter(([, q]) => {
    const giverMob = Object.entries(world.mobs ?? {}).find(
      ([mobId]) => mobId === q.giver || `${zoneId}:${mobId}` === q.giver,
    );
    return giverMob && giverMob[1].room === roomId;
  });

  const handleFieldChange = useCallback(
    (field: "title" | "description" | "station", value: string) => {
      const patch =
        field === "station" && value === ""
          ? { station: undefined }
          : { [field]: value };
      onWorldChange(updateRoom(world, roomId, patch));
    },
    [world, roomId, onWorldChange],
  );

  const handleDeleteExit = useCallback(
    (direction: string) => {
      onWorldChange(deleteExit(world, roomId, direction));
    },
    [world, roomId, onWorldChange],
  );

  const handleDeleteRoom = useCallback(() => {
    try {
      const next = deleteRoom(world, roomId);
      onWorldChange(next);
      onRoomDeleted();
    } catch {
      // Cannot delete start room — error is swallowed, button is hidden anyway
    }
  }, [world, roomId, onWorldChange, onRoomDeleted]);

  return (
    <div className="flex w-72 shrink-0 flex-col overflow-y-auto border-l border-border-default bg-bg-secondary">
      {/* Header */}
      <div className="border-b border-border-default px-4 py-3">
        <EditableField
          value={room.title}
          onCommit={(v) => handleFieldChange("title", v)}
          className="text-sm font-semibold text-text-primary"
        />
        <p className="mt-0.5 text-xs text-text-muted">{roomId}</p>
        {isStartRoom && (
          <span className="mt-1 inline-block rounded bg-accent/20 px-1.5 py-0.5 text-[10px] font-medium text-accent">
            Start Room
          </span>
        )}
      </div>

      {/* Description */}
      <Section title="Description">
        <EditableTextArea
          value={room.description}
          onCommit={(v) => handleFieldChange("description", v)}
        />
      </Section>

      {/* Exits */}
      <Section title="Exits">
        {exits.length === 0 ? (
          <p className="text-xs text-text-muted">No exits</p>
        ) : (
          <table className="w-full text-xs">
            <tbody>
              {exits.map((exit) => (
                <tr key={exit.direction} className="group border-b border-border-muted last:border-0">
                  <td className="py-1 pr-2 font-medium text-text-primary">
                    {exit.direction.toUpperCase()}
                  </td>
                  <td className="py-1 text-text-secondary">
                    <span className={exit.target.includes(":") ? "text-accent" : ""}>
                      {exit.target}
                    </span>
                    {exit.hasDoor && (
                      <span className="ml-1 text-status-warning">
                        {exit.isLocked ? "\uD83D\uDD12" : "\uD83D\uDEAA"}
                      </span>
                    )}
                  </td>
                  <td className="w-6 py-1 text-right">
                    <button
                      onClick={() => handleDeleteExit(exit.direction)}
                      className="invisible text-text-muted transition-colors hover:text-status-danger group-hover:visible"
                      title="Delete exit"
                    >
                      &times;
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Section>

      {/* Station */}
      <Section title="Crafting Station">
        <EditableField
          value={room.station ?? ""}
          onCommit={(v) => handleFieldChange("station", v)}
          placeholder="none"
          className="text-xs text-status-info"
        />
      </Section>

      {/* Mobs */}
      {mobs.length > 0 && (
        <Section title={`Mobs (${mobs.length})`}>
          <ul className="flex flex-col gap-1">
            {mobs.map(([id, mob]) => (
              <li key={id} className="text-xs text-text-secondary">
                <span className="font-medium text-text-primary">{mob.name}</span>
                <span className="ml-1 text-text-muted">
                  {mob.tier ?? "standard"} L{mob.level ?? 1}
                </span>
              </li>
            ))}
          </ul>
        </Section>
      )}

      {/* Items */}
      {items.length > 0 && (
        <Section title={`Items (${items.length})`}>
          <ul className="flex flex-col gap-1">
            {items.map(([id, item]) => (
              <li key={id} className="text-xs text-text-secondary">
                <span className="font-medium text-text-primary">
                  {item.displayName}
                </span>
                {item.slot && (
                  <span className="ml-1 text-text-muted">[{item.slot}]</span>
                )}
              </li>
            ))}
          </ul>
        </Section>
      )}

      {/* Shops */}
      {shops.length > 0 && (
        <Section title={`Shops (${shops.length})`}>
          <ul className="flex flex-col gap-1">
            {shops.map(([id, shop]) => (
              <li key={id} className="text-xs text-text-secondary">
                <span className="font-medium text-text-primary">{shop.name}</span>
                <span className="ml-1 text-text-muted">
                  ({shop.items?.length ?? 0} items)
                </span>
              </li>
            ))}
          </ul>
        </Section>
      )}

      {/* Gathering Nodes */}
      {gatheringNodes.length > 0 && (
        <Section title={`Gathering (${gatheringNodes.length})`}>
          <ul className="flex flex-col gap-1">
            {gatheringNodes.map(([id, node]) => (
              <li key={id} className="text-xs text-text-secondary">
                <span className="font-medium text-text-primary">
                  {node.displayName}
                </span>
                <span className="ml-1 text-text-muted">{node.skill}</span>
              </li>
            ))}
          </ul>
        </Section>
      )}

      {/* Quests */}
      {quests.length > 0 && (
        <Section title={`Quests (${quests.length})`}>
          <ul className="flex flex-col gap-1">
            {quests.map(([id, quest]) => (
              <li key={id} className="text-xs text-text-secondary">
                <span className="font-medium text-text-primary">{quest.name}</span>
              </li>
            ))}
          </ul>
        </Section>
      )}

      {/* Media */}
      <Section title="Media">
        {room.image && (
          <p className="text-xs text-text-muted">Image: {room.image}</p>
        )}
        {room.music && (
          <p className="text-xs text-text-muted">Music: {room.music}</p>
        )}
        {room.ambient && (
          <p className="text-xs text-text-muted">Ambient: {room.ambient}</p>
        )}
        {room.audio && (
          <p className="text-xs text-text-muted">Audio: {room.audio}</p>
        )}
        {!room.image && !room.music && !room.ambient && !room.audio && (
          <p className="text-xs text-text-muted">None</p>
        )}
      </Section>

      {/* Delete Room */}
      {!isStartRoom && (
        <div className="px-4 py-3">
          <button
            onClick={handleDeleteRoom}
            className="w-full rounded border border-status-danger/40 px-2 py-1.5 text-xs text-status-danger transition-colors hover:bg-status-danger/10"
          >
            Delete Room
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Inline editing components ───────────────────────────────────────

function EditableField({
  value,
  onCommit,
  placeholder,
  className,
}: {
  value: string;
  onCommit: (value: string) => void;
  placeholder?: string;
  className?: string;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);

  if (!editing) {
    return (
      <div
        className={`cursor-text rounded px-1 -mx-1 hover:bg-bg-tertiary ${className ?? ""}`}
        onClick={() => {
          setDraft(value);
          setEditing(true);
        }}
        title="Click to edit"
      >
        {value || <span className="text-text-muted">{placeholder ?? "empty"}</span>}
      </div>
    );
  }

  return (
    <input
      autoFocus
      className={`w-full rounded border border-accent/50 bg-bg-primary px-1 -mx-1 outline-none ${className ?? ""}`}
      value={draft}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={() => {
        setEditing(false);
        if (draft !== value) onCommit(draft);
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          setEditing(false);
          if (draft !== value) onCommit(draft);
        }
        if (e.key === "Escape") {
          setEditing(false);
          setDraft(value);
        }
      }}
    />
  );
}

function EditableTextArea({
  value,
  onCommit,
}: {
  value: string;
  onCommit: (value: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);

  if (!editing) {
    return (
      <div
        className="cursor-text rounded px-1 -mx-1 text-xs leading-relaxed text-text-secondary hover:bg-bg-tertiary"
        onClick={() => {
          setDraft(value);
          setEditing(true);
        }}
        title="Click to edit"
      >
        {value || <span className="text-text-muted">empty</span>}
      </div>
    );
  }

  return (
    <textarea
      autoFocus
      rows={4}
      className="w-full resize-y rounded border border-accent/50 bg-bg-primary px-1 -mx-1 text-xs leading-relaxed text-text-secondary outline-none"
      value={draft}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={() => {
        setEditing(false);
        if (draft !== value) onCommit(draft);
      }}
      onKeyDown={(e) => {
        if (e.key === "Escape") {
          setEditing(false);
          setDraft(value);
        }
      }}
    />
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="border-b border-border-muted px-4 py-3">
      <h4 className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-text-muted">
        {title}
      </h4>
      {children}
    </div>
  );
}
