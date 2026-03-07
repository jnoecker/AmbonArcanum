import { Command } from "@tauri-apps/plugin-shell";

export interface PreflightResult {
  passed: boolean;
  javaVersion: string | null;
  javaError: string | null;
  portConflicts: PortConflict[];
}

export interface PortConflict {
  port: number;
  label: string;
}

/**
 * Detect Java version by running `java -version`.
 * Returns the version string (e.g. "21.0.1") or null if Java is not found.
 */
async function detectJava(): Promise<{ version: string | null; error: string | null }> {
  try {
    const output = await Command.create("cmd", ["/C", "java", "-version"]).execute();
    // java -version prints to stderr
    const text = output.stderr || output.stdout;
    const match = text.match(/version "(\d+(?:\.\d+)*)/);
    if (match) {
      const version = match[1]!;
      const major = parseInt(version.split(".")[0]!, 10);
      if (major < 21) {
        return { version, error: `Java ${major} found, but Java 21+ is required` };
      }
      return { version, error: null };
    }
    return { version: null, error: "Could not parse Java version from output" };
  } catch {
    return { version: null, error: "Java not found. Ensure Java 21+ is installed and on PATH." };
  }
}

/**
 * Check if a port is in use by attempting `netstat` lookup.
 */
async function checkPort(port: number): Promise<boolean> {
  try {
    const output = await Command.create("cmd", [
      "/C", "netstat", "-ano", "-p", "TCP",
    ]).execute();
    const lines = output.stdout.split("\n");
    return lines.some((line) =>
      line.includes(`:${port} `) && line.includes("LISTENING"),
    );
  } catch {
    // If netstat fails, assume port is free
    return false;
  }
}

/**
 * Run all pre-flight checks before starting the server.
 */
export async function runPreflightChecks(
  telnetPort: number,
  webPort: number,
): Promise<PreflightResult> {
  const java = await detectJava();

  const portConflicts: PortConflict[] = [];
  if (await checkPort(telnetPort)) {
    portConflicts.push({ port: telnetPort, label: "Telnet" });
  }
  if (await checkPort(webPort)) {
    portConflicts.push({ port: webPort, label: "Web" });
  }

  return {
    passed: java.error === null && portConflicts.length === 0,
    javaVersion: java.version,
    javaError: java.error,
    portConflicts,
  };
}
