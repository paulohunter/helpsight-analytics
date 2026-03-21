import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowUp, faArrowDown, faMinus } from "@fortawesome/free-solid-svg-icons";

interface MetricCardProps {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  mom?: number;
  trend?: 'up' | 'down' | 'neutral';
  variant?: 'default' | 'primary' | 'warning' | 'danger';
  description?: string;
}

export function MetricCard({ title, value, icon, mom, trend, variant = 'default', description }: MetricCardProps) {
  const isPrimary = variant === 'primary';
  const isWarning = variant === 'warning';
  const isDanger = variant === 'danger';
  
  return (
    <Card className={cn(
      "relative overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 backdrop-blur-sm border-white/10",
      isPrimary ? "bg-gradient-to-br from-primary/20 via-card to-card shadow-lg border-primary/20" : 
      isWarning ? "bg-gradient-to-br from-yellow-500/10 via-card to-card border-yellow-500/20" :
      isDanger ? "bg-gradient-to-br from-red-500/10 via-card to-card border-red-500/20" :
      "bg-card/80 shadow-md"
    )}>
      {isPrimary && <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -mr-10 -mt-10" />}
      <CardHeader className="flex flex-row items-center justify-between pb-2 z-10 relative">
        <CardTitle className={cn("text-sm font-medium", isPrimary ? "text-foreground" : "text-muted-foreground")}>
          {title}
        </CardTitle>
        <div className={cn("h-8 w-8 rounded-full flex items-center justify-center backdrop-blur-md", 
          isPrimary ? "bg-primary/20 text-primary" : 
          isWarning ? "bg-yellow-500/20 text-yellow-500" :
          isDanger ? "bg-red-500/20 text-red-500" :
          "bg-muted/50 text-muted-foreground"
        )}>
          {icon}
        </div>
      </CardHeader>
      <CardContent className="z-10 relative">
        <div className={cn("font-bold tracking-tight", isPrimary ? "text-4xl" : "text-2xl")}>{value}</div>
        
        {mom !== undefined && trend && (
          <div className="mt-3 flex items-center text-xs font-medium">
            <span className={cn(
              "flex items-center gap-1 px-1.5 py-0.5 rounded-md",
              trend === 'up' ? "text-green-500 bg-green-500/10" : 
              trend === 'down' ? "text-red-500 bg-red-500/10" : 
              "text-blue-500 bg-blue-500/10"
            )}>
              {trend === 'up' ? <FontAwesomeIcon icon={faArrowUp} className="w-3 h-3"/> : 
               trend === 'down' ? <FontAwesomeIcon icon={faArrowDown} className="w-3 h-3"/> : 
               <FontAwesomeIcon icon={faMinus} className="w-3 h-3"/>}
              {Math.abs(mom).toFixed(1)}%
            </span>
            <span className="text-muted-foreground ml-2 truncate">vs mês anterior</span>
          </div>
        )}
      </CardContent>

      {/* Custom Hover Tooltip */}
      {description && (
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-48 p-2 bg-popover text-popover-foreground text-xs rounded-lg shadow-xl opacity-0 group-hover:opacity-100 group-hover:-translate-y-2 transition-all duration-300 pointer-events-none z-50 text-center border border-white/10 font-medium">
          {description}
          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 border-popover border-t-4 border-x-4 border-x-transparent w-0 h-0" />
        </div>
      )}
    </Card>
  );
}
