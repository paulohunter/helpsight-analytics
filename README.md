# HelpSight Analytics

![HelpSight Analytics](frontend/public/favicon.ico)

Um painel completo de **Operational Intelligence** (BI) focado na análise de dados de sistemas de chamados (Helpdesk / Freshdesk). O sistema lê arquivos no formato CSV de exportação de sistemas de atendimento e provê dashboards com análises profundas de SLAs, Volume (Backlog), Qualidade (CSAT) e Performance Mensal da Equipe de suporte.

O projeto foi construído pensando numa arquitetura corporativa moderna baseada em **Microserviços num Monorepo**, onde um poderoso backend processa altas cargas de dados e uma interface super elegante consome essas APIs para renderizar os gráficos.

## 🗂️ Estrutura do Monorepo

Este repositório contém dois projetos irmãos separados por pastas. Cada pasta tem o seu próprio `README.md` com explicações profundas sobre como funciona cada engrenagem:

*   [**`/backend`**](./backend/README.md) -> Contém a API REST em Python (FastAPI + Pandas) que engole planilhas CSV com centenas de linhas e as entrega processadas e empacotadas.
*   [**`/frontend`**](./frontend/README.md) -> Contém a Interface Gráfica React baseada puramente em Next.js com Tailwind CSS, shadcn/ui e Recharts para apresentar dados maravilhosos.
*   `mock_freshdesk.csv` -> Como você está num local de "sandbox", existe esse CSV local no projeto base para testes instantâneos.

---

## 🚦 Executando Todo o Projeto (Instruções Globais)

Para rodar este monorepo perfeitamente na sua máquina, você vai precisar abrir **duas abas de terminal** ou prompt de comando e configurar a chave da API de Inteligência Artificial.

### 0- Obtendo a Chave de API do Google AI Studio
Os insights dinâmicos do painel são movidos a IA generativa. Para que funcionem:
1. Acesse o [Google AI Studio](https://aistudio.google.com/app/apikey).
2. Faça login com a sua conta Google e clique em **Create API key**.
3. Crie um arquivo `.env` dentro da pasta `backend/` e insira a chave:
   ```env
   GEMINI_API_KEY=sua_chave_aqui
   ```

### 1- Iniciando o Backend API (Python)
Em um terminal, navegue para o *backend* local:
```bash
cd backend
python -m venv venv
venv\Scripts\activate   # No Windows (Se Linux/Mac, source venv/bin/activate)
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```
Isso ligará o motor matemático de dados na porta `8000`.

### 2- Iniciando o Painel do Frontend (Next.js)
No segundo terminal, acenda o visual:
```bash
cd frontend
npm install
npm run dev
```
O painel visual acenderá de imediato no navegador em `http://localhost:3000` ou `3001`!

## ✨ Funcionalidades Principais
*   **Inteligência Dinâmica (Insights)**: Um gerador automático de alertas contextuais de queda de SLA ou aumento de TTR / Tickets com base nos números exatos.
*   **CSAT Realístico (Qualidade)**: Lê mapeamentos avançados de `"Resultados da pesquisa"` do Freshdesk para quantificar a nota média do analista e sua tendência no ranking.
*   **Calendário Integrado e Fluído**: Ao escolher o Mês ou Ano no calendário lateral, o sistema corta os dados perfeitamente isolando relatórios e volumetrias.
*   **Dark e Light Mode Nativos**: Layout desenhado nativamente com base em componentes que conversam de imediato tanto com o tema Solarizado (Claro) quanto Dark premium.
