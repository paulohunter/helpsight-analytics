import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faLightbulb, faCheckCircle, faExclamationTriangle, faInfoCircle } from "@fortawesome/free-solid-svg-icons"
import { SystemInsight } from "@/types"

export function InsightCard({ insights }: { insights: SystemInsight[] }) {
  if (!insights || insights.length === 0) return null;
  
  const getIcon = (type: string) => {
    switch (type) {
      case 'positive': return <FontAwesomeIcon icon={faCheckCircle} className="text-green-500 text-lg mt-0.5" />
      case 'negative': return <FontAwesomeIcon icon={faExclamationTriangle} className="text-red-500 text-lg mt-0.5" />
      case 'warning': return <FontAwesomeIcon icon={faExclamationTriangle} className="text-yellow-500 text-lg mt-0.5" />
      default: return <FontAwesomeIcon icon={faInfoCircle} className="text-blue-500 text-lg mt-0.5" />
    }
  }

  return (
    <Card className="flex flex-col h-full max-h-[400px] min-h-[320px] bg-card/50 backdrop-blur-md border border-white/10 shadow-lg relative overflow-hidden group hover:shadow-xl transition-all duration-300">
      <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-primary via-purple-500 to-pink-500" />
      <CardHeader className="pb-4 pl-6 flex-shrink-0">
        <CardTitle className="text-xl flex items-center gap-2">
          <FontAwesomeIcon icon={faLightbulb} className="text-yellow-400" />
          Insights do Sistema
        </CardTitle>
      </CardHeader>
      <CardContent className="pl-6 pb-6 flex-1 overflow-hidden flex flex-col">
        <ul className="space-y-3 h-full overflow-y-auto pr-4 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
          {insights.map((insight, idx) => (
            <li key={idx} className="flex items-start gap-4 p-4 rounded-xl bg-background/60 hover:bg-background/80 transition-colors border border-white/5 text-sm font-medium shadow-sm">
              {getIcon(insight.type)}
              <span className="leading-snug">{insight.message}</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}
