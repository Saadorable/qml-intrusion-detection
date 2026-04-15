"use client";

import type { PacketRecord } from "@/lib/trafficGenerator";

type Props = {
  latestPacket?: PacketRecord;
};

export default function PacketDetails({ latestPacket }: Props) {
  return (
    <section className="rounded-3xl border border-slate-800 bg-slate-900/70 p-5 shadow-2xl shadow-black/20 backdrop-blur">
      <h2 className="text-xl font-semibold">Latest packet snapshot</h2>
      <p className="mt-1 text-sm text-slate-400">
        Source, destination, protocol, and key flow features for the most recent packet.
      </p>

      {latestPacket ? (
        <div className="mt-5 space-y-4">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <InfoBox label="Source IP" value={latestPacket.srcIp} />
            <InfoBox label="Destination IP" value={latestPacket.dstIp} />
            <InfoBox label="Source → Destination Port" value={`${latestPacket.srcPort} → ${latestPacket.dstPort}`} />
            <InfoBox label="Protocol" value={latestPacket.protocol} />
            <InfoBox
              label="Actual label"
              value={latestPacket.actualLabel}
              valueClassName={latestPacket.actualLabel === "Benign" ? "text-emerald-300" : "text-rose-300"}
            />
            <InfoBox
              label="Predicted label"
              value={latestPacket.predictedLabel}
              valueClassName={latestPacket.correct ? "text-emerald-300" : "text-amber-300"}
            />
            <InfoBox label="Confidence" value={`${Math.round(latestPacket.confidence * 100)}%`} />
            <InfoBox label="Packet size" value={`${latestPacket.packetSize} bytes`} />
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-sm font-semibold text-slate-200">Feature summary</div>
                <div className="text-xs text-slate-400">
                  A compact view of the packet-level values.
                </div>
              </div>

              <div
                className={[
                  "rounded-full px-3 py-1 text-xs font-medium",
                  latestPacket.correct ? "bg-emerald-500/15 text-emerald-300" : "bg-amber-500/15 text-amber-300",
                ].join(" ")}
              >
                {latestPacket.correct ? "Prediction correct" : "Prediction wrong"}
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3 text-xs sm:grid-cols-4">
              <MiniFeature label="Flow Duration" value={latestPacket.flowDuration.toFixed(2)} />
              <MiniFeature label="Rate" value={latestPacket.rate.toFixed(2)} />
              <MiniFeature label="SYN Count" value={latestPacket.synCount} />
              <MiniFeature label="ACK Count" value={latestPacket.ackCount} />
              <MiniFeature label="IAT" value={latestPacket.iat.toFixed(3)} />
              <MiniFeature label="Variance" value={latestPacket.variance.toFixed(3)} />
              <MiniFeature label="Weight" value={latestPacket.weight.toFixed(3)} />
              <MiniFeature label="Status" value="Flow fingerprinted" />
            </div>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4 text-sm text-slate-300">
            {latestPacket.note}
          </div>
        </div>
      ) : (
        <div className="mt-5 rounded-2xl border border-dashed border-slate-700 p-8 text-sm text-slate-400">
          No packets yet. Start the simulation or inject an attack burst.
        </div>
      )}
    </section>
  );
}

function InfoBox({
  label,
  value,
  valueClassName = "",
}: {
  label: string;
  value: string | number;
  valueClassName?: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-3">
      <div className="text-[11px] uppercase tracking-[0.2em] text-slate-500">{label}</div>
      <div className={`mt-1 break-words text-sm font-medium text-slate-100 ${valueClassName}`}>
        {value}
      </div>
    </div>
  );
}

function MiniFeature({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3">
      <div className="text-[11px] uppercase tracking-[0.18em] text-slate-500">{label}</div>
      <div className="mt-1 text-sm font-medium text-slate-100">{value}</div>
    </div>
  );
}