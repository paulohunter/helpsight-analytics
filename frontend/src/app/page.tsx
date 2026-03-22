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
import { DashboardKeywords } from "@/components/DashboardKeywords";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faClock, faCheckCircle, faTicketAlt, faChartLine, faStar, faUsers, faCalendarAlt, faSpinner, faArrowLeft, faArrowUp, faArrowDown, faMinus, faSortAmountDown, faChartBar } from "@fortawesome/free-solid-svg-icons";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format, parse, subDays, startOfYear, startOfMonth, subYears, endOfYear } from "date-fns";
import { ptBR } from "date-fns/locale";

import { DateRange } from "react-day-picker";

function SkeletonGrid() {
  return (
    <div className="relative space-y-8 animate-pulse">
      <div className="absolute inset-0 flex flex-col items-center justify-center z-50 bg-background/40 backdrop-blur-sm rounded-xl">
        <FontAwesomeIcon icon={faSpinner} spin className="text-5xl text-primary mb-4" />
        <p className="text-lg font-medium text-foreground">Processando dados, aguarde...</p>
      </div>
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
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [view, setView] = useState<'dashboard' | 'requesters' | 'keywords'>('dashboard');
  const [requesterFilter, setRequesterFilter] = useState<'all' | 'up' | 'down' | 'neutral'>('all');

  const handleDateSelect = (range: DateRange | undefined) => {
    setDateRange(range);
  };

  const applyPresetFilter = async (preset: number | 'year' | 'this_month' | 'last_year') => {
    let to = new Date();
    let from: Date;
    if (preset === 'year') {
      from = startOfYear(to);
    } else if (preset === 'this_month') {
      from = startOfMonth(to);
    } else if (preset === 'last_year') {
      const lastYearDate = subYears(to, 1);
      from = startOfYear(lastYearDate);
      to = endOfYear(lastYearDate);
    } else {
      from = subDays(to, preset as number);
    }
    setDateRange({ from, to });
    
    if (uploadedFile) {
      setIsCalendarOpen(false);
      setIsLoading(true);
      setError(null);
      try {
        const startStr = format(from, "yyyy-MM-dd");
        const endStr = format(to, "yyyy-MM-dd");
        const data = await uploadCsvFile(uploadedFile, startStr, endStr);
        setMetrics(data);
        setSelectedMonth("all"); 
      } catch (err: any) {
         setError(err.message || "Failed to process preset date");
      } finally {
        setIsLoading(false);
      }
    }
  };

  const applyDateFilter = async () => {
    if (dateRange?.from && dateRange?.to && uploadedFile) {
      setIsCalendarOpen(false);
      setIsLoading(true);
      setError(null);
      try {
        const startStr = format(dateRange.from, "yyyy-MM-dd");
        const endStr = format(dateRange.to, "yyyy-MM-dd");
        const data = await uploadCsvFile(uploadedFile, startStr, endStr);
        setMetrics(data);
        setSelectedMonth("all"); // The backend already filtered everything, so we show 'all' locally
      } catch (err: any) {
         setError(err.message || "Failed to process date range");
      } finally {
        setIsLoading(false);
      }
    }
  };

  const clearDateFilter = async () => {
    setDateRange(undefined);
    setIsCalendarOpen(false);
    if (uploadedFile) {
      setIsLoading(true);
      setError(null);
      try {
        const data = await uploadCsvFile(uploadedFile);
        setMetrics(data);
        setSelectedMonth("all");
      } catch (err: any) {
        setError(err.message || "Failed to reset date range");
      } finally {
        setIsLoading(false);
      }
    } else {
      setSelectedMonth("all");
    }
  };

  const handleUpload = async (file: File) => {
    setIsLoading(true);
    setError(null);
    setUploadedFile(file);
    setDateRange(undefined);
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
      {view === 'keywords' && currentData ? (
        <DashboardKeywords data={currentData} setView={setView} />
      ) : view === 'requesters' && currentData ? (
        <div className="max-w-[1440px] mx-auto p-4 md:p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <header className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 py-4 border-b border-white/5">
            <div className="space-y-1">
              <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-blue-400 bg-clip-text text-transparent">
                Top Solicitantes
              </h1>
              <p className="text-sm text-muted-foreground">Pessoas com mais tickets abertos neste período</p>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="outline" className="gap-2 bg-card/50" onClick={() => setView('dashboard')}>
                <FontAwesomeIcon icon={faArrowLeft} /> Voltar para Dashboard
              </Button>
              <ThemeToggle />
            </div>
          </header>

          {/* Filter Buttons */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground mr-1">Filtrar variação:</span>
            <button
              onClick={() => setRequesterFilter('all')}
              className={`px-4 py-1.5 text-xs font-semibold rounded-full border transition-colors ${requesterFilter === 'all' ? 'bg-primary text-white border-primary' : 'border-white/10 text-muted-foreground hover:border-primary hover:text-primary'}`}
            >Todos</button>
            <button
              onClick={() => setRequesterFilter('up')}
              className={`inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold rounded-full border transition-colors ${requesterFilter === 'up' ? 'bg-destructive/20 text-destructive border-destructive' : 'border-white/10 text-muted-foreground hover:border-destructive hover:text-destructive'}`}
            ><FontAwesomeIcon icon={faArrowUp} /> Subiu</button>
            <button
              onClick={() => setRequesterFilter('down')}
              className={`inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold rounded-full border transition-colors ${requesterFilter === 'down' ? 'bg-emerald-500/20 text-emerald-500 border-emerald-500' : 'border-white/10 text-muted-foreground hover:border-emerald-500 hover:text-emerald-500'}`}
            ><FontAwesomeIcon icon={faArrowDown} /> Caiu</button>
            <button
              onClick={() => setRequesterFilter('neutral')}
              className={`inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold rounded-full border transition-colors ${requesterFilter === 'neutral' ? 'bg-muted text-foreground border-foreground/30' : 'border-white/10 text-muted-foreground hover:border-foreground/30 hover:text-foreground'}`}
            ><FontAwesomeIcon icon={faMinus} /> Estável</button>
          </div>

          <div className="border border-white/5 bg-card/40 backdrop-blur-sm rounded-2xl shadow-lg p-6 overflow-hidden">
             <div className="overflow-x-auto">
               <table className="w-full text-sm text-left">
                 <thead className="text-xs text-muted-foreground uppercase bg-muted/20">
                   <tr>
                     <th className="px-4 py-4 font-semibold rounded-tl-lg text-center w-12">#</th>
                     <th className="px-6 py-4 font-semibold">Nome Completo</th>
                     <th className="px-6 py-4 font-semibold">E-mail</th>
                     <th className="px-6 py-4 font-semibold text-center">Volume (Abertos)</th>
                     <th className="px-6 py-4 font-semibold text-center rounded-tr-lg">Variação</th>
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-white/5">
                   {currentData.requesters
                     .filter(req => requesterFilter === 'all' || req.trend === requesterFilter)
                     .map((req, i) => (
                     <tr key={i} className="hover:bg-muted/10 transition-colors">
                       <td className="px-4 py-4 text-center">
                         <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold ${i === 0 ? 'bg-yellow-500/20 text-yellow-400' : i === 1 ? 'bg-slate-400/20 text-slate-400' : i === 2 ? 'bg-orange-600/20 text-orange-500' : 'bg-muted/30 text-muted-foreground'}`}>
                           {currentData.requesters.indexOf(req) + 1}
                         </span>
                       </td>
                       <td className="px-6 py-4 font-medium text-foreground">{req.name}</td>
                       <td className="px-6 py-4 text-muted-foreground">{req.email || '-'}</td>
                       <td className="px-6 py-4 text-center font-bold text-primary">{req.count}</td>
                       <td className="px-6 py-4">
                         <div className="flex justify-center items-center">
                           <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                             req.trend === 'up' ? 'bg-destructive/10 text-destructive' : 
                             req.trend === 'down' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-muted text-muted-foreground'
                           }`}>
                             <FontAwesomeIcon icon={req.trend === 'up' ? faArrowUp : req.trend === 'down' ? faArrowDown : faMinus} />
                             {req.mom > 0 ? '+' : ''}{req.mom}%
                           </div>
                         </div>
                       </td>
                     </tr>
                   ))}
                 </tbody>
               </table>
             </div>
          </div>
        </div>
      ) : (
      <div className="max-w-[1440px] mx-auto p-4 md:p-8 space-y-8 animate-in fade-in zoom-in-95 duration-500">
        
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
                  <PopoverTrigger className="inline-flex items-center justify-start text-left font-medium text-sm hover:bg-white/5 disabled:pointer-events-none disabled:opacity-50 px-4 py-2 rounded-md cursor-pointer min-w-[200px]">
                      <FontAwesomeIcon icon={faCalendarAlt} className="mr-3 text-muted-foreground" />
                      {dateRange?.from ? (
                        dateRange.to ? (
                          <span>{format(dateRange.from, "dd/MM/yy")} - {format(dateRange.to, "dd/MM/yy")}</span>
                        ) : (
                          <span>{format(dateRange.from, "dd/MM/yy")} - Selecione</span>
                        )
                      ) : selectedMonth !== "all" ? (
                        <span className="capitalize">{format(parse(selectedMonth, 'yyyy-MM', new Date()), "MMMM yyyy", { locale: ptBR })}</span>
                      ) : (
                        <span>Visão Consolidada</span>
                      )}
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <div className="p-3 pb-2 border-b border-border bg-muted/10">
                      <p className="text-xs font-semibold text-muted-foreground mb-2 px-1">Filtros Rápidos</p>
                      <div className="grid grid-cols-3 gap-2">
                        <Button variant="outline" size="sm" className="text-xs px-2 h-8" onClick={() => applyPresetFilter(30)} disabled={!uploadedFile}>30 dias</Button>
                        <Button variant="outline" size="sm" className="text-xs px-2 h-8" onClick={() => applyPresetFilter(90)} disabled={!uploadedFile}>90 dias</Button>
                        <Button variant="outline" size="sm" className="text-xs px-2 h-8" onClick={() => applyPresetFilter('this_month')} disabled={!uploadedFile}>Este Mês</Button>
                        <Button variant="outline" size="sm" className="text-xs px-2 h-8" onClick={() => applyPresetFilter('year')} disabled={!uploadedFile}>Este Ano</Button>
                        <Button variant="outline" size="sm" className="text-xs px-2 h-8 col-span-2" onClick={() => applyPresetFilter('last_year')} disabled={!uploadedFile}>Ano Passado</Button>
                      </div>
                    </div>
                    <Calendar
                      mode="range"
                      selected={dateRange}
                      onSelect={handleDateSelect}
                      disabled={dateRange?.from && !dateRange?.to ? [{ before: dateRange.from }] : undefined}
                      initialFocus
                      locale={ptBR}
                    />
                    <div className="p-2 border-t border-border flex flex-col gap-2">
                      <Button 
                        variant="default" 
                        size="sm" 
                        className="w-full text-xs font-semibold" 
                        onClick={applyDateFilter}
                        disabled={!dateRange?.from || !dateRange?.to}
                      >
                        Aplicar Filtro
                      </Button>
                      <Button variant="ghost" size="sm" className="w-full text-xs hover:bg-destructive/10 hover:text-destructive" onClick={clearDateFilter}>
                        Visão Consolidada Completa
                      </Button>
                    </div>
                  </PopoverContent>
                </Popover>
                
                <div className="w-px h-6 bg-border mx-2" />
                <Button variant="ghost" size="sm" onClick={() => setView('keywords')} className="text-sm gap-2 text-primary hover:text-primary/80">
                  <FontAwesomeIcon icon={faChartBar} /> P. Chave
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setView('requesters')} className="text-sm gap-2 text-primary hover:text-primary/80">
                  <FontAwesomeIcon icon={faSortAmountDown} /> Top Solicitantes
                </Button>
                <Button variant="ghost" size="sm" onClick={() => { setMetrics(null); setSelectedMonth("all"); setUploadedFile(null); setDateRange(undefined); }} className="text-sm">
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
                description="CSAT (Customer Satisfaction Score): Avaliação da satisfação dos clientes em uma escala de 1 a 5 estrelas. (Ótimo = 5, Regular = 3, Negativo = 1)."
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
        
        {/* FOOTER SECTION */}
        <footer className="mt-12 py-6 border-t border-white/5 flex flex-col items-center justify-center gap-1 opacity-70 hover:opacity-100 transition-opacity">
          <p className="text-sm text-muted-foreground">HelpSight Analytics &copy; {new Date().getFullYear()}</p>
          <p className="text-xs text-muted-foreground/60 font-mono">v1.0.0</p>
        </footer>
      </div>
      )}
    </div>
  );
}
