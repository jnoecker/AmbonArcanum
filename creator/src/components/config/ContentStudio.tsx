import type { ReactNode } from "react";
import type { AppConfig } from "@/types/config";
import type { ContentStudioSubView } from "@/types/project";
import { AchievementDesigner } from "./AchievementDesigner";
import { QuestTaxonomyDesigner } from "./QuestTaxonomyDesigner";
import { GlobalAssetsPanel } from "./panels/GlobalAssetsPanel";

const CONTENT_STUDIO_VIEWS: Array<{
  id: ContentStudioSubView;
  label: string;
  eyebrow: string;
  title: string;
  description: string;
}> = [
  {
    id: "overview",
    label: "Overview",
    eyebrow: "Content",
    title: "Content by domain.",
    description: "Achievements, quest taxonomy, and shared assets.",
  },
  {
    id: "achievements",
    label: "Achievements",
    eyebrow: "Recognition",
    title: "Achievement categories and criteria.",
    description: "Reward labels and progress criteria.",
  },
  {
    id: "quests",
    label: "Quest Taxonomy",
    eyebrow: "Structure",
    title: "Quest objectives and completion types.",
    description: "Quest structure and completion rules.",
  },
  {
    id: "assets",
    label: "Shared Assets",
    eyebrow: "Presentation",
    title: "Shared global assets.",
    description: "Registered client-facing assets.",
  },
];

function StudioSection({
  kicker,
  title,
  description,
  children,
}: {
  kicker: string;
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-[28px] border border-white/10 bg-[linear-gradient(160deg,rgba(56,66,96,0.9),rgba(39,48,72,0.92))] p-5 shadow-[0_16px_42px_rgba(9,12,24,0.22)]">
      <div className="mb-4">
        <p className="text-[11px] uppercase tracking-[0.3em] text-text-muted">{kicker}</p>
        <h3 className="mt-2 font-display text-2xl text-text-primary">{title}</h3>
        <p className="mt-2 max-w-3xl text-sm leading-7 text-text-secondary">{description}</p>
      </div>
      <div>{children}</div>
    </section>
  );
}

export function ContentStudio({
  config,
  onChange,
  activeView,
  onViewChange,
}: {
  config: AppConfig;
  onChange: (patch: Partial<AppConfig>) => void;
  activeView: ContentStudioSubView;
  onViewChange: (view: ContentStudioSubView) => void;
}) {
  const achievementCount = Object.keys(config.achievementCategories).length;
  const criterionCount = Object.keys(config.achievementCriterionTypes).length;
  const objectiveCount = Object.keys(config.questObjectiveTypes).length;
  const globalAssetCount = Object.keys(config.globalAssets).length;

  return (
    <div className="flex flex-col gap-6">
      {activeView === "overview" && (
        <div className="grid gap-5">
          <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <MetricCard label="Achievement Categories" value={achievementCount} description="Top-level reward groupings" />
            <MetricCard label="Criterion Types" value={criterionCount} description="Progress verbs and formats" />
            <MetricCard label="Quest Objectives" value={objectiveCount} description="Quest step vocabulary" />
            <MetricCard label="Global Assets" value={globalAssetCount} description="Registered asset keys" />
          </section>

          <div className="grid gap-5 xl:grid-cols-3">
            {CONTENT_STUDIO_VIEWS.filter((view) => view.id !== "overview").map((view) => (
              <button
                key={view.id}
                onClick={() => onViewChange(view.id)}
                className="rounded-[26px] border border-white/10 bg-[linear-gradient(160deg,rgba(56,66,96,0.9),rgba(39,48,72,0.92))] p-5 text-left shadow-[0_16px_42px_rgba(9,12,24,0.22)] transition hover:border-[rgba(184,216,232,0.2)] hover:bg-[linear-gradient(160deg,rgba(63,73,105,0.94),rgba(43,52,79,0.96))]"
              >
                <p className="text-[11px] uppercase tracking-[0.3em] text-text-muted">{view.eyebrow}</p>
                <h3 className="mt-3 font-display text-2xl text-text-primary">{view.label}</h3>
                <p className="mt-3 text-sm leading-7 text-text-secondary">{view.description}</p>
                <div className="mt-4 text-xs uppercase tracking-[0.2em] text-accent">Open workspace</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {activeView === "achievements" && (
        <StudioSection
          kicker="Progression content"
          title="Achievement language"
          description="Categories and criterion definitions."
        >
          <AchievementDesigner config={config} onChange={onChange} />
        </StudioSection>
      )}

      {activeView === "quests" && (
        <StudioSection
          kicker="Quest language"
          title="Quest taxonomy designer"
          description="Objective and completion vocabularies."
        >
          <QuestTaxonomyDesigner config={config} onChange={onChange} />
        </StudioSection>
      )}

      {activeView === "assets" && (
        <StudioSection
          kicker="Shared assets"
          title="Global presentation assets"
          description="Global assets exported with runtime config."
        >
          <GlobalAssetsPanel config={config} onChange={onChange} />
        </StudioSection>
      )}
    </div>
  );
}

function MetricCard({
  label,
  value,
  description,
}: {
  label: string;
  value: number;
  description: string;
}) {
  return (
    <div className="rounded-[22px] border border-white/10 bg-black/12 p-4">
      <div className="text-[11px] uppercase tracking-[0.24em] text-text-muted">{label}</div>
      <div className="mt-2 font-display text-3xl text-text-primary">{value}</div>
      <div className="mt-2 text-xs text-text-secondary">{description}</div>
    </div>
  );
}
