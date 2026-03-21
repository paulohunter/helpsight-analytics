import pandas as pd
import io
import os
import json
from dotenv import load_dotenv

load_dotenv()
INSIGHTS_MODE = os.getenv("INSIGHTS_MODE", "local").lower()
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")

if INSIGHTS_MODE == "ai" and GEMINI_API_KEY:
    import google.generativeai as genai
    genai.configure(api_key=GEMINI_API_KEY)

def time_to_hours(time_str):
    if pd.isna(time_str) or time_str == "":
        return 0.0
    try:
        parts = str(time_str).split(":")
        if len(parts) == 3:
            return int(parts[0]) + int(parts[1])/60 + int(parts[2])/3600
        elif len(parts) == 2:
            return int(parts[0]) + int(parts[1])/60
        return 0.0
    except:
        return 0.0

def calc_mom(curr, prev):
    if prev == 0: return 100.0 if curr > 0 else 0.0
    return round(((curr - prev) / prev) * 100, 1)

def get_trend(mom, inverted=False):
    if mom > 1: return 'down' if inverted else 'up'
    if mom < -1: return 'up' if inverted else 'down'
    return 'neutral'

def parse_csat(val):
    if pd.isna(val): return None
    v = str(val).lower().strip()
    if v in ['5', 'extremamente satisfeito', 'muito satisfeito', 'extremely satisfied']: return 5.0
    if v in ['4', 'satisfeito', 'satisfied']: return 4.0
    if v in ['3', 'neutro', 'neutral', 'regular']: return 3.0
    if v in ['2', 'insatisfeito', 'dissatisfied']: return 2.0
    if v in ['1', 'extremamente insatisfeito', 'muito insatisfeito', 'extremely dissatisfied']: return 1.0
    try:
        n = float(val)
        if 1.0 <= n <= 5.0: return n
    except: pass
    return None

