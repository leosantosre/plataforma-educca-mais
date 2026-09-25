# Educca+

## Sobre o Projeto

O **Educca+** é uma plataforma completa de workshops educacionais projetada para professores e educadores. Com ela, você pode criar, gerenciar e participar de workshops por videoconferência, organizar seus eventos em um calendário interativo e se conectar com outros educadores em uma comunidade colaborativa.

### Principais Funcionalidades

- **Calendário Interativo**: Visualize e gerencie todos os workshops em um calendário completo, com suporte a visualização mensal, semanal e diária.
- **Videoconferência Integrada com Zoom**: Crie reuniões do Zoom automaticamente ao criar um evento, com suporte a recorrência diária e semanal.
- **Comunidade de Professores**: Conecte-se com outros educadores, participe de workshops e amplie sua rede de conhecimento.
- **Gestão de Eventos**: Crie, edite e exclua workshops com total controle, incluindo opções de recorrência e participação.
- **Responsivo**: Plataforma moderna e ágil que funciona perfeitamente em qualquer dispositivo, desktop ou mobile.

---

## Tecnologias Utilizadas

### Frontend

| Tecnologia          | Versão  | Descrição                                                          |
| ------------------- | ------- | ------------------------------------------------------------------ |
| **React**           | 18.3.1  | Biblioteca para construção de interfaces de usuário                |
| **TypeScript**      | 5.8.3   | Superset tipado de JavaScript para maior segurança e produtividade |
| **Vite**            | 5.4.19  | Build tool rápido e moderno para desenvolvimento                   |
| **Tailwind CSS**    | 3.4.17  | Framework CSS utilitário para estilização                          |
| **shadcn/ui**       | -       | Componentes de UI acessíveis e customizáveis                       |
| **Radix UI**        | -       | Componentes primitivos acessíveis para construção de UI            |
| **React Router**    | 6.30.1  | Roteamento para aplicações React de página única                   |
| **FullCalendar**    | 6.1.20  | Biblioteca de calendário interativo com suporte a PT-BR            |
| **React Hook Form** | 7.61.1  | Gerenciamento de formulários performático                          |
| **Zod**             | 3.25.76 | Validação de schemas TypeScript-first                              |
| **TanStack Query**  | 5.83.0  | Gerenciamento de estado assíncrono e cache                         |
| **Recharts**        | 2.15.4  | Biblioteca de gráficos baseada em React                            |
| **Lucide React**    | 0.462.0 | Ícones consistentes e customizáveis                                |
| **Sonner**          | 1.7.4   | Componente de notificações/toasts elegante                         |
| **date-fns**        | 3.6.0   | Utilitários modernos para manipulação de datas                     |
| **next-themes**     | 0.3.0   | Suporte a temas claro/escuro                                       |

### Backend & Infraestrutura

| Tecnologia                  | Descrição                                            |
| --------------------------- | ---------------------------------------------------- |
| **Supabase**                | Plataforma open-source de backend com PostgreSQL     |
| **Supabase Auth**           | Autenticação completa (email/senha, OAuth Google)    |
| **Supabase Edge Functions** | Funções serverless (Deno) para integrações como Zoom |
| **PostgreSQL**              | Banco de dados relacional robusto e escalável        |
| **Realtime**                | Atualizações em tempo real via canais do Supabase    |

### Testes & Qualidade

| Ferramenta          | Descrição |
| ------------------- | --------- | ---------------------------------------------------------- |
| **Vitest**          | 3.2.4     | Framework de testes unitários rápido e compatível com Vite |
| **Playwright**      | 1.57.0    | Testes end-to-end automatizados                            |
| **ESLint**          | 9.32.0    | Linting estático para garantir qualidade do código         |
| **Testing Library** | 16.0.0    | Utilitários para testes de componentes React               |

---

## Integrações Implementadas

### 1. Login via Google (OAuth 2.0)

O login com Google é gerenciado pelo **Supabase Auth**, que implementa o fluxo OAuth 2.0 com segurança. O contexto de autenticação está em `src/contexts/AuthContext.tsx`.

- **Método**: `signInWithGoogle()` em `AuthContext`
- **Provider**: `supabase.auth.signInWithOAuth({ provider: "google" })`
- **Callback**: Redireciona de volta para a origem atual (`window.location.origin`)
- **Persistência**: Sessão armazenada no `localStorage` com renovação automática de token

### 2. API do Zoom (Criação de Reuniões)

A integração com a API do Zoom é feita através de uma **Supabase Edge Function** serverless, localizada em `supabase/functions/create-zoom-meeting/index.ts`.

**Funcionalidades:**

