"use client";

import {
  Bar,
  BarChart,
  Cell,
  CartesianGrid,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type ChartPoint = {
  name: string;
  value: number;
};

type Props = {
  attackDistribution: ChartPoint[];
  correctnessData: ChartPoint[];
};

const COLORS = {
  benign: "#22c55e",
  attack: "#ef4444",
};

export default function ChartsPanel({ attackDistribution, correctnessData }: Props) {
  return (
    <div className="grid gap-6 xl:grid-cols-2">
      <section className="rounded-3xl border border-slate-800 bg-slate-900/70 p-5 shadow-2xl shadow-black/20 backdrop-blur">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold">Attack distribution</h2>
            <p className="mt-1 text-sm text-slate-400">
              Actual packet labels generated during the simulation.
            </p>
          </div>
        </div>

        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={attackDistribution}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
              <XAxis dataKey="name" tick={{ fill: "#cbd5e1", fontSize: 12 }} />
              <YAxis tick={{ fill: "#cbd5e1", fontSize: 12 }} />
              <Tooltip
                contentStyle={{
                  background: "#020617",
                  border: "1px solid #334155",
                  borderRadius: 12,
                  color: "#fff",
                }}
              />
              <Legend />
              <Bar dataKey="value" radius={[10, 10, 0, 0]}>
                {attackDistribution.map((entry) => (
                  <Cell
                    key={entry.name}
                    fill={entry.name === "Benign" ? COLORS.benign : COLORS.attack}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="rounded-3xl border border-slate-800 bg-slate-900/70 p-5 shadow-2xl shadow-black/20 backdrop-blur">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold">Prediction correctness</h2>
            <p className="mt-1 text-sm text-slate-400">
              How often the simulated prediction matches the actual label.
            </p>
          </div>
        </div>

        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={correctnessData}
                dataKey="value"
                nameKey="name"
                innerRadius={70}
                outerRadius={110}
                paddingAngle={4}
              >
                <Cell fill={COLORS.benign} />
                <Cell fill={COLORS.attack} />
              </Pie>
              <Tooltip
                contentStyle={{
                  background: "#020617",
                  border: "1px solid #334155",
                  borderRadius: 12,
                  color: "#fff",
                }}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </section>
    </div>
  );
}