def _compute_metrics_for_df(df, prev_df=None):
    total_tickets = len(df)
    prev_total = len(prev_df) if prev_df is not None else 0
    t_mom = calc_mom(total_tickets, prev_total)
    
    resolved_statuses = ['Resolved', 'Closed']
    
    t_res = df[df['Status'].isin(resolved_statuses)].shape[0] if total_tickets > 0 and 'Status' in df.columns else 0
    p_res = prev_df[prev_df['Status'].isin(resolved_statuses)].shape[0] if prev_df is not None and len(prev_df) > 0 and 'Status' in prev_df.columns else 0
    res_mom = calc_mom(t_res, p_res)
    
    t_open = total_tickets - t_res
    p_open = prev_total - p_res
    open_mom = calc_mom(t_open, p_open)
    
    sla_met = df[df['Estado da resolução'] == 'Within SLA'].shape[0] if 'Estado da resolução' in df.columns else 0
    sla_perc = (sla_met / total_tickets * 100) if total_tickets > 0 else 0
    
    p_sla_met = prev_df[prev_df['Estado da resolução'] == 'Within SLA'].shape[0] if prev_df is not None and 'Estado da resolução' in prev_df.columns else 0
    p_sla_perc = (p_sla_met / prev_total * 100) if prev_total > 0 else 0
    sla_mom = calc_mom(sla_perc, p_sla_perc)

    avg_frt = df['FRT_hours'].mean() if (total_tickets > 0 and not df['FRT_hours'].isna().all()) else 0
    p_frt = prev_df['FRT_hours'].mean() if prev_df is not None and len(prev_df) > 0 and not prev_df['FRT_hours'].isna().all() else 0
    frt_mom = calc_mom(avg_frt, p_frt)

    avg_ttr = df['TTR_hours'].mean() if (total_tickets > 0 and not df['TTR_hours'].isna().all()) else 0
    p_ttr = prev_df['TTR_hours'].mean() if prev_df is not None and len(prev_df) > 0 and not prev_df['TTR_hours'].isna().all() else 0
    ttr_mom = calc_mom(avg_ttr, p_ttr)
    
    csat = 4.5
    csat_mom = 0.0
    if 'Resultados da pesquisa' in df.columns:
        parsed_s = df['Resultados da pesquisa'].apply(parse_csat).dropna()
        if not parsed_s.empty:
            csat = parsed_s.mean()
            p_csat = csat
            if prev_df is not None and 'Resultados da pesquisa' in prev_df.columns:
                p_parsed_s = prev_df['Resultados da pesquisa'].apply(parse_csat).dropna()
                if not p_parsed_s.empty:
                    p_csat = p_parsed_s.mean()
            csat_mom = calc_mom(csat, p_csat)

    def get_top(column_name, top_n=5):
        if column_name in df.columns:
            counts = df[column_name].value_counts().head(top_n).to_dict()
            return [{"name": str(k), "value": int(v)} for k, v in counts.items()]
        return []

    # System Insights
    insights = []
    
    # AI Mode Strategy
    if INSIGHTS_MODE == 'ai' and GEMINI_API_KEY:
        try:
            model = genai.GenerativeModel('gemini-1.5-flash')
            prompt = f"""
Você é um assistente de inteligência artificial de um sistema de Helpdesk (HelpSight Analytics).
Analise as seguintes métricas de suporte deste mês vs o mês anterior e retorne EXATAMENTE 3 insights curtos para a equipe de suporte em formato JSON válido.
Métricas: Volume MoM: {t_mom}%, Backlog MoM: {open_mom}%, SLA: {round(sla_perc, 1)}%, Variação SLA: {sla_mom}%, Variação TTR: {ttr_mom}%, CSAT: {round(csat, 1)}

Regras e formato: 
- O JSON precisa ser uma lista pura: [{{"type": "tipo", "message": "msg"}}] (não inclua markdown como ```json).
- "type" deve ser estritamente: "positive", "negative", "neutral", ou "warning".
- "message" deve ser um texto conciso e analítico em português (max 120 chars).
"""
            response = model.generate_content(prompt)
            response_text = response.text.replace("```json", "").replace("```", "").strip()
            ai_insights = json.loads(response_text)
            
            if isinstance(ai_insights, list) and len(ai_insights) > 0 and 'type' in ai_insights[0]:
                insights = ai_insights
        except Exception as e:
            print(f"Gemini AI Insight Error: {e}")
            insights = []

    # Local fallback strategy se a IA estiver desativada ou falhar
    if len(insights) == 0:
        if t_mom > 15:
            insights.append({"type": "warning", "message": f"Volume de tickets subiu {t_mom}% em relação ao período anterior."})
        if sla_perc >= 95:
            insights.append({"type": "positive", "message": f"SLA excepcional ({round(sla_perc, 1)}%), acima da meta operacional."})
        elif sla_perc < 80 and total_tickets > 0:
            insights.append({"type": "negative", "message": f"Atenção: SLA crítico ({round(sla_perc, 1)}%). Priorize a fila de Backlog."})
        if ttr_mom > 10:
            insights.append({"type": "negative", "message": f"O TTR (Tempo de Resolução) subiu {ttr_mom}%, indicando gargalos na operação."})
        elif ttr_mom < -10:
            insights.append({"type": "positive", "message": f"Sua equipe está resolvendo tickets {abs(ttr_mom)}% mais rápido!"})
        
        if len(insights) == 0:
            insights.append({"type": "neutral", "message": "Operação estável com variações dentro da normalidade estatística."})

    time_perf = []
    if 'Agente' in df.columns:
        for agent in df['Agente'].dropna().unique():
            if str(agent).lower() == 'nan' or str(agent) == 'No Agent': continue
            agent_df = df[df['Agente'] == agent]
            a_res = agent_df[agent_df['Status'].isin(resolved_statuses)].shape[0] if 'Status' in df.columns else 0
            a_ttr = agent_df['TTR_hours'].mean() if not agent_df['TTR_hours'].isna().all() else 0.0
            a_frt = agent_df['FRT_hours'].mean() if not agent_df['FRT_hours'].isna().all() else 0.0
            
            a_csat = 4.5
            if 'Resultados da pesquisa' in agent_df.columns:
                parsed_a = agent_df['Resultados da pesquisa'].apply(parse_csat).dropna()
                if not parsed_a.empty:
                    a_csat = parsed_a.mean()
            
            p_res = 0
            if prev_df is not None and 'Agente' in prev_df.columns:
                p_agent_df = prev_df[prev_df['Agente'] == agent]
                p_res = p_agent_df[p_agent_df['Status'].isin(resolved_statuses)].shape[0] if 'Status' in prev_df.columns else 0
            
            a_mom = calc_mom(a_res, p_res)
            
            badge = "Consistente"
            if a_res > 20 and a_ttr <= avg_ttr: badge = "Top Performer"
            elif a_ttr > (avg_ttr * 1.5) and a_res > 0: badge = "Atenção"
            
            time_perf.append({
                "agent": str(agent),
                "resolved": int(a_res),
                "avgTtrHours": round(float(a_ttr), 2) if not pd.isna(a_ttr) else 0.0,
                "avgFrtHours": round(float(a_frt), 2) if not pd.isna(a_frt) else 0.0,
                "csat": round(float(a_csat), 1),
                "reopenRate": 5.0,
                "badge": badge,
                "trend": get_trend(a_mom)
            })
    time_perf = sorted(time_perf, key=lambda x: x['resolved'], reverse=True)[:10]

    return {
        "gerais": {
            "totalTickets": { "value": total_tickets, "mom": t_mom, "trend": get_trend(t_mom) },
            "ticketsOpen": { "value": t_open, "mom": open_mom, "trend": get_trend(open_mom, inverted=True) },
            "ticketsResolved": { "value": t_res, "mom": res_mom, "trend": get_trend(res_mom) },
            "slaPercentage": { "value": round(sla_perc, 1), "mom": sla_mom, "trend": get_trend(sla_mom) },
            "avgFrtHours": { "value": round(float(avg_frt), 2), "mom": frt_mom, "trend": get_trend(frt_mom, inverted=True) },
            "avgTtrHours": { "value": round(float(avg_ttr), 2), "mom": ttr_mom, "trend": get_trend(ttr_mom, inverted=True) },
            "avgCsat": { "value": round(float(csat), 1), "mom": csat_mom, "trend": get_trend(csat_mom) }
        },
        "classificacao": {
            "categorias": get_top('Categoria'),
            "subcategorias": get_top('Subcategoria'),
            "areaAtuacao": get_top('Areá de atuação'),
            "localizacao": get_top('Local de atuação'),
            "ufs": get_top('UF'),
            "tipos": get_top('Tipo')
        },
        "performance": time_perf,
        "insights": insights
    }

