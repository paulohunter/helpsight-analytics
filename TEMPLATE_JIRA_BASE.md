# TEMPLATE_JIRA_BASE.md
## Blueprint de Replicação — HelpSight Analytics Full Stack

> **Versão:** 1.0 · **Autor:** Antigravity (Arquiteto de Software) · **Data:** 2026-03-21  
> Este documento é o blueprint técnico e visual oficial do repositório `helpsight-analytics`.  
> Servindo de base para novos módulos, incluindo o ecossistema **Jira Analytics**.

---

## 1. Stack de Tecnologias — Backend

### 1.1 Linguagem e Framework
| Componente | Tecnologia | Versão |
|---|---|---|
| Linguagem | Python | 3.10.x |
| Framework API | FastAPI | 0.110.0 |
| Servidor ASGI | Uvicorn | 0.29.0 |
| Validação de dados | Pydantic | 2.6.3 |
| Upload multipart | python-multipart | 0.0.9 |

### 1.2 Bibliotecas de Processamento e IA
| Biblioteca | Função |
|---|---|
| `pandas 2.2.1` | Leitura, transformação e agregação dos dados do CSV exportado |
| `google-generativeai 0.4.1` | Integração com Gemini AI (insights contextuais e análise de keywords) |
| `python-dotenv 1.0.1` | Gerenciamento das variáveis de ambiente (`.env`) |

### 1.3 Variáveis de Ambiente (`.env`)
```env
INSIGHTS_MODE=ai           # 'ai' para usar Gemini | 'local' para insights estatísticos locais
GEMINI_API_KEY=AIza...     # Chave do Google AI Studio
```

### 1.4 Estrutura de Pastas da API
```
backend/
├── main.py                    # Entrypoint FastAPI, CORS, registro de routers
├── requirements.txt           # Dependências Python
├── .env                       # Variáveis de ambiente (não versionada)
└── app/
    ├── api/
    │   └── upload.py          # Router: POST /api/upload (recebe CSV via multipart/form-data)
    └── services/
        └── metrics.py         # Toda a lógica de negócio: parse do CSV, cálculo de KPIs, IA
```

### 1.5 Padrão de Rotas
| Método | Rota | Descrição |
|---|---|---|
| `GET` | `/` | Health check da API |
| `POST` | `/api/upload` | Recebe CSV (multipart), `start_date` e `end_date` opcionais como `Form` fields |

### 1.6 Fluxo de Dados (Backend)
```
CSV Upload (multipart/form-data)
        │
        ▼
  upload.py: lê bytes do arquivo → chama process_freshdesk_csv()
        │
        ▼
  metrics.py: pd.read_csv(io.BytesIO(csv_bytes))
        │  ├─ Normaliza colunas de data com pd.to_datetime(errors='coerce')
        │  ├─ Aplica filtro de período (start_date / end_date) se fornecido
        │  ├─ Calcula KPIs: total tickets, SLA, FRT, TTR, CSAT, backlog
        │  ├─ Gera ranking por agente, por solicitante, por categoria/localização
        │  ├─ Extrai keywords de domínio do texto (assunto/descrição)
        │  └─ [INSIGHTS_MODE=ai] Envia contexto ao Gemini → texto de análise
        │
        ▼
  Retorna JSON consolidado para o Frontend
```

### 1.7 Schema de Resposta da API
```json
{
  "all": <MetricsPayload>,
  "months": { "2024-01": <MetricsPayload>, ... },
  "backlog": [{ "period": "2024-01", "created": 120, "resolved": 95, "sla": 88.5 }],
  "availableMonths": ["2024-01", "2024-02", ...]
}
```

**MetricsPayload contém:**
- `gerais` — KPIs principais com valor, MoM% e trend
- `classificacao` — distribuições por categoria, localização, UF, tipo
- `performance` — ranking de agentes com badge e métricas
- `requesters` — ranking de solicitantes com MoM e trend
- `insights` — lista de insights do Gemini ou regras locais
- `keywordRanking` — top 10 keywords por volume
- `keywordAnalysis` — análise em texto livre do Gemini

