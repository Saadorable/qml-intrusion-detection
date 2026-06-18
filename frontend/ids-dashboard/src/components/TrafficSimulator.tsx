"use client";

import { predictTraffic } from "@/lib/api";
import { useEffect, useMemo, useRef, useState } from "react";
import TrafficControl from "./TrafficControl";
import ChartsPanel from "./ChartsPanel";
import LiveLogs from "./LiveLogs";
import PacketDetails from "./PacketDetails";
import {
  ATTACK_TYPES,
  buildPacket,
  type AttackType,
  type BurstSize,
  type Label,
  type PacketRecord,
} from "@/lib/trafficGenerator";

type PanelView = "charts" | "logs" | "packet";

export default function TrafficSimulator() {
  const [logs, setLogs] = useState<PacketRecord[]>([]);
  const [running, setRunning] = useState(false);
  const [selectedAttack, setSelectedAttack] = useState<AttackType | null>(null);
  const [burstSize, setBurstSize] = useState<BurstSize>(3);
  const [lastAction, setLastAction] = useState("System idle");
  const [activeView, setActiveView] = useState<PanelView>("charts");
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const addPackets = async (count: number, forcedLabel?: Label) => {
    const newPackets = await Promise.all(
      Array.from({ length: count }, async () => {
        const actualLabel: Label =
          forcedLabel ?? (selectedAttack && Math.random() < 0.65 ? selectedAttack : "Benign");

        const packet = buildPacket(actualLabel);

        const prediction = await predictTraffic(packet.features);

        const predictedLabel = prediction.predicted_class as Label;

        return {
          ...packet,
          predictedLabel,
          correct: predictedLabel === packet.actualLabel,
          confidence: Math.max(...prediction.probabilities),
        };
      })
    );

    setLogs((prev) => [...newPackets, ...prev].slice(0, 20));
  };

  const startTraffic = () => {
    if (running) return;
    setRunning(true);
    setLastAction("Live traffic started");

    intervalRef.current = setInterval(() => {
      void addPackets(1);
    }, 1000);
  };

  const stopTraffic = () => {
    setRunning(false);
    setLastAction("Live traffic stopped");

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const injectAttack = (attack: AttackType) => {
    setSelectedAttack(attack);
    void addPackets(burstSize, attack);
    setLastAction(`Injected ${burstSize} ${attack} sample${burstSize > 1 ? "s" : ""}`);
  };

  const clearAttack = () => {
    setSelectedAttack(null);
    setLastAction("Attack selection cleared");
  };

  const generateBenign = () => {
    void addPackets(1, "Benign");
    setLastAction("Generated benign sample");
  };

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const stats = useMemo(() => {
    const total = logs.length;
    const malicious = logs.filter((x) => x.actualLabel !== "Benign").length;
    const benign = total - malicious;
    const correct = logs.filter((x) => x.correct).length;
    const incorrect = total - correct;

    return {
      total,
      malicious,
      benign,
      correct,
      incorrect,
      accuracy: total ? Math.round((correct / total) * 100) : 0,
    };
  }, [logs]);

  const attackDistribution = useMemo(() => {
    const labels: Label[] = ["Benign", ...ATTACK_TYPES];
    return labels.map((label) => ({
      name: label,
      value: logs.filter((log) => log.actualLabel === label).length,
    }));
  }, [logs]);

  const correctnessData = useMemo(
    () => [
      { name: "Correct", value: stats.correct },
      { name: "Incorrect", value: stats.incorrect },
    ],
    [stats.correct, stats.incorrect]
  );

  const latestPacket = logs[0];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Total packets" value={stats.total} hint="Generated locally" />
        <StatCard title="Malicious flows" value={stats.malicious} hint="Attack class packets" accent="attack" />
        <StatCard title="Detection accuracy" value={`${stats.accuracy}%`} hint="Prediction vs label" accent="info" />
        <StatCard
          title="Live state"
          value={running ? "Running" : "Stopped"}
          hint={lastAction}
          accent={running ? "success" : "neutral"}
        />
      </div>

      <TrafficControl
        running={running}
        lastAction={lastAction}
        selectedAttack={selectedAttack}
        burstSize={burstSize}
        attackTypes={ATTACK_TYPES}
        onStart={startTraffic}
        onStop={stopTraffic}
        onGenerateBenign={generateBenign}
        onInjectAttack={injectAttack}
        onClearAttack={clearAttack}
        onBurstSizeChange={setBurstSize}
      />

      <section className="rounded-3xl border border-slate-800 bg-slate-900/70 p-5 shadow-2xl shadow-black/20 backdrop-blur">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold">Dashboard views</h2>
            <p className="mt-1 text-sm text-slate-400">
              Switch between charts, logs, or packet details.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <ViewButton active={activeView === "charts"} onClick={() => setActiveView("charts")}>
              Charts
            </ViewButton>
            <ViewButton active={activeView === "logs"} onClick={() => setActiveView("logs")}>
              Live Logs
            </ViewButton>
            <ViewButton active={activeView === "packet"} onClick={() => setActiveView("packet")}>
              Packet Details
            </ViewButton>
          </div>
        </div>

        {activeView === "charts" && (
          <ChartsPanel
            attackDistribution={attackDistribution}
            correctnessData={correctnessData}
          />
        )}

        {activeView === "logs" && <LiveLogs logs={logs} />}

        {activeView === "packet" && <PacketDetails latestPacket={latestPacket} />}
      </section>
    </div>
  );
}

function ViewButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={[
        "rounded-xl px-4 py-2 text-sm font-medium transition",
        active
          ? "bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/20"
          : "bg-slate-800 text-slate-300 hover:bg-slate-700",
      ].join(" ")}
    >
      {children}
    </button>
  );
}

function StatCard({
  title,
  value,
  hint,
  accent = "neutral",
}: {
  title: string;
  value: string | number;
  hint: string;
  accent?: "neutral" | "success" | "attack" | "info";
}) {
  const accentClasses: Record<string, string> = {
    neutral: "from-slate-700 to-slate-600",
    success: "from-emerald-500 to-emerald-400",
    attack: "from-rose-500 to-rose-400",
    info: "from-cyan-500 to-cyan-400",
  };

  return (
    <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-5 shadow-xl shadow-black/20">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-sm text-slate-400">{title}</p>
        <div className={`h-2 w-14 rounded-full bg-gradient-to-r ${accentClasses[accent]}`} />
      </div>
      <div className="text-3xl font-bold">{value}</div>
      <p className="mt-2 text-sm text-slate-500">{hint}</p>
    </div>
  );
}