def process_freshdesk_csv(csv_bytes: bytes) -> dict:
    df = pd.read_csv(io.BytesIO(csv_bytes))
    df['Hora da criação'] = pd.to_datetime(df['Hora da criação'], errors='coerce')
    df['Hora da resolução'] = pd.to_datetime(df['Hora da resolução'], errors='coerce')
    
    if 'Tempo de resolução (em horas)' in df.columns:
        df['TTR_hours'] = df['Tempo de resolução (em horas)'].apply(time_to_hours)
    else:
        df['TTR_hours'] = 0.0
        
    if 'Tempo até a primeira resposta (em horas)' in df.columns:
        df['FRT_hours'] = df['Tempo até a primeira resposta (em horas)'].apply(time_to_hours)
    else:
        df['FRT_hours'] = 0.0
        
    df['Mes_Criacao'] = df['Hora da criação'].dt.to_period('M').astype(str)
    
    created_per_month = df['Mes_Criacao'].value_counts().to_dict()
    df['Mes_Resolucao'] = df['Hora da resolução'].dt.to_period('M').astype(str)
    resolved_per_month = df['Mes_Resolucao'].value_counts().to_dict()
    
    all_months = sorted(list(set(created_per_month.keys()).union(set(resolved_per_month.keys()))))
    backlog = []
    
    for month in all_months:
        if month == 'NaT': continue
        month_df = df[df['Mes_Criacao'] == month]
        m_total = len(month_df)
        m_sla_met = month_df[month_df['Estado da resolução'] == 'Within SLA'].shape[0] if 'Estado da resolução' in month_df.columns else 0
        m_sla = (m_sla_met / m_total * 100) if m_total > 0 else 0
        backlog.append({
            "month": month,
            "created": int(created_per_month.get(month, 0)),
            "resolved": int(resolved_per_month.get(month, 0)),
            "sla": round(m_sla, 1)
        })
        
    all_data = _compute_metrics_for_df(df)
    
    months_data = {}
    for i, month in enumerate(all_months):
        if month == 'NaT': continue
        month_df = df[df['Mes_Criacao'] == month]
        
        prev_df = None
        if i > 0:
            prev_m = all_months[i-1]
            if prev_m != 'NaT':
                prev_df = df[df['Mes_Criacao'] == prev_m]
                
        months_data[month] = _compute_metrics_for_df(month_df, prev_df)
        
    return {
        "all": all_data,
        "months": months_data,
        "backlog": backlog,
        "availableMonths": [m for m in all_months if m != 'NaT']
    }
