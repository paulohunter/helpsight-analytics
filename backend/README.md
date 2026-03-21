# HelpSight Analytics - Backend

A API oficial de processamento de dados do painel HelpSight Analytics. Construída com FastAPI e Pandas, esta camada é responsável por ingerir as exportações de sistema de chamados (como CSV do Freshdesk), efetuar cálculos pesados de volumetria, tendência temporal, performance de agentes e gerar insights em tempo real.

## 🚀 Tecnologias Utilizadas

*   **Python 3.9+**
*   **FastAPI**: Framework web moderno e ultrarrápido para a criação da API REST.
*   **Pandas**: Biblioteca padrão-ouro para análise e manipulação de alta performance dos dados do CSV.
*   **Uvicorn**: Servidor web ASGI de produção.
*   **Pydantic**: Para tipagem e serialização estruturada de dados.

## ⚙️ Instalação e Execução (Desenvolvimento)

Para rodar a aplicação localmente:

1.  Acesse o diretório do backend:
    ```bash
    cd backend
    ```

2.  Crie um ambiente virtual (recomendado):
    ```bash
    python -m venv venv
    venv\Scripts\activate  # No Windows
    # source venv/bin/activate # No Linux/Mac
    ```

3.  Instale as dependências contidas no `requirements.txt`:
    ```bash
    pip install -r requirements.txt
    ```

4.  Configure a chave de API do Google AI Studio para o gerador de insights:
    Acesse o [Google AI Studio](https://aistudio.google.com/app/apikey), gere a sua chave (Create API key) e crie um arquivo `.env` na raiz da pasta `backend/`:
    ```env
    GEMINI_API_KEY=sua_chave_aqui
    ```

5.  Inicie o servidor local FastAPI:
    ```bash
    uvicorn main:app --reload --port 8000
    ```

A API estará rodando em `http://localhost:8000`. 
Você pode acessar a documentação automática interativa do Swagger acessando `http://localhost:8000/docs`.

---

## 📊 Estrutura Aceita da Planilha (CSV)

O sistema foi dimensionado para receber exportações (Reports) baseadas no padrão Freshdesk (em português). Para que o painel Front-end construa todos os gráficos, cards e painéis de liderança perfeitamente, o CSV enviado **deve conter as seguintes colunas** (nomeadas exatamente assim no cabeçalho):

### Colunas Obrigatórias / Métricas

*   `ID do ticket`: Identificador único.
*   `Status`: Estado da solicitação (usado para calcular Resoluções considerando "Resolved" ou "Closed").
*   `Agente`: Nome do analista (Gera a performance individual).
*   `Hora da criação`: Formato de Data (Gera o histórico analítico e quebra de Mês).
*   `Hora da resolução`: Formato de Data (Gera cálculos de Month-over-Month).
*   `Tempo de resolução (em horas)`: Numérico de horas quebradas (Gera o TTR).
*   `Tempo até a primeira resposta (em horas)`: Numérico de horas quebradas (Gera o FRT).
*   `Estado da resolução`: Contém a string `"Within SLA"` ou `"SLA Violated"` (Calcula a porcentagem de conformidade de SLA).
*   `Resultados da pesquisa`: Texto (`Extremamente Satisfeito`, etc) ou nota (`5`, `4`) referente à satisfação do cliente (Calcula a média real de CSAT geral e por analista).

### Colunas de Classificação / Gráficos

O sistema varre as seguintes colunas num sistema *Top N* para gerar gráficos dinâmicos de barras horizontais e pizza. Na falha de alguma dessas colunas, o respectivo gráfico sumirá de forma responsiva.

*   `Categoria`
*   `Subcategoria`
*   `Areá de atuação` *(Atenção a grafia exportada pelo seu Freshdesk)*
*   `Local de atuação`
*   `UF`
*   `Tipo`
