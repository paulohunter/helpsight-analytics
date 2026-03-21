import { AgentPerformance } from "@/types";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowUp, faArrowDown, faMinus, faUserCircle } from "@fortawesome/free-solid-svg-icons";

export function AgentCard({ agent }: { agent: AgentPerformance }) {
  return (
    <div className="flex items-center justify-between p-4 rounded-xl bg-background/50 border border-white/5 hover:bg-muted/60 transition-colors group shadow-sm flex-col md:flex-row gap-4 h-full">
      <div className="flex items-center gap-4 w-full">
        <FontAwesomeIcon icon={faUserCircle} className="text-4xl text-muted-foreground/30 group-hover:text-primary/50 transition-colors" />
        <div className="flex-1">
          <p className="font-semibold text-sm leading-none text-foreground">{agent.agent}</p>
          <div className="flex flex-wrap items-center gap-2 mt-2">
            <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full tracking-wide ${
              agent.badge === 'Top Performer' ? 'bg-green-500/10 text-green-500' :
              agent.badge === 'Atenção' ? 'bg-red-500/10 text-red-500' :
              'bg-blue-500/10 text-blue-500'
            }`}>
              {agent.badge}
            </span>
            <span className="text-[11px] text-muted-foreground font-medium flex flex-wrap gap-2 items-center">
              <span title="Tempo Médio de 1ª Resposta">FRT: {agent.avgFrtHours}h</span>
              <span className="w-1 h-1 rounded-full bg-white/10" />
              <span title="Tempo Médio de Resolução">TTR: {agent.avgTtrHours}h</span>
              <span className="w-1 h-1 rounded-full bg-white/10" />
              <span className="text-yellow-500 font-bold" title="CSAT Médio">★ {agent.csat}</span>
            </span>
          </div>
        </div>
      </div>
      
      <div className="text-right">
        <p className="font-bold text-xl leading-none">{agent.resolved}</p>
        <div className={`text-xs flex items-center justify-end gap-1 mt-1 font-medium ${
          agent.trend === 'up' ? "text-green-500" : 
          agent.trend === 'down' ? "text-red-500" : "text-blue-500"
        }`}>
          {agent.trend === 'up' ? <FontAwesomeIcon icon={faArrowUp} className="w-2.5 h-2.5"/> : 
           agent.trend === 'down' ? <FontAwesomeIcon icon={faArrowDown} className="w-2.5 h-2.5"/> : 
           <FontAwesomeIcon icon={faMinus} className="w-2.5 h-2.5"/>}
          <span>resolvidos</span>
        </div>
      </div>
    </div>
  )
}
