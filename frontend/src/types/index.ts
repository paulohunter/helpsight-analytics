export interface MetricValue {
  value: number;
  mom: number;
  trend: 'up' | 'down' | 'neutral';
}

export interface GeraisMetrics {
  totalTickets: MetricValue;
  ticketsOpen: MetricValue;
  ticketsResolved: MetricValue;
  slaPercentage: MetricValue;
  avgFrtHours: MetricValue;
  avgTtrHours: MetricValue;
  avgCsat: MetricValue;
}

export interface AgentPerformance {
  agent: string;
  resolved: number;
  avgTtrHours: number;
  avgFrtHours: number;
  csat: number;
  reopenRate: number;
  badge: string;
  trend: 'up' | 'down' | 'neutral';
}

export interface SystemInsight {
  type: 'positive' | 'negative' | 'neutral' | 'warning';
  message: string;
}

export interface MetricsPayload {
  gerais: GeraisMetrics;
  classificacao: {
    categorias: { name: string; value: number }[];
    subcategorias: { name: string; value: number }[];
    areaAtuacao: { name: string; value: number }[];
    localizacao: { name: string; value: number }[];
    ufs: { name: string; value: number }[];
    tipos: { name: string; value: number }[];
  };
  performance: AgentPerformance[];
  insights: SystemInsight[];
}

export interface MetricsResponse {
  all: MetricsPayload;
  months: Record<string, MetricsPayload>;
  backlog: {
    month: string;
    created: number;
    resolved: number;
    sla: number;
  }[];
  availableMonths: string[];
}