---

## 2. Stack de Tecnologias — Frontend

### 2.1 Linguagem e Framework Base
| Componente | Tecnologia | Versão |
|---|---|---|
| Framework | Next.js (App Router) | 16.2.0 |
| Linguagem | TypeScript | 5.x |
| Runtime React | React | 19.2.4 |
| Estilização | Tailwind CSS | 4.x |
| Animações CSS | tw-animate-css | 1.4.0 |

### 2.2 Bibliotecas Chave
| Biblioteca | Função |
|---|---|
| `recharts 2.x` | Todos os gráficos (linha, barra, pizza/donut) |
| `@fortawesome/react-fontawesome 3.x` | Ícones de toda a interface |
| `shadcn/ui` (via `shadcn 4.x`) | Base de componentes UI (Card, Button, Select, Popover, Calendar) |
| `react-day-picker 9.x` | Seletor de intervalo de datas (DateRange picker) |
| `date-fns 4.x` | Formatação e manipulação de datas |
| `next-themes 0.4.x` | Dark mode / Light mode |
| `lucide-react 0.577.x` | Ícones adicionais |

### 2.3 Gerenciamento de Estado
- **`useState`** (React built-in) — sem biblioteca externa (Redux, Zustand etc.)
- Toda a lógica de estado está centralizada em `src/app/page.tsx`
- O estado principal é: `metrics: MetricsResponse | null` e `selectedMonth: string`
- A função `currentData` deriva os dados do mês selecionado via memoização inline

### 2.4 Chamada à API
```typescript
// src/services/api.ts
export async function uploadCsvFile(file: File, startDate?, endDate?): Promise<MetricsResponse>
// Faz POST /api/upload como multipart/form-data
// Backend URL: http://localhost:8000 (configurar em variável de ambiente para produção)
```

### 2.5 Estrutura de Pastas Frontend
```
frontend/src/
├── app/
│   ├── layout.tsx             # Layout global, ThemeProvider, fontes Geist
│   ├── page.tsx               # Dashboard principal + todas as views (dashboard/requesters/keywords)
│   └── globals.css            # Design tokens CSS (cores oklch, fontes, radius)
├── components/
│   ├── MetricCard.tsx         # Card KPI com trend e MoM
│   ├── InsightCard.tsx        # Card de insight com tipo (positive/negative/warning/neutral)
│   ├── AgentCard.tsx          # Card de agente com badge e métricas
│   ├── FileUpload.tsx         # Área drag-and-drop para CSV
│   ├── DashboardKeywords.tsx  # View de Ranking de Palavras-chave (Flowbite, square corners)
│   ├── ThemeToggle.tsx        # Botão dark/light mode
│   └── charts/
│       ├── DashboardLineChart.tsx  # Gráfico de linha (tendência/volume)
│       ├── DashboardBarChart.tsx   # Gráfico de barras agrupadas
│       └── DashboardPieChart.tsx   # Donut chart
├── services/
│   └── api.ts                 # upload de CSV e chamada à API
└── types/
    └── index.ts               # Interfaces TypeScript (MetricsPayload, MetricsResponse, etc.)
```

### 2.6 Arquitetura de Componentes — Passagem de Props
```
page.tsx
│  estado: metrics, selectedMonth, view, dateRange
│  currentData = metrics.months[selectedMonth] ?? metrics.all
│
├─ <MetricCard
│    title="Total de Tickets"
│    value={currentData.gerais.totalTickets.value}
│    mom={currentData.gerais.totalTickets.mom}
│    trend={currentData.gerais.totalTickets.trend}
│    variant="primary" | "warning" | "danger" | "default"
│  />
│
├─ <InsightCard
│    insight={{ type: "positive" | "negative" | "warning" | "neutral", message: string }}
│  />
│
├─ <DashboardKeywords
│    data={currentData}          // MetricsPayload completo
│    setView={setView}           // função para voltar à view anterior
│  />
│
└─ <DashboardLineChart
│    data={backlog}              // array de { period, created, resolved, sla }
│  />
```

