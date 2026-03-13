import { useProjectStore } from "@/stores/projectStore";
import tabbarBg from "@/assets/tabbar-bg.jpg";

export function TabBar() {
  const tabs = useProjectStore((s) => s.tabs);
  const activeTabId = useProjectStore((s) => s.activeTabId);
  const configSubTab = useProjectStore((s) => s.configSubTab);
  const setActiveTab = useProjectStore((s) => s.setActiveTab);
  const closeTab = useProjectStore((s) => s.closeTab);
  const openTab = useProjectStore((s) => s.openTab);
  const setConfigSubTab = useProjectStore((s) => s.setConfigSubTab);

  const zoneTabs = tabs.filter((tab) => tab.kind === "zone");

  const mainTabs = [
    { id: "studio", label: "Studio", action: () => openTab({ id: "studio", kind: "studio", label: "Studio" }), active: activeTabId === "studio" },
    { id: "characterStudio", label: "Character Studio", action: () => { setConfigSubTab("characterStudio"); openTab({ id: "config", kind: "config", label: "Config" }); }, active: activeTabId === "config" && configSubTab === "characterStudio" },
    { id: "abilityStudio", label: "Ability Studio", action: () => { setConfigSubTab("abilityStudio"); openTab({ id: "config", kind: "config", label: "Config" }); }, active: activeTabId === "config" && configSubTab === "abilityStudio" },
    { id: "worldSystems", label: "World Systems", action: () => { setConfigSubTab("worldSystems"); openTab({ id: "config", kind: "config", label: "Config" }); }, active: activeTabId === "config" && configSubTab === "worldSystems" },
    { id: "contentStudio", label: "Content Studio", action: () => { setConfigSubTab("contentStudio"); openTab({ id: "config", kind: "config", label: "Config" }); }, active: activeTabId === "config" && configSubTab === "contentStudio" },
    { id: "operations", label: "Operations", action: () => { setConfigSubTab("operations"); openTab({ id: "config", kind: "config", label: "Config" }); }, active: activeTabId === "config" && configSubTab === "operations" },
    { id: "rawYaml", label: "Raw YAML", action: () => { setConfigSubTab("rawYaml"); openTab({ id: "config", kind: "config", label: "Config" }); }, active: activeTabId === "config" && configSubTab === "rawYaml" },
    { id: "sprites", label: "Sprites", action: () => openTab({ id: "sprites", kind: "sprites", label: "Sprites" }), active: activeTabId === "sprites" },
    { id: "console", label: "Console", action: () => openTab({ id: "console", kind: "console", label: "Console" }), active: activeTabId === "console" },
  ];

  return (
    <div className="relative flex h-14 shrink-0 items-center gap-2 overflow-x-auto border-b border-white/10 px-4">
      <img src={tabbarBg} alt="" className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-[0.08]" />
      {mainTabs.map((tab) => {
        return (
          <div
            key={tab.id}
            className={`group flex h-10 shrink-0 items-center gap-2 rounded-full border px-4 text-sm transition ${
              tab.active
                ? "border-[rgba(184,216,232,0.35)] bg-[linear-gradient(135deg,rgba(168,151,210,0.16),rgba(140,174,201,0.12))] text-text-primary"
                : "border-white/8 bg-black/10 text-text-secondary hover:bg-white/8 hover:text-text-primary"
            }`}
            onClick={tab.action}
          >
            <span className="truncate">{tab.label}</span>
          </div>
        );
      })}
      {zoneTabs.map((tab) => {
        const isActive = tab.id === activeTabId;
        return (
          <div
            key={tab.id}
            className={`group flex h-10 shrink-0 items-center gap-2 rounded-full border px-4 text-sm transition ${
              isActive
                ? "border-[rgba(184,216,232,0.35)] bg-[linear-gradient(135deg,rgba(168,151,210,0.16),rgba(140,174,201,0.12))] text-text-primary"
                : "border-white/8 bg-black/10 text-text-secondary hover:bg-white/8 hover:text-text-primary"
            }`}
            onClick={() => setActiveTab(tab.id)}
          >
            <span className="truncate">{tab.label}</span>
            <button
              className="ml-1 rounded-full p-0.5 text-text-muted opacity-0 transition-opacity hover:bg-white/10 hover:text-text-primary group-hover:opacity-100"
              onClick={(e) => {
                e.stopPropagation();
                closeTab(tab.id);
              }}
            >
              x
            </button>
          </div>
        );
      })}
    </div>
  );
}