- Autenticação no Zoom via OAuth 2.0 Server-to-Server (JWT do tipo Account Credentials)
- Criação de reuniões individuais ou recorrentes (diária/semanal)
- Cálculo automático de duração (mínimo de 30 minutos)
- Suporte a exclusão de finais de semana em recorrências diárias
- Salvamento automático dos eventos no banco de dados com link da reunião

**Limites de recorrência:**

- Diária: até 15 ocorrências
- Semanal: até 4 ocorrências

---

## Como Clonar e Executar Localmente

### Pré-requisitos

Antes de começar, certifique-se de ter instalado/configurado:

- **Node.js** (versão 18 ou superior)
- **npm** ou **bun** (gerenciador de pacotes)
- **Git** (para clonar o repositório)
- Conta no **Supabase** (para configurar o backend)
- Conta no **Google Cloud** (para login via Google)
- Conta no **Zoom Marketplace** (para integração com Zoom)

---

### Passo 1: Clonar o Repositório

```bash
git clone https://github.com/leosantosre/plataforma-educca-mais.git
cd plataforma-educca-mais
```

---

### Passo 2: Instalar as Dependências

Usando npm:

```bash
npm install
```

Ou usando bun:

```bash
bun install
```

---

### Passo 3: Configurar as Variáveis de Ambiente

Copie o arquivo de exemplo `.envExample` para `.env`:

```bash
copy .envExample .env
```

Preencha as variáveis no arquivo `.env`:

```env
VITE_SUPABASE_PROJECT_ID=""
VITE_SUPABASE_PUBLISHABLE_KEY=""
VITE_SUPABASE_URL=""
```

> **Nota**: Essas credenciais são obtidas no painel do Supabase após criar o projeto.

---

### Passo 4: Configurar o Supabase (Backend)

#### 4.1 Criar um Projeto no Supabase

