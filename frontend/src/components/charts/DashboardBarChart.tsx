import { BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

interface BarChartProps {
  title: string;
  data: any[];
  dataKey?: string;
}

export function DashboardBarChart({ title, data, dataKey = "value" }: BarChartProps) {
  const gradientId = title.replace(/[^a-zA-Z0-9]/g, '');
  const contentHeight = Math.max(250, data.length * 35);

  return (
    <div className="border border-white/5 bg-card/40 backdrop-blur-sm rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 p-5 group flex flex-col h-full min-h-[320px]">
      <h3 className="font-semibold text-sm text-foreground mb-4 tracking-tight">{title}</h3>
      <div className="flex-1 w-full overflow-y-auto overflow-x-hidden pr-2 custom-scrollbar">
        <div style={{ height: `${contentHeight}px`, minHeight: '100%' }} className="w-full">
          <ResponsiveContainer width="100%" height="100%">
            <RechartsBarChart data={data} layout="vertical" margin={{ top: 0, right: 20, left: 10, bottom: 0 }}>
              <defs>
                <linearGradient id={`${gradientId}-top1`} x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="var(--color-primary)" />
                  <stop offset="100%" stopColor="var(--color-chart-4)" />
                </linearGradient>
                <linearGradient id={`${gradientId}-normal`} x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="var(--color-primary)" stopOpacity={0.6} />
                  <stop offset="100%" stopColor="var(--color-primary)" stopOpacity={0.9} />
                </linearGradient>
              </defs>
              <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }} />
              <YAxis dataKey="name" type="category" width={110} axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "var(--color-foreground)", fontWeight: 500 }} />
              <Tooltip 
                cursor={{ fill: 'var(--color-muted)', opacity: 0.4 }} 
                contentStyle={{ backgroundColor: 'var(--color-popover)', borderColor: 'var(--color-border)', borderRadius: '8px', color: 'var(--color-popover-foreground)' }} 
                itemStyle={{ fontWeight: 600, color: 'var(--color-popover-foreground)' }}
                formatter={(val: number) => [val, "Tickets"]} 
              />
              <Bar dataKey={dataKey} radius={[0, 4, 4, 0]} animationDuration={1500} fill="var(--color-primary)">
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={index === 0 ? `url(#${gradientId}-top1)` : `url(#${gradientId}-normal)`} />
                ))}
              </Bar>
            </RechartsBarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
