import {
  ResponsiveContainer,
  AreaChart,
  Area,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { currency } from "../lib/finance";
export const colors = ["#235b4c", "#8fae81", "#bfcaab", "#dfb87c", "#a6b8c2"];
export function CashflowChart({
  data,
}: {
  data: { name: string; income: number; expenses: number }[];
}) {
  return (
    <div
      className="h-64 w-full"
      role="img"
      aria-label="Andamento mensile di entrate e uscite. Dati disponibili nella tabella espandibile."
    >
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ top: 15, right: 10, left: 0, bottom: 0 }}
        >
          <defs>
            <linearGradient id="incomeFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#235b4c" stopOpacity={0.18} />
              <stop offset="100%" stopColor="#235b4c" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid vertical={false} stroke="#edf0ea" />
          <XAxis
            dataKey="name"
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12, fill: "#757b74" }}
            dy={10}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 11, fill: "#757b74" }}
            tickFormatter={(v) => `${v / 100000}k`}
            width={38}
          />
          <Tooltip
            formatter={(v) => currency(Number(v))}
            contentStyle={{ borderRadius: 12, border: "1px solid #e3e8df" }}
          />
          <Area
            name="Entrate"
            type="monotone"
            dataKey="income"
            stroke="#235b4c"
            strokeWidth={3}
            fill="url(#incomeFill)"
          />
          <Area
            name="Uscite"
            type="monotone"
            dataKey="expenses"
            stroke="#c4a16a"
            strokeWidth={2}
            strokeDasharray="5 5"
            fill="transparent"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
export function SpendingChart({
  data,
  total,
}: {
  data: { name: string; value: number }[];
  total: number;
}) {
  if (!total)
    return (
      <div className="empty-state">
        <h3>Nessuna uscita contabilizzata</h3>
        <p>Le categorie compariranno con il primo movimento completato.</p>
      </div>
    );
  return (
    <>
      <div className="donut">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              innerRadius={67}
              outerRadius={88}
              paddingAngle={4}
              stroke="none"
            >
              {data.map((item, i) => (
                <Cell key={item.name} fill={colors[i % colors.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(v) => currency(Number(v))} />
          </PieChart>
        </ResponsiveContainer>
        <div className="donut-label">
          <span>Uscite totali</span>
          <strong>{currency(total)}</strong>
        </div>
      </div>
      <ul className="space-y-3">
        {data.map((item, i) => (
          <li key={item.name} className="flex items-center gap-2 text-sm">
            <span
              className="h-2 w-2 rounded-full"
              style={{ background: colors[i % colors.length] }}
            />
            <span className="flex-1 text-stone-600">{item.name}</span>
            <strong className="font-medium">{currency(item.value)}</strong>
            <span className="w-9 text-right text-xs text-stone-500">
              {Math.round((item.value / total) * 100)}%
            </span>
          </li>
        ))}
      </ul>
    </>
  );
}