1. Acesse [supabase.com](https://supabase.com) e crie uma conta ou faça login
2. Clique em **New Project**
3. Preencha:
   - **Name**: Educca+ (ou nome de sua preferência)
   - **Database Password**: Escolha uma senha forte e guarde-a
   - **Region**: Escolha a região mais próxima (ex: São Paulo `sa-east-1`)
4. Clique em **Create new project** e aguarde a inicialização (~2 minutos)

#### 4.2 Obter as Credenciais do Projeto

1. No painel do projeto, vá para **Settings** > **API**
2. Copie:
   - **Project ID** → preencha `VITE_SUPABASE_PROJECT_ID`
   - **Project URL** → preencha `VITE_SUPABASE_URL`
   - **anon public key** → preencha `VITE_SUPABASE_PUBLISHABLE_KEY`

#### 4.3 Executar as Migrações do Banco de Dados

Instale a CLI do Supabase:

```bash
npm install -g supabase
```

Faça login:

```bash
supabase login
```

Vincule o projeto:

```bash
supabase link --project-ref SEU_PROJECT_ID
```

Aplique as migrações:

```bash
supabase db push
```

As migrações estão localizadas em `supabase/migrations/` e criam todas as tabelas necessárias (events, event_participants, profiles, etc.).

---

### Passo 5: Configurar o Login via Google

#### 5.1 Criar Credenciais no Google Cloud

1. Acesse [console.cloud.google.com](https://console.cloud.google.com/)
2. Crie um novo projeto ou selecione um existente
3. Vá para **APIs & Services** > **Credentials**
4. Clique em **Create Credentials** > **OAuth client ID**
5. Configure a tela de consentimento OAuth se solicitado:
   - **User Type**: External
   - Preencha nome da aplicação, e-mail de suporte, domínios autorizados
   - Adicione os escopos: `email`, `profile`, `openid`
6. Em **Create OAuth client ID**:
   - **Application type**: Web application
   - **Name**: Educca+ Login
   - **Authorized JavaScript origins**: Adicione:
     - `http://localhost:5173` (desenvolvimento local)
     - `https://SEU-PROJETO.supabase.co` (produção)
   - **Authorized redirect URIs**: Adicione:
     - `https://SEU-PROJETO.supabase.co/auth/v1/callback`
7. Clique em **Create** e copie o **Client ID** e **Client Secret**

#### 5.2 Configurar o Google Provider no Supabase

1. No painel do Supabase, vá para **Authentication** > **Providers**
2. Habilite o provider **Google**
3. Cole:
   - **Client ID**: obtido no passo anterior
   - **Client Secret**: obtido no passo anterior
4. Clique em **Save**

#### 5.3 Configurar URLs de Redirecionamento no Supabase

1. Ainda em **Authentication** > **URL Configuration**
2. Em **Site URL**, defina:
   - Desenvolvimento: `http://localhost:5173`
   - Produção: sua URL de produção
3. Em **Redirect URLs**, adicione:
   - `http://localhost:5173/**`
   - `https://SEU-DOMINIO.com/**` (produção)

---

### Passo 6: Configurar a Integração com a API do Zoom

#### 6.1 Criar App Server-to-Server no Zoom

1. Acesse [marketplace.zoom.us](https://marketplace.zoom.us/) e faça login
2. Clique em **Develop** > **Build App**
3. Escolha **Server-to-Server OAuth App**
4. Preencha:
   - **App Name**: Educca+
   - **Company Name**: nome da sua empresa/projeto
   - **Developer Name**: seu nome
   - **Developer Email**: seu e-mail
5. Clique em **Continue** até a tela de **App Credentials**
6. Copie:
   - **Account ID** → `ZOOM_ACCOUNT_ID`
   - **Client ID** → `ZOOM_CLIENT_ID`
   - **Client Secret** → `ZOOM_CLIENT_SECRET`

#### 6.2 Adicionar Escopos ao App Zoom

No Zoom Marketplace, na seção **Scopes** do app, adicione as permissões:

- `meeting:write:admin` (criar reuniões)
- `meeting:read:admin` (ler reuniões)

Ative o app em **Activation**.

#### 6.3 Deployar a Edge Function do Supabase

A edge function de criação de reuniões está em `supabase/functions/create-zoom-meeting/index.ts`.

Para deployar:

```bash
# Deployar a função
supabase functions deploy create-zoom-meeting

# Configurar as secrets da função
supabase secrets set ZOOM_ACCOUNT_ID="sua_account_id"
supabase secrets set ZOOM_CLIENT_ID="seu_client_id"
supabase secrets set ZOOM_CLIENT_SECRET="seu_client_secret"
```

> **Nota**: A função já está configurada no `supabase/config.toml` com `verify_jwt = false`, pois a autenticação é feita via header `Authorization` com o token JWT do usuário Supabase.

---

### Passo 7: Iniciar o Servidor de Desenvolvimento

```bash
npm run dev
```

Ou com bun:

```bash
bun run dev
```

A aplicação estará disponível em: **http://localhost:5173**

---

## Scripts Disponíveis

| Script               | Descrição                                            |
| -------------------- | ---------------------------------------------------- |
| `npm run dev`        | Inicia o servidor de desenvolvimento com auto-reload |
| `npm run build`      | Cria build de produção na pasta `dist/`              |
| `npm run build:dev`  | Cria build em modo desenvolvimento                   |
| `npm run preview`    | Visualiza a build de produção localmente             |
| `npm run lint`       | Executa o ESLint para verificar qualidade do código  |
| `npm run test`       | Executa os testes unitários (Vitest) uma única vez   |
| `npm run test:watch` | Executa os testes unitários em modo watch            |

---

## Estrutura do Projeto

```
plataforma-educca-mais/
├── public/                    # Arquivos estáticos públicos
├── src/                       # Código-fonte da aplicação
│   ├── assets/               # Imagens e recursos estáticos
│   ├── components/           # Componentes React reutilizáveis
│   │   ├── ui/              # Componentes base da shadcn/ui
│   │   ├── community/       # Componentes da comunidade
│   │   └── profile/         # Componentes de perfil
│   ├── contexts/            # Contextos React (Auth, Admin)
│   ├── hooks/               # Hooks customizados
│   ├── integrations/        # Integrações externas (Supabase)
│   ├── lib/                 # Utilitários e funções auxiliares
│   ├── pages/               # Páginas da aplicação
│   ├── test/                # Configurações de teste
│   ├── App.tsx              # Componente raiz
│   ├── main.tsx             # Ponto de entrada da aplicação
│   └── index.css            # Estilos globais (Tailwind)
├── supabase/                 # Configurações do Supabase
│   ├── functions/           # Edge Functions serverless
│   │   ├── create-zoom-meeting/   # Integração Zoom
│   │   ├── delete-account/        # Exclusão de conta
│   │   └── generate-event-notifications/  # Notificações
│   └── migrations/          # Migrações do banco PostgreSQL
├── .envExample              # Exemplo de variáveis de ambiente
├── package.json             # Dependências e scripts
├── tailwind.config.ts       # Configuração do Tailwind CSS
├── vite.config.ts           # Configuração do Vite
└── tsconfig.json            # Configuração do TypeScript
```

---

## Links Úteis

- [Documentação do Supabase](https://supabase.com/docs)
- [Documentação do React](https://react.dev/)
- [Documentação do Tailwind CSS](https://tailwindcss.com/docs)
- [Documentação da API do Zoom](https://developers.zoom.us/docs/api/)
- [Guia OAuth do Google](https://developers.google.com/identity/protocols/oauth2)
- [FullCalendar Docs](https://fullcalendar.io/docs)

---

© 2026 Educca+. Todos os direitos reservados.
