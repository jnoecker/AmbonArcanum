import { useState } from "react";
import { useOpenProject } from "@/lib/useOpenProject";
import { loadUIState } from "@/lib/uiPersistence";
import { ErrorDialog } from "./ErrorDialog";
import splashHero from "@/assets/splash-hero.jpg";

export function WelcomeScreen() {
  const { openWithPicker, openDir } = useOpenProject();
  const [errors, setErrors] = useState<string[] | null>(null);
  const [loading, setLoading] = useState(false);

  const saved = loadUIState();
  const lastPath = saved?.lastProjectPath;
  const lastName = lastPath?.split(/[\\/]/).pop();

  const handleOpen = async () => {
    const result = await openWithPicker();
    if (result && !result.success && result.errors) {
      setErrors(result.errors);
    }
  };

  const handleReopen = async () => {
    if (!lastPath) return;
    setLoading(true);
    try {
      const result = await openDir(lastPath);
      if (!result.success && result.errors) {
        setErrors(result.errors);
      }
    } catch {
      setErrors([`Could not open ${lastPath}`]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex h-screen items-center justify-center bg-bg-abyss overflow-hidden">
      {/* Hero background */}
      <img
        src={splashHero}
        alt=""
        className="absolute inset-0 h-full w-full object-cover opacity-30"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-bg-abyss via-bg-abyss/60 to-bg-abyss/80" />

      <div className="relative z-10 flex flex-col items-center gap-8">
        <div className="flex flex-col items-center gap-2">
          <h1 className="font-display text-4xl font-semibold tracking-wide text-accent-emphasis drop-shadow-lg">
            AmbonMUD Creator
          </h1>
          <p className="text-lg text-text-secondary drop-shadow">
            World building and server management tool
          </p>
        </div>
        <div className="relative z-10 flex flex-col items-center gap-3">
          <button
            onClick={handleOpen}
            className="rounded-lg bg-gradient-to-r from-accent-muted to-accent px-6 py-3 font-display text-sm font-medium tracking-wide text-accent-emphasis transition-all hover:shadow-[var(--glow-aurum)] hover:brightness-110"
          >
            Open AmbonMUD Project
          </button>
          {lastPath && (
            <button
              onClick={handleReopen}
              disabled={loading}
              className="rounded-lg border border-border-default px-6 py-2.5 text-sm text-text-secondary transition-colors hover:bg-bg-elevated hover:text-text-primary disabled:opacity-50"
            >
              {loading ? "Opening..." : `Reopen ${lastName}`}
            </button>
          )}
        </div>
      </div>

      {errors && (
        <ErrorDialog
          title="Invalid AmbonMUD Directory"
          messages={errors}
          onClose={() => setErrors(null)}
        />
      )}
    </div>
  );
}
