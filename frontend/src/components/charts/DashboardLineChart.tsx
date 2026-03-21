import { LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, ReferenceLine } from "recharts";

interface LineChartProps {
  title: string;
  data: any[];
}

export function DashboardLineChart({ title, data }: LineChartProps) {
  const formatXAxis = (tickItem: string) => {
    if (!tickItem) return '';
    if (tickItem.match(/^\d{4}-\d{2}-\d{2}$/)) {
      const [year, month, day] = tickItem.split('-');
      return `${day}/${month}`;
    }
    if (tickItem.match(/^\d{4}-\d{2}$/)) {
      const [year, month] = tickItem.split('-');
      return `${month}/${year.slice(2)}`;
    }
    return tickItem;
  };

  return (
    <div className="border border-white/5 rounded-2xl bg-card/50 backdrop-blur-md shadow-lg p-6 hover:shadow-xl transition-shadow duration-300 h-full flex flex-col group">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-semibold text-lg tracking-tight">{title}</h3>
      </div>
      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <RechartsLineChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted-foreground/10" vertical={false} />
            <XAxis dataKey="period" tickFormatter={formatXAxis} tick={{ fontSize: 12, fill: "var(--color-muted-foreground)" }} axisLine={false} tickLine={false} tickMargin={12} />
            <YAxis yAxisId="left" tick={{ fontSize: 12, fill: "var(--color-muted-foreground)" }} axisLine={false} tickLine={false} tickMargin={12} />
            <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12, fill: "var(--color-muted-foreground)" }} domain={[0, 100]} axisLine={false} tickLine={false} tickMargin={12} />
            
            <Tooltip 
              contentStyle={{ backgroundColor: 'var(--color-popover)', borderColor: 'var(--color-border)', borderRadius: '12px', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)', color: 'var(--color-popover-foreground)' }}
              itemStyle={{ fontWeight: 500 }}
            />
            
            <Legend verticalAlign="top" height={40} iconType="circle" wrapperStyle={{ fontSize: '13px', fontWeight: 500 }} />
            
            <ReferenceLine y={90} yAxisId="right" stroke="var(--color-destructive)" strokeDasharray="4 4" label={{ position: 'insideTopLeft', value: 'Meta de SLA (90%)', fill: 'var(--color-destructive)', fontSize: 11, fontWeight: 600 }} />
            
            <Line yAxisId="left" type="monotone" dataKey="created" stroke="var(--color-chart-1)" strokeWidth={3} name="Tickets Criados" 
                  dot={{ r: 4, strokeWidth: 2, fill: "var(--color-card)" }} activeDot={{ r: 8, strokeWidth: 0 }} animationDuration={1500} />
            <Line yAxisId="left" type="monotone" dataKey="resolved" stroke="var(--color-chart-2)" strokeWidth={3} name="Tickets Resolvidos" 
                  dot={{ r: 4, strokeWidth: 2, fill: "var(--color-card)" }} activeDot={{ r: 8, strokeWidth: 0 }} animationDuration={1500} />
            <Line yAxisId="right" type="monotone" dataKey="sla" stroke="var(--color-chart-3)" strokeWidth={3} name="SLA Consolidado (%)" 
                  dot={{ r: 4, strokeWidth: 2, fill: "var(--color-card)" }} activeDot={{ r: 8, strokeWidth: 0 }} animationDuration={1500} />
          </RechartsLineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
