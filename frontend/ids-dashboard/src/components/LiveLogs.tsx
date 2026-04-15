"use client";

import type { PacketRecord } from "@/lib/trafficGenerator";

type Props = {
  logs: PacketRecord[];
};

export default function LiveLogs({ logs }: Props) {
  return (
    <section className="rounded-3xl border border-slate-800 bg-slate-900/70 p-5 shadow-2xl shadow-black/20 backdrop-blur">
      <div className="mb-4 flex items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold">Live logs</h2>
          <p className="mt-1 text-sm text-slate-400">
            Each row shows packet origin, destination, prediction result, and whether the model was correct.
          </p>
        </div>
        <div className="text-sm text-slate-400">
          Showing last {logs.length} packet{logs.length === 1 ? "" : "s"}
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-800">
        <div className="max-h-[460px] overflow-auto">
          <table className="min-w-full border-separate border-spacing-0 text-left text-sm">
            <thead className="sticky top-0 z-10 bg-slate-950/95 text-slate-300">
              <tr>
                <th className="px-4 py-3">Time</th>
                <th className="px-4 py-3">Source</th>
                <th className="px-4 py-3">Destination</th>
                <th className="px-4 py-3">Protocol</th>
                <th className="px-4 py-3">Actual</th>
                <th className="px-4 py-3">Predicted</th>
                <th className="px-4 py-3">Confidence</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id} className="border-t border-slate-800/70 hover:bg-slate-800/30">
                  <td className="px-4 py-3 text-slate-400">{log.time}</td>
                  <td className="px-4 py-3 font-mono text-slate-200">
                    {log.srcIp}:{log.srcPort}
                  </td>
                  <td className="px-4 py-3 font-mono text-slate-200">
                    {log.dstIp}:{log.dstPort}
                  </td>
                  <td className="px-4 py-3 text-slate-300">{log.protocol}</td>
                  <td
                    className={[
                      "px-4 py-3 font-medium",
                      log.actualLabel === "Benign" ? "text-emerald-300" : "text-rose-300",
                    ].join(" ")}
                  >
                    {log.actualLabel}
                  </td>
                  <td
                    className={[
                      "px-4 py-3 font-medium",
                      log.correct ? "text-emerald-300" : "text-amber-300",
                    ].join(" ")}
                  >
                    {log.predictedLabel}
                  </td>
                  <td className="px-4 py-3 text-slate-300">
                    {Math.round(log.confidence * 100)}%
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={[
                        "rounded-full px-3 py-1 text-xs font-semibold",
                        log.correct
                          ? "bg-emerald-500/15 text-emerald-300"
                          : "bg-amber-500/15 text-amber-300",
                      ].join(" ")}
                    >
                      {log.correct ? "Correct" : "Wrong"}
                    </span>
                  </td>
                </tr>
              ))}

              {logs.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-10 text-center text-slate-400">
                    No live logs yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}