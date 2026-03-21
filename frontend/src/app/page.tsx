"use client";

import { useState } from "react";
import { MetricCard } from "@/components/MetricCard";
import { InsightCard } from "@/components/InsightCard";
import { AgentCard } from "@/components/AgentCard";
import { FileUpload } from "@/components/FileUpload";
import { DashboardBarChart } from "@/components/charts/DashboardBarChart";
import { DashboardLineChart } from "@/components/charts/DashboardLineChart";
import { DashboardPieChart } from "@/components/charts/DashboardPieChart";
import { ThemeToggle } from "@/components/ThemeToggle";
import { uploadCsvFile } from "@/services/api";
import { MetricsResponse } from "@/types";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faClock, faCheckCircle, faTicketAlt, faChartLine, faStar, faUsers, faCalendarAlt } from "@fortawesome/free-solid-svg-icons";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format, parse } from "date-fns";
import { ptBR } from "date-fns/locale";

function SkeletonGrid() {
  return (
    <div className="space-y-8 animate-pulse">
      <div className="h-16 bg-muted/20 rounded-xl" />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        {[1,2,3,4,5].map(i => <div key={i} className="h-32 bg-muted/20 rounded-xl" />)}
      </div>
      <div className="grid gap-6 md:grid-cols-3">
        <div className="col-span-1 h-[400px] bg-muted/20 rounded-xl" />
        <div className="col-span-2 h-[400px] bg-muted/20 rounded-xl" />
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [metrics, setMetrics] = useState<MetricsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<string>("all");
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      const mm = format(date, "yyyy-MM");
      setSelectedMonth(mm);
      setIsCalendarOpen(false);
    } else {
      setSelectedMonth("all");
    }
  };

  const handleUpload = async (file: File) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await uploadCsvFile(file);
      setMetrics(data);
      
      if (data.availableMonths && data.availableMonths.length > 0) {
        const currentMonthStr = new Date().toISOString().slice(0, 7);
        if (data.availableMonths.includes(currentMonthStr)) {
          setSelectedMonth(currentMonthStr);
        } else {
          setSelectedMonth(data.availableMonths[data.availableMonths.length - 1]);
        }
      } else {
        setSelectedMonth("all");
      }
    } catch (err: any) {
      setError(err.message || "Failed to process file");
    } finally {
      setIsLoading(false);
    }
  };

  const currentData = metrics && selectedMonth !== "all" && metrics.months[selectedMonth] 
    ? metrics.months[selectedMonth] 
    : metrics?.all;

  return (
    <div className="min-h-screen bg-background text-foreground transition-all duration-300">
      <div className="max-w-[1440px] mx-auto p-4 md:p-8 space-y-8">
        
        {/* HEADER SECTION */}
        <header className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 py-4 border-b border-white/5">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center shadow-lg shadow-primary/20">
              <FontAwesomeIcon icon={faChartLine} className="text-white text-xl" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground">HelpSight Analytics</h1>
              <p className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                Painel de Inteligência Operacional
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-4 border border-white/5 bg-card/30 backdrop-blur-sm p-1.5 rounded-2xl shadow-sm z-50">
            {metrics && (
              <>
                <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="ghost"
                      className="w-[180px] justify-start text-left font-medium bg-transparent border-0 shadow-none hover:bg-white/5"
                    >
                      <FontAwesomeIcon icon={faCalendarAlt} className="mr-3 text-muted-foreground" />
                      {selectedMonth !== "all" ? (
                        <span className="capitalize">{format(parse(selectedMonth, 'yyyy-MM', new Date()), "MMMM yyyy", { locale: ptBR })}</span>
                      ) : (
                        <span>Visão Consolidada</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={selectedMonth !== "all" ? parse(selectedMonth, 'yyyy-MM', new Date()) : undefined}
                      onSelect={handleDateSelect}
                      initialFocus
                      locale={ptBR}
                    />
                    <div className="p-2 border-t border-border">
                      <Button variant="ghost" className="w-full text-xs" onClick={() => { setSelectedMonth("all"); setIsCalendarOpen(false); }}>
                        Ver Todo o Período
                      </Button>
                    </div>
                  </PopoverContent>
                </Popover>
                
                <div className="w-px h-6 bg-border mx-2" />
                <Button variant="ghost" size="sm" onClick={() => { setMetrics(null); setSelectedMonth("all"); }} className="text-sm">
                  Novo Upload
                </Button>
              </>
            )}
            <ThemeToggle />
          </div>
        </header>

        {/* LOADING STATE */}
        {isLoading && <SkeletonGrid />}

        {/* UPLOAD STATE */}
        {!isLoading && !metrics ? (
          <div className="max-w-2xl mx-auto mt-24 mb-32 z-10 relative">
            <div className="absolute inset-0 bg-primary/5 blur-[100px] rounded-full -z-10" />
            <FileUpload onUpload={handleUpload} isLoading={isLoading} />
            {error && <p className="text-destructive mt-6 text-center font-medium bg-destructive/10 p-4 rounded-xl border border-destructive/20">{error}</p>}
          </div>
        ) : null}

        {/* DASHBOARD CONTENT */}
        {!isLoading && metrics && currentData && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700 ease-out">
            
            {/* KPI SECTION */}
            <section className="grid gap-5 md:grid-cols-2 lg:grid-cols-6">
              <div className="lg:col-span-2">
                <MetricCard 
                  title="SLA Compliance" 
                  value={`${currentData.gerais.slaPercentage.value}%`} 
                  icon={<FontAwesomeIcon icon={faCheckCircle} className="text-xl"/>} 
                  mom={currentData.gerais.slaPercentage.mom}
                  trend={currentData.gerais.slaPercentage.trend}
                  variant={currentData.gerais.slaPercentage.value >= 90 ? 'primary' : 'warning'}
                  description="Percentual de tickets resolvidos dentro do prazo acordado (Service Level Agreement)."
                />
              </div>
              <MetricCard 
                title="Total de Tickets" 
                value={currentData.gerais.totalTickets.value} 
                icon={<FontAwesomeIcon icon={faTicketAlt} />} 
                mom={currentData.gerais.totalTickets.mom}
                trend={currentData.gerais.totalTickets.trend}
                description="Volume bruto de interações e demandas abertas no mês."
              />
              <MetricCard 
                title="Tempo de 1ª Resposta" 
                value={`${currentData.gerais.avgFrtHours.value}h`} 
                icon={<FontAwesomeIcon icon={faClock} />} 
                mom={currentData.gerais.avgFrtHours.mom}
                trend={currentData.gerais.avgFrtHours.trend}
                description="FRT (First Response Time): Tempo médio para o agente responder pela primeira vez."
              />
              <MetricCard 
                title="TTR Médio" 
                value={`${currentData.gerais.avgTtrHours.value}h`} 
                icon={<FontAwesomeIcon icon={faClock} />} 
                mom={currentData.gerais.avgTtrHours.mom}
                trend={currentData.gerais.avgTtrHours.trend}
                description="Time To Resolve: Tempo médio investido pela equipe para solucionar os chamados."
              />
              <MetricCard 
                title="CSAT" 
                value={currentData.gerais.avgCsat.value} 
                icon={<FontAwesomeIcon icon={faStar} />}
                trend="neutral"
                description="Customer Satisfaction Score: Média das avaliações de satisfação dos clientes."
              />
            </section>

            {/* MAIN ANALYTICS SECTION */}
            <section className="grid gap-6 md:grid-cols-3">
              
              {/* Left Column: AI Insights & Classifications */}
              <div className="col-span-1 flex flex-col gap-6">
                <InsightCard insights={currentData.insights} />
                <DashboardBarChart title="Área de Atuação" data={currentData.classificacao.areaAtuacao} />
                <DashboardPieChart title="Volume por Tipo" data={currentData.classificacao.tipos} />
              </div>

              {/* Middle & Right Column: Line Chart & Advanced Classifications */}
              <div className="col-span-2 flex flex-col gap-6">
                <DashboardLineChart title="Tendência e Volume (Histórico)" data={metrics.backlog} />
                
                <div className="grid grid-cols-2 gap-6 h-full">
                  <DashboardBarChart title="Volume por Categorias" data={currentData.classificacao.categorias} />
                  <DashboardBarChart title="Localização (UFs)" data={currentData.classificacao.ufs} />
                </div>
              </div>
            </section>

            {/* TEAM PERFORMANCE SECTION */}
            <section className="pt-4 border-t border-white/5">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-blue-500/10 rounded-lg">
                  <FontAwesomeIcon icon={faUsers} className="text-blue-500" />
                </div>
                <h2 className="text-xl font-bold tracking-tight">Performance do Time (Agentes)</h2>
              </div>
              
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {currentData.performance.map((agent) => (
                  <AgentCard key={agent.agent} agent={agent} />
                ))}
              </div>
            </section>

          </div>
        )}
      </div>
    </div>
  );
}
