"use client";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  CartesianGrid,
} from "recharts";

interface AdminChartsProps {
  teamsByTheme: Array<{ name: string; teams: number }>;
  problemsSelected: Array<{ code: string; title: string; teams: number }>;
  registrationsTimeline: Array<{ date: string; registrations: number; revenue: number }>;
  paymentDistribution: Array<{ name: string; value: number; color: string }>;
}

const THEME_COLORS = ["#0D9488", "#2563EB", "#F43F5E", "#10B981", "#F59E0B", "#8B5CF6"];

export default function AdminCharts({
  teamsByTheme,
  problemsSelected,
  registrationsTimeline,
  paymentDistribution,
}: AdminChartsProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* 1. Registrations & Revenue Over Time */}
      <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
        <div>
          <h3 className="text-sm font-bold text-white">Registrations & Growth Velocity</h3>
          <p className="text-xs text-muted-foreground">Cumulative timeline based on database records</p>
        </div>
        <div className="h-64 w-full">
          {registrationsTimeline.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={registrationsTimeline}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="date" stroke="#94A3B8" fontSize={11} />
                <YAxis stroke="#94A3B8" fontSize={11} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#1F2937", borderColor: "#374151", borderRadius: 8, fontSize: 12 }}
                />
                <Line
                  type="monotone"
                  dataKey="registrations"
                  stroke="#0D9488"
                  strokeWidth={2}
                  dot={{ r: 4, fill: "#0D9488" }}
                  name="Registrations"
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-xs text-muted-foreground">
              No registration history recorded yet.
            </div>
          )}
        </div>
      </div>

      {/* 2. Teams by Track / Theme */}
      <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
        <div>
          <h3 className="text-sm font-bold text-white">Squads by Domain Track</h3>
          <p className="text-xs text-muted-foreground">Distribution across competition themes</p>
        </div>
        <div className="h-64 w-full">
          {teamsByTheme.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={teamsByTheme}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="name" stroke="#94A3B8" fontSize={10} tickFormatter={(val) => val.split(" ")[0]} />
                <YAxis stroke="#94A3B8" fontSize={11} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#1F2937", borderColor: "#374151", borderRadius: 8, fontSize: 12 }}
                />
                <Bar dataKey="teams" fill="#2563EB" radius={[4, 4, 0, 0]} name="Teams" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-xs text-muted-foreground">
              No track assignments recorded yet.
            </div>
          )}
        </div>
      </div>

      {/* 3. Problems Selected */}
      <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
        <div>
          <h3 className="text-sm font-bold text-white">Problem Statement Popularity</h3>
          <p className="text-xs text-muted-foreground">Number of squads tackling each problem code</p>
        </div>
        <div className="h-64 w-full">
          {problemsSelected.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={problemsSelected} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis type="number" stroke="#94A3B8" fontSize={11} allowDecimals={false} />
                <YAxis dataKey="code" type="category" stroke="#94A3B8" fontSize={10} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#1F2937", borderColor: "#374151", borderRadius: 8, fontSize: 12 }}
                />
                <Bar dataKey="teams" fill="#0D9488" radius={[0, 4, 4, 0]} name="Teams" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-xs text-muted-foreground">
              No problem selection data recorded yet.
            </div>
          )}
        </div>
      </div>

      {/* 4. Payment Status Distribution */}
      <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
        <div>
          <h3 className="text-sm font-bold text-white">Payment Status Distribution</h3>
          <p className="text-xs text-muted-foreground">Ratio of confirmed vs pending fee collections</p>
        </div>
        <div className="h-64 w-full flex items-center justify-center">
          {paymentDistribution.some((p) => p.value > 0) ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={paymentDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={85}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percent }: any) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
                >
                  {paymentDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: "#1F2937", borderColor: "#374151", borderRadius: 8, fontSize: 12 }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-xs text-muted-foreground">
              No payment transactions recorded yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
