"use client";

import TrafficSimulator from "@/components/TrafficSimulator";

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <p className="text-sm uppercase tracking-[0.35em] text-cyan-400">
            Full-Stack Intrusion Detection System
          </p>
          <h1 className="mt-3 text-4xl font-bold tracking-tight sm:text-5xl">
            Intrusion Detection Dashboard
          </h1>
          <p className="mt-3 max-w-3xl text-sm text-slate-400 sm:text-base">
            Live traffic simulation, attack injection, prediction monitoring, and
            packet-level inspection for a production-style IDS interface.
          </p>
        </div>

        <TrafficSimulator />
      </div>
    </main>
  );
}