---

## 3. Design System e Padrões Visuais

### 3.1 Paleta de Cores (Design Tokens — oklch)

#### Modo Claro (`:root`)
| Token | Valor oklch | Uso |
|---|---|---|
| `--background` | `oklch(0.98 0 0)` | Fundo da página |
| `--foreground` | `oklch(0.2 0 0)` | Texto principal |
| `--card` | `oklch(1 0 0)` | Fundo dos cards |
| `--primary` | `oklch(0.55 0.2 260)` | Azul primário ("Manageryo Blue") |
| `--secondary` | `oklch(0.9 0.05 260)` | Azul secundário |
| `--muted` | `oklch(0.95 0 0)` | Fundo sutil / labels |
| `--muted-foreground` | `oklch(0.55 0 0)` | Texto de apoio |
| `--destructive` | `oklch(0.6 0.2 25)` | Alertas e tendências negativas |
| `--border` | `oklch(0.9 0 0)` | Bordas de cards |

#### Modo Escuro (`.dark`)
| Token | Valor oklch | Hex aproximado |
|---|---|---|
| `--background` | `oklch(0.20 0.01 260)` | `#1c1c24` |
| `--card` | `oklch(0.23 0.01 260)` | `#212228` |
| `--primary` | `oklch(0.6 0.2 260)` | `#3f75ff` (Vibrant Blue) |
| `--muted-foreground` | `oklch(0.65 0.02 260)` | `#8b8c91` |
| `--border` | `oklch(0.3 0.01 260)` | `#31333b` |

#### Paleta de Gráficos
| Token | Cor | Uso |
|---|---|---|
| `--chart-1` | Azul saturado `#3f75ff` | Série principal |
| `--chart-2` | Azul claro `#6ca0ff` | Série secundária |
| `--chart-3` | Roxo `#8b5cf6` | Série terciária |
| `--chart-4` | Ciano/Teal | Série quaternária |
| `--chart-5` | Âmbar claro | Série quínária |

### 3.2 ⚠️ REGRAS RÍGIDAS DA INTERFACE — Obrigatório em todos os módulos

> **ESTAS REGRAS NÃO PODEM SER ALTERADAS EM NENHUMA NOVA TELA OU MÓDULO:**

