import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";

const COLORS = ["var(--color-primary)", "var(--color-chart-2)", "var(--color-chart-3)", "var(--color-chart-4)", "var(--color-chart-5)"];

export function DashboardPieChart({ title, data }: { title: string, data: any[] }) {
  if (!data || data.length === 0) return null;

  return (
    <div className="border border-white/5 bg-card/40 backdrop-blur-sm rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 p-5 group flex flex-col h-full min-h-[320px]">
      <h3 className="font-semibold text-sm text-foreground mb-4 tracking-tight">{title}</h3>
      <div className="h-[250px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              innerRadius={0}
              outerRadius={95}
              paddingAngle={2}
              dataKey="value"
              nameKey="name"
              stroke="none"
              animationDuration={1500}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{ backgroundColor: 'var(--color-popover)', borderColor: 'var(--color-border)', borderRadius: '8px', color: 'var(--color-popover-foreground)' }} 
              itemStyle={{ fontWeight: 600, color: 'var(--color-popover-foreground)' }}
              formatter={(val: number) => [val, "Tickets"]} 
            />
            <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '11px', color: 'var(--color-muted-foreground)' }} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
