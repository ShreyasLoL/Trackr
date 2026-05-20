import { useMemo } from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';

/* ─── helpers ─── */
function getLast30Days() {
  const days = [];
  const now = new Date();
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    days.push(d.toISOString().slice(0, 10));
  }
  return days;
}

function getWeekLabel(dateStr) {
  const d = new Date(dateStr);
  const start = new Date(d);
  start.setDate(start.getDate() - start.getDay());
  return start.toISOString().slice(5, 10);
}

/* ─── chart card wrapper ─── */
function ChartCard({ title, children }) {
  return (
    <div className="bg-card rounded-2xl shadow-sm border border-border/50 p-6 lg:p-8">
      <h2 className="text-base font-semibold text-text mb-6">{title}</h2>
      {children}
    </div>
  );
}

/* ─── custom tooltip ─── */
function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card border border-border rounded-lg shadow-md px-3 py-2 text-xs">
      <p className="font-medium text-text-muted mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }} className="font-medium">
          {p.name}: {p.value != null ? p.value : '—'}
        </p>
      ))}
    </div>
  );
}

const ACCENT = '#6A9E7F';
const ACCENT2 = '#E89B5E';
const GRID_COLOR = '#E8E5E0';

export default function Charts({ profile, getAllLogs }) {
  const allLogs = getAllLogs();
  const last30 = getLast30Days();

  /* Trend data */
  const trendData = useMemo(() => {
    return last30.map((date) => {
      const log = allLogs[date];
      return {
        date: date.slice(5), // MM-DD
        weight: log?.weight ?? null,
        calories: log?.calories ?? null,
        steps: log?.steps ?? null,
      };
    });
  }, [allLogs, last30]);

  /* Weekly averages */
  const weeklyData = useMemo(() => {
    const weeks = {};
    last30.forEach((date) => {
      const wk = getWeekLabel(date);
      if (!weeks[wk]) weeks[wk] = { weight: [], calories: [], steps: [] };
      const log = allLogs[date];
      if (log?.weight) weeks[wk].weight.push(log.weight);
      if (log?.calories) weeks[wk].calories.push(log.calories);
      if (log?.steps) weeks[wk].steps.push(log.steps);
    });

    return Object.entries(weeks).map(([week, data]) => ({
      week: `W ${week}`,
      avgWeight:
        data.weight.length
          ? Math.round((data.weight.reduce((a, b) => a + b, 0) / data.weight.length) * 10) / 10
          : 0,
      avgCalories:
        data.calories.length
          ? Math.round(data.calories.reduce((a, b) => a + b, 0) / data.calories.length)
          : 0,
      avgSteps:
        data.steps.length
          ? Math.round(data.steps.reduce((a, b) => a + b, 0) / data.steps.length)
          : 0,
    }));
  }, [allLogs, last30]);

  /* Scatter data: calories vs steps */
  const scatterData = useMemo(() => {
    return Object.values(allLogs)
      .filter((l) => l.calories && l.steps)
      .map((l) => ({ calories: l.calories, steps: l.steps }));
  }, [allLogs]);

  const goalWeight = profile?.goalWeight;
  const hasData = Object.keys(allLogs).length > 0;

  const emptyMessage = (
    <div className="flex items-center justify-center h-48 text-sm text-text-muted">
      No data yet. Log your first entry on the Dashboard.
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto px-6 py-8 space-y-8">
      <div>
        <h1 className="text-xl font-semibold text-text tracking-tight">
          Charts
        </h1>
        <p className="text-sm text-text-muted mt-1">
          Trends and insights from your last 30 days.
        </p>
      </div>

      {!hasData ? (
        <div className="bg-card rounded-2xl shadow-sm border border-border/50 p-12 text-center">
          <p className="text-text-muted">
            Start logging data on the Dashboard to see your charts here.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Weight trend */}
          <ChartCard title={`Weight Trend (${profile?.unit || 'kg'})`}>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke={GRID_COLOR} />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 11, fill: '#8A8A8A' }}
                  tickLine={false}
                  axisLine={{ stroke: GRID_COLOR }}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: '#8A8A8A' }}
                  tickLine={false}
                  axisLine={false}
                  domain={['auto', 'auto']}
                  width={40}
                />
                <Tooltip content={<CustomTooltip />} />
                {goalWeight && (
                  <ReferenceLine
                    y={goalWeight}
                    stroke={ACCENT}
                    strokeDasharray="6 4"
                    strokeWidth={1.5}
                    label={{
                      value: `Goal: ${goalWeight}`,
                      position: 'insideTopRight',
                      fill: ACCENT,
                      fontSize: 11,
                    }}
                  />
                )}
                <Line
                  type="monotone"
                  dataKey="weight"
                  stroke={ACCENT}
                  strokeWidth={2}
                  dot={{ r: 3, fill: ACCENT }}
                  activeDot={{ r: 5 }}
                  connectNulls
                  name="Weight"
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* Calories trend */}
          <ChartCard title="Calories Trend (kcal)">
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke={GRID_COLOR} />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 11, fill: '#8A8A8A' }}
                  tickLine={false}
                  axisLine={{ stroke: GRID_COLOR }}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: '#8A8A8A' }}
                  tickLine={false}
                  axisLine={false}
                  width={50}
                />
                <Tooltip content={<CustomTooltip />} />
                <Line
                  type="monotone"
                  dataKey="calories"
                  stroke={ACCENT2}
                  strokeWidth={2}
                  dot={{ r: 3, fill: ACCENT2 }}
                  activeDot={{ r: 5 }}
                  connectNulls
                  name="Calories"
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* Steps trend */}
          <ChartCard title="Steps Trend">
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke={GRID_COLOR} />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 11, fill: '#8A8A8A' }}
                  tickLine={false}
                  axisLine={{ stroke: GRID_COLOR }}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: '#8A8A8A' }}
                  tickLine={false}
                  axisLine={false}
                  width={50}
                />
                <Tooltip content={<CustomTooltip />} />
                <Line
                  type="monotone"
                  dataKey="steps"
                  stroke="#7B9FC4"
                  strokeWidth={2}
                  dot={{ r: 3, fill: '#7B9FC4' }}
                  activeDot={{ r: 5 }}
                  connectNulls
                  name="Steps"
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* Weekly averages */}
          <ChartCard title="Weekly Averages">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={weeklyData} barCategoryGap="20%">
                <CartesianGrid strokeDasharray="3 3" stroke={GRID_COLOR} />
                <XAxis
                  dataKey="week"
                  tick={{ fontSize: 11, fill: '#8A8A8A' }}
                  tickLine={false}
                  axisLine={{ stroke: GRID_COLOR }}
                />
                <YAxis
                  yAxisId="left"
                  tick={{ fontSize: 11, fill: '#8A8A8A' }}
                  tickLine={false}
                  axisLine={false}
                  width={50}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  tick={{ fontSize: 11, fill: '#8A8A8A' }}
                  tickLine={false}
                  axisLine={false}
                  width={50}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar
                  yAxisId="left"
                  dataKey="avgCalories"
                  fill={ACCENT2}
                  radius={[4, 4, 0, 0]}
                  name="Avg Calories"
                />
                <Bar
                  yAxisId="right"
                  dataKey="avgSteps"
                  fill="#7B9FC4"
                  radius={[4, 4, 0, 0]}
                  name="Avg Steps"
                />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* Calories vs Steps scatter */}
          <ChartCard title="Calories vs. Steps">
            {scatterData.length < 2 ? (
              <div className="flex items-center justify-center h-48 text-sm text-text-muted">
                Need at least 2 days of data with both calories and steps.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <ScatterChart>
                  <CartesianGrid strokeDasharray="3 3" stroke={GRID_COLOR} />
                  <XAxis
                    dataKey="calories"
                    name="Calories"
                    tick={{ fontSize: 11, fill: '#8A8A8A' }}
                    tickLine={false}
                    axisLine={{ stroke: GRID_COLOR }}
                    label={{
                      value: 'Calories',
                      position: 'insideBottom',
                      offset: -2,
                      fill: '#8A8A8A',
                      fontSize: 11,
                    }}
                  />
                  <YAxis
                    dataKey="steps"
                    name="Steps"
                    tick={{ fontSize: 11, fill: '#8A8A8A' }}
                    tickLine={false}
                    axisLine={false}
                    width={50}
                    label={{
                      value: 'Steps',
                      angle: -90,
                      position: 'insideLeft',
                      fill: '#8A8A8A',
                      fontSize: 11,
                    }}
                  />
                  <Tooltip
                    content={<CustomTooltip />}
                    cursor={{ strokeDasharray: '3 3' }}
                  />
                  <Scatter data={scatterData} fill={ACCENT} />
                </ScatterChart>
              </ResponsiveContainer>
            )}
          </ChartCard>
        </div>
      )}
    </div>
  );
}
