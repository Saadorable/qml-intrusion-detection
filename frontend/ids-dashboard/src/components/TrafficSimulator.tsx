"use client";

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

export default function TrafficSimulator() {
  const [logs, setLogs] = useState<PacketRecord[]>([]);
  const [running, setRunning] = useState(false);
  const [selectedAttack, setSelectedAttack] = useState<AttackType | null>(null);
  const [burstSize, setBurstSize] = useState<BurstSize>(3);
  const [lastAction, setLastAction] = useState("System idle");
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const addPackets = (count: number, forcedLabel?: Label) => {
    const newPackets = Array.from({ length: count }, () => {
        const actualLabel: Label =
            forcedLabel ?? (selectedAttack && Math.random() < 0.65 ? selectedAttack : "Benign");
        return buildPacket(actualLabel);
    });

    setLogs((prev) => [...newPackets, ...prev].slice(0, 20));
  };

  const startTraffic = () => {
    if (running) return;
    setRunning(true);
    setLastAction("Live traffic started");

    intervalRef.current = setInterval(() => {
      addPackets(1);
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
    addPackets(burstSize, attack);
    setLastAction(`Injected ${burstSize} ${attack} sample${burstSize > 1 ? "s" : ""}`);
  };

  const clearAttack = () => {
    setSelectedAttack(null);
    setLastAction("Attack selection cleared");
  };

  const generateBenign = () => {
    addPackets(1, "Benign");
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

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
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

        <PacketDetails latestPacket={latestPacket} />
      </div>

      <ChartsPanel
        attackDistribution={attackDistribution}
        correctnessData={correctnessData}
      />

      <LiveLogs logs={logs} />
    </div>
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