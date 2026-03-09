import type { ConfigPanelProps, AppConfig } from "./types";
import { Section, FieldRow, NumberInput } from "@/components/ui/FormWidgets";

export function ServerPanel({ config, onChange }: ConfigPanelProps) {
  const s = config.server;
  const patch = (p: Partial<AppConfig["server"]>) =>
    onChange({ server: { ...s, ...p } });

  return (
    <>
      <Section
        title="Network"
        description="Ports the AmbonMUD server listens on. Telnet is for traditional MUD clients; the web port serves the browser-based client and REST API. Avoid conflicts with other services on the host machine."
      >
        <div className="flex flex-col gap-1.5">
          <FieldRow label="Telnet Port" hint="Classic MUD client connections. Standard MUD port is 4000. Use 23 for the well-known telnet port, though it may require elevated privileges.">
            <NumberInput
              value={s.telnetPort}
              onCommit={(v) => patch({ telnetPort: v ?? 4000 })}
              min={1}
              max={65535}
            />
          </FieldRow>
          <FieldRow label="Web Port" hint="HTTP port for the web client and API. Default 8080 avoids requiring admin privileges. Use 80 or 443 for production behind a reverse proxy.">
            <NumberInput
              value={s.webPort}
              onCommit={(v) => patch({ webPort: v ?? 8080 })}
              min={1}
              max={65535}
            />
          </FieldRow>
        </div>
      </Section>
    </>
  );
}
