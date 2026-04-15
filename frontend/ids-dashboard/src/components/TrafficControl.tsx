"use client";

import type { AttackType, BurstSize } from "@/lib/trafficGenerator";

type Props = {
  running: boolean;
  lastAction: string;
  selectedAttack: AttackType | null;
  burstSize: BurstSize;
  attackTypes: readonly AttackType[];
  onStart: () => void;
  onStop: () => void;
  onGenerateBenign: () => void;
  onInjectAttack: (attack: AttackType) => void;
  onClearAttack: () => void;
  onBurstSizeChange: (size: BurstSize) => void;
};

export default function TrafficControl({
  running,
  lastAction,
  selectedAttack,
  burstSize,
  attackTypes,
  onStart,
  onStop,
  onGenerateBenign,
  onInjectAttack,
  onClearAttack,
  onBurstSizeChange,
}: Props) {
  return (
    <section className="rounded-3xl border border-slate-800 bg-slate-900/70 p-5 shadow-2xl shadow-black/20 backdrop-blur">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold">Traffic Control</h2>
          <p className="mt-1 text-sm text-slate-400">
            Start continuous traffic, inject attack bursts, and watch the live simulator respond.
          </p>
        </div>

        <div
          className={[
            "rounded-full px-3 py-1 text-xs font-medium",
            running ? "bg-emerald-500/15 text-emerald-300" : "bg-slate-800 text-slate-300",
          ].join(" ")}
        >
          {running ? "Streaming ON" : "Streaming OFF"}
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          onClick={onStart}
          className="rounded-xl bg-emerald-500 px-4 py-2 font-medium text-slate-950 transition hover:scale-[1.02] hover:bg-emerald-400 active:scale-[0.98]"
        >
          Start traffic
        </button>
        <button
          onClick={onStop}
          className="rounded-xl bg-rose-500 px-4 py-2 font-medium text-white transition hover:scale-[1.02] hover:bg-rose-400 active:scale-[0.98]"
        >
          Stop traffic
        </button>
        <button
          onClick={onGenerateBenign}
          className="rounded-xl bg-slate-800 px-4 py-2 font-medium text-white transition hover:bg-slate-700"
        >
          Generate benign sample
        </button>
      </div>

      <div className="mt-6">
        <div className="mb-3 flex items-center justify-between gap-3">
          <h3 className="text-sm font-semibold uppercase tracking-[0.25em] text-slate-400">
            Attack injection
          </h3>

          <div className="flex items-center gap-2 text-xs text-slate-400">
            Burst
            {[1, 3, 5].map((n) => (
              <button
                key={n}
                onClick={() => onBurstSizeChange(n as BurstSize)}
                className={[
                  "rounded-lg px-3 py-1 transition",
                  burstSize === n
                    ? "bg-cyan-500 text-slate-950"
                    : "bg-slate-800 text-slate-300 hover:bg-slate-700",
                ].join(" ")}
              >
                {n}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {attackTypes.map((attack) => {
            const active = selectedAttack === attack;

            return (
              <button
                key={attack}
                onClick={() => onInjectAttack(attack)}
                className={[
                  "rounded-2xl border px-4 py-4 text-left transition-all duration-200",
                  active
                    ? "border-cyan-400 bg-cyan-500/15 shadow-lg shadow-cyan-500/10 ring-1 ring-cyan-400"
                    : "border-slate-800 bg-slate-950/40 hover:border-slate-600 hover:bg-slate-900",
                ].join(" ")}
              >
                <div className="text-sm font-semibold">{attack}</div>
                <div className="mt-1 text-xs text-slate-400">
                  Inject {burstSize} sample{burstSize > 1 ? "s" : ""}
                </div>
              </button>
            );
          })}
        </div>

        <button
          onClick={onClearAttack}
          className="mt-3 rounded-xl border border-slate-800 bg-slate-950 px-4 py-2 text-sm text-slate-300 transition hover:border-slate-600 hover:bg-slate-900"
        >
          Clear selected attack
        </button>
      </div>

      <div className="mt-5 rounded-2xl border border-slate-800 bg-slate-950/60 p-4 text-sm text-slate-300">
        {lastAction}
      </div>
    </section>
  );
}