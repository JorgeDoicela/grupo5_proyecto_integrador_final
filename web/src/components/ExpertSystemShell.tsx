"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Activity,
  BookOpen,
  Clock,
  GitFork,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  SlidersHorizontal,
  Stethoscope,
  X,
} from "lucide-react";
import type {
  EvaluationRecord,
  InferenceResult,
} from "@/domain/entities/types";
import { apiClient, type KnowledgeBaseSnapshot } from "@/lib/api-client";
import { DiagnosticWorkspace } from "@/components/DiagnosticWorkspace";
import { KnowledgeGraphView } from "@/components/KnowledgeGraphView";
import { FormalLogicView } from "@/components/FormalLogicView";
import { KnowledgeBaseManager } from "@/components/KnowledgeBaseManager";
import { EvaluationHistoryView } from "@/components/EvaluationHistoryView";

interface ExpertSystemShellProps {
  initialKnowledgeBase: KnowledgeBaseSnapshot;
  initialEvaluations: EvaluationRecord[];
}

type ActiveTab = "diagnose" | "graph" | "logic" | "knowledge" | "history";

const SIDEBAR_STORAGE_KEY = "neumologica_sidebar_collapsed";

export function ExpertSystemShell({
  initialKnowledgeBase,
  initialEvaluations,
}: ExpertSystemShellProps) {
  const [activeTab, setActiveTab] = useState<ActiveTab>("diagnose");
  const [kb, setKb] = useState<KnowledgeBaseSnapshot>(initialKnowledgeBase);
  const [evaluations, setEvaluations] =
    useState<EvaluationRecord[]>(initialEvaluations);
  const [lastInference, setLastInference] = useState<InferenceResult | null>(
    null
  );
  const [liveConnected, setLiveConnected] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(SIDEBAR_STORAGE_KEY);
      if (saved === "true") setCollapsed(true);
    } catch {
      // Ignorar si storage no está disponible
    }
  }, []);

  const refreshKnowledgeBase = useCallback(async () => {
    const nextKb = await apiClient.getKnowledgeBase();
    setKb(nextKb);
  }, []);

  const refreshEvaluations = useCallback(async () => {
    const nextEval = await apiClient.listEvaluations();
    setEvaluations(nextEval.data);
  }, []);

  const refreshAll = useCallback(async () => {
    const [nextKb, nextEval] = await Promise.all([
      apiClient.getKnowledgeBase(),
      apiClient.listEvaluations(),
    ]);
    setKb(nextKb);
    setEvaluations(nextEval.data);
  }, []);

  // Sincronización automática en tiempo real mediante Server-Sent Events (SSE)
  useEffect(() => {
    const eventSource = new EventSource("/api/events");

    eventSource.addEventListener("connected", () => {
      setLiveConnected(true);
    });

    eventSource.addEventListener("update", (event: MessageEvent) => {
      try {
        const parsed = JSON.parse(String(event.data)) as {
          topic?: "knowledge-updated" | "evaluations-updated";
        };
        if (parsed.topic === "knowledge-updated") {
          void refreshKnowledgeBase();
        } else if (parsed.topic === "evaluations-updated") {
          void refreshEvaluations();
        } else {
          void refreshAll();
        }
      } catch {
        void refreshAll();
      }
    });

    eventSource.onerror = () => {
      setLiveConnected(false);
    };

    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        void refreshAll();
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      eventSource.close();
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [refreshAll, refreshEvaluations, refreshKnowledgeBase]);

  const toggleCollapsed = () => {
    setCollapsed((prev) => {
      const next = !prev;
      try {
        window.localStorage.setItem(SIDEBAR_STORAGE_KEY, String(next));
      } catch {
        // Ignorar
      }
      return next;
    });
  };

  const handleEvaluationSaved = async (result: InferenceResult) => {
    setLastInference(result);
    await refreshEvaluations();
  };

  const navItems: Array<{
    id: ActiveTab;
    label: string;
    badge?: number;
    icon: React.ReactNode;
  }> = [
    {
      id: "diagnose",
      label: "Evaluar síntomas",
      icon: <Activity className="h-[18px] w-[18px] shrink-0" />,
    },
    {
      id: "graph",
      label: "Mapa de relaciones",
      icon: <GitFork className="h-[18px] w-[18px] shrink-0" />,
    },
    {
      id: "logic",
      label: "Reglas y tablas",
      icon: <BookOpen className="h-[18px] w-[18px] shrink-0" />,
    },
    {
      id: "knowledge",
      label: "Gestionar reglas",
      icon: <SlidersHorizontal className="h-[18px] w-[18px] shrink-0" />,
    },
    {
      id: "history",
      label: "Historial",
      badge: evaluations.length > 0 ? evaluations.length : undefined,
      icon: <Clock className="h-[18px] w-[18px] shrink-0" />,
    },
  ];

  const selectTab = (tab: ActiveTab) => {
    setActiveTab(tab);
    setMobileMenuOpen(false);
  };

  return (
    <div className="relative flex min-h-screen overflow-x-clip bg-[#f0f4f9]">
      {/* Auroras ambientales sutiles */}
      <div
        className="pointer-events-none fixed -top-32 -left-32 h-[28rem] w-[28rem] rounded-full bg-gradient-to-br from-cyan-400/20 via-blue-500/15 to-transparent blur-3xl"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none fixed top-1/4 -right-32 h-[32rem] w-[32rem] rounded-full bg-gradient-to-tl from-violet-500/15 via-indigo-500/12 to-transparent blur-3xl"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none fixed bottom-10 left-1/3 h-[26rem] w-[26rem] rounded-full bg-gradient-to-tr from-cyan-400/10 via-blue-500/10 to-transparent blur-3xl"
        aria-hidden="true"
      />

      {/* Sidebar Izquierdo */}
      <aside
        aria-label="Navegación principal"
        className={`sticky top-0 z-40 hidden h-screen shrink-0 flex-col justify-between border-r border-slate-200/70 bg-white/85 backdrop-blur-md transition-[width] duration-200 lg:flex ${
          collapsed ? "w-[74px]" : "w-[236px]"
        }`}
      >
        <div>
          <div
            className={`flex h-16 items-center border-b border-slate-200/60 px-4 ${
              collapsed ? "justify-center" : "justify-between"
            }`}
          >
            <button
              type="button"
              onClick={() => selectTab("diagnose")}
              className="flex cursor-pointer items-center gap-2.5 overflow-hidden text-left"
              title="NeumoLógica+"
            >
              <Stethoscope
                className="h-6 w-6 shrink-0 text-[#0b57d0]"
                strokeWidth={2.2}
                aria-hidden="true"
              />
              {!collapsed && (
                <span className="truncate text-base font-black tracking-tight text-slate-900">
                  NEUMOLÓGICA
                  <span className="bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 bg-clip-text text-transparent">
                    +
                  </span>
                </span>
              )}
            </button>
          </div>

          <nav className="space-y-1 p-3">
            {navItems.map((item) => {
              const active = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => selectTab(item.id)}
                  title={collapsed ? item.label : undefined}
                  className={`flex w-full cursor-pointer items-center gap-3 rounded-full px-3.5 py-2.5 text-sm transition-colors ${
                    collapsed ? "justify-center px-0" : "justify-between"
                  } ${
                    active
                      ? "bg-blue-50/90 font-semibold text-[#0b57d0]"
                      : "font-medium text-[#444746] hover:bg-slate-100/80 hover:text-[#1f1f1f]"
                  }`}
                >
                  <span className="flex items-center gap-3 truncate">
                    {item.icon}
                    {!collapsed && <span className="truncate">{item.label}</span>}
                  </span>
                  {!collapsed && item.badge !== undefined && (
                    <span className="text-xs font-semibold text-[#0b57d0]">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Pie minimalista sin botón manual de recarga */}
        <div className="border-t border-slate-200/60 p-3">
          <div
            className={`flex items-center ${
              collapsed ? "justify-center" : "justify-between px-1"
            }`}
          >
            {!collapsed && (
              <div className="flex items-center gap-2 text-[11px] text-[#747775]">
                <span
                  className={`h-2 w-2 rounded-full ${
                    liveConnected ? "bg-emerald-500" : "bg-slate-300"
                  }`}
                  title={liveConnected ? "Sincronización automática activa" : "Reconectando..."}
                />
                <span>UBE • Grupo 5</span>
              </div>
            )}

            <button
              type="button"
              onClick={toggleCollapsed}
              title={collapsed ? "Expandir menú" : "Contraer menú"}
              aria-label={collapsed ? "Expandir menú lateral" : "Contraer menú lateral"}
              className="cursor-pointer rounded-full p-2 text-[#444746] transition-colors hover:bg-slate-100 hover:text-[#1f1f1f]"
            >
              {collapsed ? (
                <PanelLeftOpen className="h-4 w-4" />
              ) : (
                <PanelLeftClose className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>
      </aside>

      {/* Contenedor principal */}
      <div className="relative z-10 flex min-w-0 flex-1 flex-col">
        {/* Cabecera móvil */}
        <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-slate-200/60 bg-white/85 px-4 backdrop-blur-md lg:hidden">
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              aria-label="Abrir menú"
              className="cursor-pointer rounded-full p-1.5 text-[#444746] hover:bg-slate-100"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
            <Stethoscope className="h-5 w-5 text-[#0b57d0]" />
            <span className="text-base font-black tracking-tight text-slate-900">
              NEUMOLÓGICA
              <span className="bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 bg-clip-text text-transparent">
                +
              </span>
            </span>
          </div>

          <span
            className={`h-2 w-2 rounded-full ${
              liveConnected ? "bg-emerald-500" : "bg-slate-300"
            }`}
            aria-label={liveConnected ? "En vivo" : "Reconectando"}
          />
        </header>

        {mobileMenuOpen && (
          <nav className="border-b border-slate-200 bg-white/95 p-3 backdrop-blur-md lg:hidden">
            <div className="space-y-1">
              {navItems.map((item) => {
                const active = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => selectTab(item.id)}
                    className={`flex w-full cursor-pointer items-center justify-between rounded-full px-4 py-2.5 text-sm ${
                      active
                        ? "bg-blue-50 font-semibold text-[#0b57d0]"
                        : "font-medium text-[#444746]"
                    }`}
                  >
                    <span className="flex items-center gap-3">
                      {item.icon}
                      <span>{item.label}</span>
                    </span>
                    {item.badge !== undefined && (
                      <span className="text-xs font-semibold text-[#0b57d0]">
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </nav>
        )}

        <main className="mx-auto flex w-full max-w-[1440px] flex-1 flex-col px-4 py-5 sm:px-6 lg:px-8">
          {activeTab === "diagnose" && (
            <DiagnosticWorkspace
              symptoms={kb.symptoms}
              onEvaluationSaved={handleEvaluationSaved}
              onOpenGraph={() => selectTab("graph")}
            />
          )}

          {activeTab === "graph" && (
            <KnowledgeGraphView
              graph={kb.graph}
              diseases={kb.diseases}
              highlightedSymptomIds={lastInference?.observedSymptoms.map((s) => s.id)}
              highlightedRuleIds={lastInference?.matchedDiagnoses.map((d) => d.ruleId)}
            />
          )}

          {activeTab === "logic" && (
            <FormalLogicView formalizations={kb.formalizations} />
          )}

          {activeTab === "knowledge" && (
            <KnowledgeBaseManager
              symptoms={kb.symptoms}
              diseases={kb.diseases}
              rules={kb.rules}
              onRefresh={refreshAll}
            />
          )}

          {activeTab === "history" && (
            <EvaluationHistoryView
              evaluations={evaluations}
              onRefresh={refreshEvaluations}
              onGoToEvaluate={() => selectTab("diagnose")}
            />
          )}
        </main>
      </div>
    </div>
  );
}
