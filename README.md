# Tibia Portal

Portal web para o jogo **Tibia Idle** — gerencie builds de personagens, crie sua conta de aventureiro e explore as builds públicas da comunidade.

## Tecnologias

- [Next.js 16](https://nextjs.org/) — framework React com App Router
- [Supabase](https://supabase.com/) — autenticação e banco de dados
- [Tailwind CSS v4](https://tailwindcss.com/) — estilização
- [TypeScript](https://www.typescriptlang.org/)

## Como rodar localmente

```bash
npm install
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000) no navegador.

## Variáveis de ambiente

Crie um arquivo `.env.local` na raiz do projeto com as chaves do Supabase:

```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

## Estrutura principal

```
src/
  app/
    page.tsx          # Página inicial
    layout.tsx        # Layout raiz com AuthProvider
    builds/           # Listagem de builds públicas
    signup/           # Cadastro de novos aventureiros
    components/       # Componentes compartilhados (logo, auth status)
  lib/
    supabase.ts       # Cliente Supabase
    auth-context.tsx  # Contexto de autenticação
    types.ts          # Tipos compartilhados (Build, Vocation, etc.)
```