1. **Biblioteca de Componentes:** Utilizar exclusivamente **componentes gratuitos do [Flowbite](https://flowbite.com/docs/)** para toda nova view (`DashboardKeywords.tsx` é o modelo de referência).

2. **Tipografia Global Obrigatória:**
   ```css
   font-family: "Degular", "Inter", "Helvetica Neue", Helvetica, Arial, sans-serif;
   ```
   Esta fonte deve ser aplicada globalmente em qualquer nova seção via `globals.css` ou via `style` inline quando a seção usar um escopo próprio.

3. **Cantos Quadrados:** **Proibido** usar bordas arredondadas (`rounded-*`, `border-radius`) em cards, botões, modais, tabelas e inputs das novas telas. Todos os elementos devem usar cantos retos (0px de raio). Apenas os componentes herdados do dashboard base (MetricCard, InsightCard) mantêm seu arredondamento original.

4. **Tema:** Suportar Dark Mode e Light Mode via tokens CSS. Nunca usar cores hardcoded sem variável CSS correspondente.

5. **Ícones:** Usar exclusivamente `@fortawesome/react-fontawesome` com ícones do pacote `@fortawesome/free-solid-svg-icons`.

### 3.3 Raio Global de Borda (base dashboard)
```css
--radius: 0.75rem;  /* Apenas para componentes do dashboard original */
```

---

## 4. Contexto para Replicação — Módulo Jira Analytics

> [!IMPORTANT]
> Este documento serve como o **blueprint oficial** para criação de um novo ecossistema full stack dentro deste repositório chamado **Jira Analytics**.

### 4.1 Escopo do Novo Módulo

O novo módulo deverá processar um CSV exportado do **Jira** (contendo métricas ágeis de sprints, issues, epics e backlogs) e expor um novo Dashboard dedicado, seguindo **estritamente** o padrão técnico e visual mapeado neste documento.

### 4.2 Backend — Novas Rotas a Criar

| Método | Rota sugerida | Descrição |
|---|---|---|
| `POST` | `/api/jira/upload` | Recebe CSV exportado do Jira via multipart/form-data |
| `GET` | `/api/jira/metrics` | Retorna métricas agregadas (opcional, se houver cache) |

**Padrões obrigatórios:**
- Criar `backend/app/api/jira.py` (router) e `backend/app/services/jira_metrics.py` (lógica)
- Usar `pandas` para parsing do CSV do Jira
- Reutilizar o padrão `io.BytesIO(csv_bytes)` com `apply(lambda)` para datas (compatibilidade Windows)
- Integrar com Gemini via `INSIGHTS_MODE=ai` para análise automática de sprint health
- Retornar payload no mesmo formato `{ all, months, backlog, availableMonths }`

### 4.3 Frontend — Novo Dashboard a Construir

- Criar `frontend/src/components/DashboardJira.tsx` como view principal
- Criar `frontend/src/types/jira.ts` com interfaces TypeScript para os dados do Jira
- Adicionar a view `'jira'` ao estado `view` em `page.tsx`
- Adicionar botão de navegação na barra de header conforme padrão existente
- **UI obrigatória:** Flowbite + cantos quadrados + fonte Degular/Inter

### 4.4 Métricas Ágeis Sugeridas para o Dashboard Jira

| Métrica | Descrição |
|---|---|
| Velocity por Sprint | Story Points entregues vs planejados |
| Cycle Time | Tempo médio do início ao fechamento de uma issue |
| Lead Time | Tempo do backlog até o fechamento |
| Bug Rate | % de issues do tipo Bug por sprint |
| Sprint Burndown | Progresso de conclusão das tarefas durante a sprint |
| Backlog Health | Volume de issues não priorizadas vs priorizadas |
| Top Assignees | Ranking de membros por volume de issues concluídas |

### 4.5 Referência de Componente Modelo

Para qualquer nova view, usar `DashboardKeywords.tsx` como template de referência visual e estrutural. Ele representa o padrão correto de:
- Layout com Flowbite (tabela + card de análise ao lado)
- Fontes via `style={{ fontFamily: ... }}`
- Cantos quadrados em todos os elementos
- Integração com dados da API via props `data: MetricsPayload`

---

## 5. Checklist de Conformidade para Pull Requests

Antes de abrir qualquer PR adicionando um novo módulo:

- [ ] Router criado em `backend/app/api/<modulo>.py`
- [ ] Serviço criado em `backend/app/services/<modulo>_metrics.py`
- [ ] Rota registrada em `backend/main.py` via `app.include_router(...)`
- [ ] Tipos TypeScript definidos em `frontend/src/types/<modulo>.ts`  
- [ ] Chamada de API adicionada em `frontend/src/services/api.ts`
- [ ] Componente de view criado em `frontend/src/components/Dashboard<Modulo>.tsx`
- [ ] View adicionada ao estado `view` em `page.tsx`
- [ ] Botão de navegação adicionado ao header do dashboard
- [ ] UI usa somente componentes Flowbite gratuitos
- [ ] Cantos quadrados aplicados em todos os novos elementos
- [ ] Fonte `Degular, Inter, "Helvetica Neue", Helvetica` aplicada
- [ ] Dark Mode/Light Mode funcionando via tokens CSS
- [ ] Integração com Gemini testada com `INSIGHTS_MODE=ai`

---

*Documento gerado automaticamente por análise do repositório `helpsight-analytics` — Rev. 1.0*
