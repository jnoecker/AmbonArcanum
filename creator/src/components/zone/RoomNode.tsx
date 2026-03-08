import { Handle, Position, type NodeProps, type Node } from "@xyflow/react";
import type { RoomNodeData, EntitySprite } from "@/lib/zoneToGraph";
import { useImageSrc } from "@/lib/useImageSrc";

type RoomNodeType = Node<RoomNodeData, "room">;

// ─── Handle definitions ──────────────────────────────────────────────

interface HandleDef {
  id: string;
  position: Position;
  style: React.CSSProperties;
  /** Show a visible "+" button for this handle */
  showPlus?: boolean;
  /** Label for tooltip */
  label: string;
}

/** Cardinal + diagonal handles with visible plus signs on the four walls */
const HANDLES: HandleDef[] = [
  // Cardinal — visible "+" on each wall center
  { id: "n", position: Position.Top, style: { left: "50%" }, showPlus: true, label: "North" },
  { id: "s", position: Position.Bottom, style: { left: "50%" }, showPlus: true, label: "South" },
  { id: "e", position: Position.Right, style: { top: "50%" }, showPlus: true, label: "East" },
  { id: "w", position: Position.Left, style: { top: "50%" }, showPlus: true, label: "West" },
  // Diagonals — invisible connection points
  { id: "ne", position: Position.Top, style: { left: "85%" }, label: "Northeast" },
  { id: "nw", position: Position.Top, style: { left: "15%" }, label: "Northwest" },
  { id: "se", position: Position.Bottom, style: { left: "85%" }, label: "Southeast" },
  { id: "sw", position: Position.Bottom, style: { left: "15%" }, label: "Southwest" },
  // Up/Down — visible "+" at top-right and bottom-left corners
  { id: "u", position: Position.Top, style: { left: "95%" }, showPlus: true, label: "Up" },
  { id: "d", position: Position.Bottom, style: { left: "5%" }, showPlus: true, label: "Down" },
];

const hiddenHandleStyle: React.CSSProperties = {
  width: 6,
  height: 6,
  background: "transparent",
  border: "none",
};

const plusHandleStyle: React.CSSProperties = {
  width: 14,
  height: 14,
  background: "rgba(78, 94, 150, 0.4)",
  border: "1px solid rgba(78, 94, 150, 0.6)",
  borderRadius: 3,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  cursor: "crosshair",
  fontSize: 10,
  color: "rgba(194, 206, 240, 0.6)",
  transition: "all 0.15s",
};

// ─── Sub-components ──────────────────────────────────────────────────

function SpriteThumb({ sprite }: { sprite: EntitySprite }) {
  const src = useImageSrc(sprite.image);
  if (!src) return null;
  return (
    <img
      src={src}
      alt={sprite.name}
      title={`${sprite.kind}: ${sprite.name}`}
      className="h-6 w-6 rounded-sm border border-border-default/50 object-cover"
    />
  );
}

function RoomBackground({ image }: { image?: string }) {
  const src = useImageSrc(image);
  if (!src) return null;
  return (
    <img
      src={src}
      alt=""
      className="pointer-events-none absolute inset-0 h-full w-full rounded object-cover opacity-25"
    />
  );
}

// ─── RoomNode ────────────────────────────────────────────────────────

export function RoomNode({ data, selected }: NodeProps<RoomNodeType>) {
  const d = data as RoomNodeData;

  return (
    <div
      className={`group/room relative overflow-hidden rounded border px-3 py-2 transition-colors ${
        selected
          ? "border-accent bg-bg-elevated shadow-lg shadow-accent/20"
          : d.isStartRoom
            ? "border-accent/50 bg-bg-elevated"
            : "border-border-default bg-bg-elevated"
      }`}
      style={{ width: 220 }}
    >
      {/* Room background image */}
      <RoomBackground image={d.image} />

      {/* Source handles (drag from these to create exits) */}
      {HANDLES.map((h) => (
        <Handle
          key={`source-${h.id}`}
          type="source"
          position={h.position}
          id={`source-${h.id}`}
          title={h.label}
          isConnectable
          className={h.showPlus ? "room-handle-plus" : ""}
          style={h.showPlus ? { ...plusHandleStyle, ...h.style } : { ...hiddenHandleStyle, ...h.style }}
        />
      ))}

      {/* Target handles (invisible — receive connections) */}
      {HANDLES.map((h) => (
        <Handle
          key={`target-${h.id}`}
          type="target"
          position={h.position}
          id={`target-${h.id}`}
          style={{ ...hiddenHandleStyle, ...h.style }}
          isConnectable
        />
      ))}

      {/* Title row */}
      <div className="relative flex items-center gap-1.5">
        {d.isStartRoom && (
          <span className="text-accent text-xs" title="Start room">
            ★
          </span>
        )}
        <span className="truncate text-xs font-medium text-text-primary">
          {d.title}
        </span>
      </div>

      {/* Room ID */}
      <div className="relative truncate text-[10px] text-text-muted">{d.roomId}</div>

      {/* Entity sprites */}
      {d.entities.length > 0 && (
        <div className="relative mt-1 flex flex-wrap gap-1">
          {d.entities.map((e) => (
            <SpriteThumb key={`${e.kind}:${e.id}`} sprite={e} />
          ))}
        </div>
      )}

      {/* Entity badges (for entities without images) */}
      {(d.mobCount > 0 || d.itemCount > 0 || d.shopCount > 0 || d.station) && (
        <div className="relative mt-1 flex items-center gap-2 text-[10px] text-text-muted">
          {d.mobCount > 0 && <span title="Mobs">⚔{d.mobCount}</span>}
          {d.itemCount > 0 && <span title="Items">◆{d.itemCount}</span>}
          {d.shopCount > 0 && <span title="Shops">⛋{d.shopCount}</span>}
          {d.station && (
            <span className="text-status-info" title={`Station: ${d.station}`}>
              ⚒
            </span>
          )}
        </div>
      )}
    </div>
  );
}
