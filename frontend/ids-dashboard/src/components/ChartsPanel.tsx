"use client";

import dynamic from "next/dynamic";

const BarChart = dynamic(() => import("recharts").then((m) => m.BarChart), { ssr: false });
const PieChart = dynamic(() => import("recharts").then((m) => m.PieChart), { ssr: false });
const Bar = dynamic(() => import("recharts").then((m) => m.Bar), { ssr: false });
const Pie = dynamic(() => import("recharts").then((m) => m.Pie), { ssr: false });
const XAxis = dynamic(() => import("recharts").then((m) => m.XAxis), { ssr: false });
const YAxis = dynamic(() => import("recharts").then((m) => m.YAxis), { ssr: false });
const Tooltip = dynamic(() => import("recharts").then((m) => m.Tooltip), { ssr: false });
const Legend = dynamic(() => import("recharts").then((m) => m.Legend), { ssr: false });
const CartesianGrid = dynamic(() => import("recharts").then((m) => m.CartesianGrid), { ssr: false });
const ResponsiveContainer = dynamic(() => import("recharts").then((m) => m.ResponsiveContainer), { ssr: false });
const Sector = dynamic(() => import("recharts").then((m) => m.Sector), { ssr: false });

type ChartPoint = {
  name: string;
  value: number;
  fill?: string;
};

type Props = {
  attackDistribution: ChartPoint[];
  correctnessData: ChartPoint[];
};

const COLORS = {
  benign: "#22c55e",
  attack: "#ef4444",
  correct: "#22c55e",
  incorrect: "#f59e0b",
};

function BarShape(props: any) {
  const { x, y, width, height, payload } = props;
  const fill = payload?.fill ?? COLORS.attack;

  return (
    <rect
      x={x}
      y={y}
      width={width}
      height={height}
      rx={10}
      ry={10}
      fill={fill}
    />
  );
}

function PieSectorShape(props: any) {
  const { fill, payload } = props;
  return <Sector {...props} fill={payload?.fill ?? fill} />;
}

export default function ChartsPanel({ attackDistribution, correctnessData }: Props) {
  const barData = attackDistribution.map((item) => ({
    ...item,
    fill: item.name === "Benign" ? COLORS.benign : COLORS.attack,
  }));

  const pieData = correctnessData.map((item) => ({
    ...item,
    fill: item.name === "Correct" ? COLORS.correct : COLORS.incorrect,
  }));

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
            <BarChart data={barData}>
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
              <Bar dataKey="value" shape={BarShape} radius={[10, 10, 0, 0]} />
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
                data={pieData}
                dataKey="value"
                nameKey="name"
                innerRadius={70}
                outerRadius={110}
                paddingAngle={4}
                shape={PieSectorShape}
              />
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