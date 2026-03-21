# HelpSight Analytics - Frontend

A interface de usuário dinâmica, moderna e orientada a dados para o projeto HelpSight Analytics. Desenvolvido para oferecer uma experiência "SaaS Premium" (inspirada em painéis de alto padrão como Datadog e Linear), trazendo métricas e insights em tempo real que facilitam decisões operacionais usando inteligência visual de negócio (Business Intelligence).

## 🚀 Tecnologias Utilizadas

*   **Next.js 14+ (App Router)**: Framework React full-stack moderno com Server Components otimizados.
*   **React 18**: Gerenciamento robusto de interface.
*   **Tailwind CSS**: Estilização ágil focada em utilitários, permitindo customizações complexas com `backdrop-blur`, gradientes SVG e manipulação limpa de UI Glassmorphism.
*   **shadcn/ui & Radix UI**: Componentes de altíssima acessibilidade, sem restrições de estilo (Alertas, Calendários, Popovers).
*   **Recharts**: Biblioteca vetorial responsável pela rica criação fluída dos gráficos (Linha, Barra Top N e Pizza Dinâmica).
*   **date-fns**: Manipulação rápida, localização para Português (pt-BR) e parsing autêntico de datas em calendários.
*   **Lucide React & FontAwesome**: Ícones limpos minimalistas e detalhados.

## ⚙️ Instalação e Execução (Desenvolvimento)

Para rodar o front-end na sua máquina local de desenvolvimento juntamente com o Backend:
*(Lembre-se: Para os Insights interativos da tela funcionarem de fato, certifique-se de configurar a API Key do Google AI Studio no projeto backend).*

1.  Acesse o diretório do frontend:
    ```bash
    cd frontend
    ```

2.  Instale os pacotes e dependências listadas no `package.json`:
    ```bash
    npm install
    # ou 
    yarn install
    # ou
    pnpm install
    ```

3.  Rode o servidor de desenvolvimento Next.js:
    ```bash
    npm run dev
    ```

A interface carregará instataneamente na porta 3000 (ou em portas sequenciais caso a primeira esteja em uso – e.g., `http://localhost:3000` / `http://localhost:3001`).

## ✨ Principais Componentes e Fluxo Interativo

1. **Inteligência Dinâmica (`InsightCard`)**: As mensagens contidas na tela se adaptam sozinhas baseadas na performance contida no CSV (Ex: se SLA cair, aparece um Insight de alerta vermelho em tempo real).
2. **Calendário Filtrável (`Shadcn Calendar`)**: Localizado no header do painel, permite o usuário cruzar instantaneamente os dados de qualquer ponto do ano anterior ou futuro em total harmonia com o backend.
3. **Glassmorphism Theme (`ThemeToggle`)**: O Front-end interage e mapeia cores semânticas em CSS HSL perfeitamente balanceadas entre o Modo Claro (Light) e Modo Escuro (Dark).
