<div align="center">

# 🌹 Róża Różańcowa

**Aplikacja webowa do zarządzania grupami Żywego Różańca**

Ułatwia organizację modlitwy, automatyczną rotację tajemnic różańcowych oraz komunikację wewnątrz wspólnoty.

[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?logo=supabase&logoColor=white)](https://supabase.com/)
[![Vite](https://img.shields.io/badge/Vite-7.x-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

[Demo](#-demo) • [Instalacja](#-instalacja-i-uruchomienie) • [Dokumentacja](#-architektura-aplikacji) • [Kontakt](#-kontakt)

</div>

---

## 📑 Spis treści

- [Opis projektu](#-opis-projektu)
- [Stack technologiczny](#%EF%B8%8F-stack-technologiczny)
- [Architektura aplikacji](#-architektura-aplikacji)
- [Struktura katalogów](#-struktura-katalogów)
- [Wymagania systemowe](#-wymagania-systemowe)
- [Instalacja i uruchomienie](#-instalacja-i-uruchomienie)
- [Konfiguracja środowiska](#-konfiguracja-środowiska)
- [Baza danych](#%EF%B8%8F-baza-danych)
- [Testy](#-testy)
- [Linting i formatowanie](#-linting-i-formatowanie)
- [Standardy kodu](#-standardy-kodu)
- [Deployment](#-deployment)
- [Roadmapa](#-roadmapa)
- [FAQ / Najczęstsze problemy](#-faq--najczęstsze-problemy)
- [Licencja](#-licencja)
- [Kontakt](#-kontakt)

---

## 📖 Opis projektu

### Kontekst

**Żywy Różaniec** to wspólnota modlitewna, w której 20 osób (tzw. Róża) codziennie odmawia po jednej tajemnicy różańcowej. Co miesiąc tajemnice rotują między członkami, co wymaga koordynacji i komunikacji.

Aplikacja **Róża Różańcowa** digitalizuje ten proces, eliminując potrzebę ręcznego zarządzania listami i rotacjami.

### Główne funkcjonalności

#### 👤 Panel Użytkownika
- **Podgląd tajemnicy** — wyświetlanie aktualnie przypisanej tajemnicy na dany miesiąc
- **Potwierdzenie modlitwy** — możliwość odznaczenia wykonania modlitwy
- **Licznik czasu** — odliczanie do najbliższej zmiany tajemnic (pierwsza niedziela miesiąca)
- **Widok Róży** — podgląd członków grupy z ich aktualnymi tajemnicami
- **Intencja miesięczna** — wspólna intencja modlitewna dla całej grupy

#### 🛡️ Panel Administratora
- **Zarządzanie członkami** — dodawanie, edycja, usuwanie, przypisywanie do grup
- **Zarządzanie Różami** — tworzenie i konfiguracja grup modlitewnych
- **Rotacja tajemnic** — automatyczna lub ręczna rotacja dla wybranych grup
- **Intencje** — ustawianie miesięcznych intencji modlitewnych
- **Statystyki** — podgląd statusu modlitwy w grupach

---

## 🛠️ Stack technologiczny

| Kategoria | Technologie |
|-----------|-------------|
| **Frontend** | React 19, TypeScript 5.9, Vite 7.x |
| **Styling** | Tailwind CSS 3.4, shadcn/ui (Radix UI), Lucide Icons |
| **State Management** | TanStack Query 5.x (React Query), React Context |
| **Formularze** | React Hook Form 7.x, Zod 4.x |
| **Routing** | React Router 7.x |
| **Backend** | Supabase (PostgreSQL 17, Auth, Edge Functions, Storage) |
| **Hosting** | Vercel |
| **Narzędzia** | ESLint 9.x, TypeScript ESLint, PostCSS, Autoprefixer |

---

## 🏗 Architektura aplikacji

### Wzorzec: Feature-Based Architecture

Projekt wykorzystuje architekturę **Feature-Based** (modularną), gdzie kod jest organizowany wokół funkcjonalności biznesowych, a nie typów plików.

```
┌─────────────────────────────────────────────────────────────────┐
│                         BROWSER                                 │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      REACT APPLICATION                          │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                      App.tsx                              │  │
│  │         (BrowserRouter + ErrorBoundary + Providers)       │  │
│  └───────────────────────────────────────────────────────────┘  │
│                              │                                  │
│              ┌───────────────┼───────────────┐                  │
│              ▼               ▼               ▼                  │
│  ┌─────────────────┐ ┌─────────────┐ ┌─────────────────┐        │
│  │   QueryClient   │ │ ThemeContext│ │   AuthContext   │        │
│  │ (TanStack Query)│ │ (Dark/Light)│ │  (Supabase Auth)│        │
│  └─────────────────┘ └─────────────┘ └─────────────────┘        │
│                              │                                  │
│                              ▼                                  │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                      ROUTES                               │  │
│  │  ┌──────────┐  ┌──────────────┐  ┌──────────────────┐     │  │
│  │  │  Public  │  │  Protected   │  │      Admin       │     │  │
│  │  │  (Login) │  │  (Dashboard) │  │ (Members/Roses)  │     │  │
│  │  └──────────┘  └──────────────┘  └──────────────────┘     │  │
│  └───────────────────────────────────────────────────────────┘  │
│                              │                                  │
│              ┌───────────────┴───────────────┐                  │
│              ▼                               ▼                  │
│  ┌───────────────────────┐      ┌───────────────────────┐       │
│  │      FEATURES         │      │       SHARED          │       │
│  │  ├─ auth/             │      │  ├─ components/ui/    │       │
│  │  ├─ user/             │      │  ├─ hooks/            │       │
│  │  └─ admin/            │      │  ├─ lib/              │       │
│  │      ├─ members/      │      │  └─ types/            │       │
│  │      ├─ roses/        │      │                       │       │
│  │      └─ intentions/   │      │                       │       │
│  └───────────────────────┘      └───────────────────────┘       │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                        SUPABASE                                 │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐  │
│  │    Auth     │  │  Database   │  │    Edge Functions       │  │
│  │ (JWT/Email) │  │ (PostgreSQL)│  │ (create/delete/update)  │  │
│  └─────────────┘  └─────────────┘  └─────────────────────────┘  │
│                         │                                       │
│                         ▼                                       │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                    ROW LEVEL SECURITY                     │  │
│  │          (Polityki dostępu na poziomie wierszy)           │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

### Przepływ danych

1. **Użytkownik** wykonuje akcję w UI (np. kliknięcie)
2. **Hook** (np. `useMutation`) wywołuje funkcję z warstwy **API/Service**
3. **Service** komunikuje się z **Supabase** (REST API / RPC)
4. **Supabase** sprawdza polityki **RLS** i zwraca dane
5. **TanStack Query** cachuje odpowiedź i aktualizuje UI

### Odpowiedzialności warstw

| Warstwa | Odpowiedzialność |
|---------|------------------|
| `pages/` | Kompozycja komponentów, layout strony |
| `components/` | Prezentacja UI, obsługa eventów |
| `hooks/` | Logika biznesowa, state management |
| `api/` | Komunikacja z backendem (Supabase) |
| `types/` | Definicje TypeScript |

---

## 📁 Struktura katalogów

```
src/
├── app/                    # Konfiguracja aplikacji
│   ├── App.tsx             # Główny komponent
│   ├── providers.tsx       # Providery (Query, Theme, Auth)
│   └── routes.tsx          # Definicje tras (React Router)
│
├── features/               # Moduły funkcjonalne
│   ├── auth/               # Autentykacja
│   │   ├── api/            # auth.service.ts
│   │   ├── components/     # ProtectedRoute.tsx
│   │   ├── context/        # AuthContext.tsx
│   │   ├── hooks/          # useLogout.ts, useNavigateOnAuthChange.ts
│   │   ├── pages/          # LoginPage.tsx
│   │   └── types/          # auth.types.ts
│   │
│   ├── user/               # Panel użytkownika
│   │   ├── api/            # user.service.ts
│   │   ├── components/     # MysteryCard, IntentionCard, RoseDialog
│   │   ├── hooks/          # useUserData.ts
│   │   └── pages/          # UserPage.tsx
│   │
│   ├── admin/              # Panel administratora
│   │   ├── layout/         # AdminLayout.tsx
│   │   ├── members/        # Zarządzanie członkami
│   │   ├── roses/          # Zarządzanie Różami
│   │   └── intentions/     # Zarządzanie intencjami
│   │
│   └── mysteries/          # Tajemnice różańcowe
│       └── utils/          # Algorytm rotacji
│
├── shared/                 # Współdzielone zasoby
│   ├── components/
│   │   ├── ui/             # shadcn/ui (Button, Dialog, Input...)
│   │   ├── common/         # Reużywalne komponenty
│   │   ├── feedback/       # Toasty, loadery
│   │   └── layout/         # ErrorBoundary, PageLayout
│   ├── hooks/              # useTypedMutation.ts
│   ├── lib/                # Utilities, constants, supabase client
│   ├── types/              # Globalne typy (domain, database)
│   └── validation/         # Schematy Zod
│
└── assets/                 # Statyczne zasoby (obrazy, fonty)

supabase/
├── config.toml             # Konfiguracja lokalna Supabase
├── seed.sql                # Dane inicjalne (20 tajemnic)
├── migrations/             # Migracje schematu DB
└── functions/              # Edge Functions (Deno)
    ├── create-user/
    ├── delete-user/
    └── update-user-password/
```

---

## 💻 Wymagania systemowe

| Narzędzie | Wersja minimalna | Uwagi |
|-----------|------------------|-------|
| **Node.js** | 18.x | Zalecana: 20.x LTS |
| **npm** | 9.x | Lub yarn/pnpm |
| **Docker** | 20.x | Opcjonalnie, dla lokalnego Supabase |
| **Git** | 2.x | |
| **OS** | Windows/macOS/Linux | |

---

## 🚀 Instalacja i uruchomienie

### Szybki start (< 10 minut)

```bash
# 1. Sklonuj repozytorium
git clone https://github.com/twoj-login/roza-rozancowa.git
cd roza-rozancowa

# 2. Zainstaluj zależności
npm install

# 3. Skopiuj przykładowy plik konfiguracyjny
cp .env.example .env

# 4. Uzupełnij zmienne środowiskowe (patrz sekcja Konfiguracja)

# 5. Uruchom serwer deweloperski
npm run dev
```

Aplikacja będzie dostępna pod adresem: `http://localhost:5173`

### Z lokalną bazą Supabase (Docker)

```bash
# 1-2. Jak wyżej (clone + install)

# 3. Uruchom lokalny Supabase (wymaga Docker)
npx supabase start

# 4. Skopiuj wyświetlone klucze do .env
#    - API URL → VITE_SUPABASE_URL
#    - anon key → VITE_SUPABASE_ANON_KEY

# 5. Uruchom aplikację
npm run dev
```

### Dostępne skrypty

| Polecenie | Opis |
|-----------|------|
| `npm run dev` | Uruchomienie serwera deweloperskiego (Vite) |
| `npm run build` | Budowanie wersji produkcyjnej |
| `npm run preview` | Podgląd wersji produkcyjnej lokalnie |
| `npm run lint` | Sprawdzenie kodu (ESLint) |
| `npm run test` | Uruchomienie testów jednostkowych (Vitest) |
| `npm run test:ui` | Testy z interfejsem graficznym |
| `npm run test:coverage` | Generowanie raportu pokrycia kodu |
| `npm run test:e2e` | Uruchomienie testów e2e (Playwright) |
| `npm run test:e2e:ui` | Testy e2e z interfejsem graficznym |
| `npm run test:e2e:debug` | Testy e2e w trybie debugowania |

---

## ⚙ Konfiguracja środowiska

### Zmienne środowiskowe

Utwórz plik `.env` w głównym katalogu projektu:

```env
# Supabase - WYMAGANE
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Plik `.env.example`

```env
# ===========================================
# SUPABASE CONFIGURATION
# ===========================================
# URL projektu Supabase (znajdziesz w Settings > API)
VITE_SUPABASE_URL=

# Klucz publiczny (anon key) - bezpieczny do użycia po stronie klienta
VITE_SUPABASE_ANON_KEY=
```

> ⚠️ **Uwaga:** Nigdy nie commituj pliku `.env` z prawdziwymi kluczami!

---

## 🗄️ Baza danych

### Schemat tabel

```
┌─────────────────┐     ┌─────────────────┐
│     groups      │     │   auth.users    │
├─────────────────┤     └────────┬────────┘
│ id (PK)         │              │
│ name            │              │ 1:1
│ created_at      │              ▼
└────────┬────────┘     ┌─────────────────┐
         │              │    profiles     │
         │ 1:N          ├─────────────────┤
         └─────────────►│ id (FK → users) │
                        │ full_name       │
                        │ role            │
                        │ group_id (FK)   │
                        │ rose_pos        │
                        └────────┬────────┘
                                 │
         ┌───────────────────────┼───────────────────────┐
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   mysteries     │     │   intentions    │     │ acknowledgments │
├─────────────────┤     ├─────────────────┤     ├─────────────────┤
│ id (1-20)       │     │ id              │     │ id              │
│ part            │     │ title           │     │ user_id (FK)    │
│ name            │     │ content         │     │ mystery_id (FK) │
│ meditation      │     │ month           │     │ month           │
│ image_url       │     │ year            │     │ year            │
└─────────────────┘     └─────────────────┘     │ created_at      │
                                                └─────────────────┘
```

### Kluczowe funkcje SQL

| Funkcja | Opis |
|---------|------|
| `get_mystery_id_for_user(user_id)` | Oblicza aktualną tajemnicę na podstawie pozycji i daty (modulo 20) |
| `rotate_group_members(group_id)` | Rotuje członków grupy o jedną pozycję |
| `move_user_to_group(user_id, group_id)` | Przypisuje użytkownika do pierwszego wolnego miejsca |
| `batch_rotate_groups(group_ids)` | Masowa rotacja wybranych grup |

### Row Level Security (RLS)

- **Użytkownicy**: dostęp tylko do własnych danych wrażliwych
- **Członkowie grupy**: widoczność publicznych danych współczłonków
- **Administratorzy**: pełny dostęp CRUD do wszystkich tabel

### Migracje i Seed

```bash
# Lokalnie (Docker) - automatyczne migracje + seed
npx supabase start

# Reset bazy (kasuje dane!)
npx supabase db reset

# Push na produkcję
npx supabase db push
```

Plik `supabase/seed.sql` zawiera 20 tajemnic różańcowych z opisami i grafikami.

---

## 🧪 Testy

Projekt zawiera testy jednostkowe (Vitest) oraz end-to-end (Playwright).

### Struktura testów

```
tests/
├── e2e/                    # Testy end-to-end (Playwright)
│   ├── auth/               # Testy autentykacji
│   ├── fixtures/           # Fixtures Playwright
│   └── helpers/            # Funkcje pomocnicze
├── features/               # Testy jednostkowe modułów
│   ├── auth/
│   └── user/
├── shared/                 # Testy współdzielone
│   ├── hooks/
│   └── lib/
└── utils/                  # Utilities testowe
    ├── test-utils.tsx      # Renderowanie z providerami
    └── hook-helpers.tsx    # Helpery do testowania hooków
```

### Polecenia testowe

```bash
# Testy jednostkowe (Vitest)
npm run test

# Testy z interfejsem UI
npm run test:ui

# Testy e2e (Playwright)
npm run test:e2e

# Testy e2e z UI
npm run test:e2e:ui

# Testy e2e w trybie debug
npm run test:e2e:debug

# Coverage
npm run test:coverage
```

---

## 🧹 Linting i formatowanie

### ESLint

Projekt używa ESLint 9.x z flat config:

```bash
# Sprawdzenie błędów
npm run lint

# Automatyczna naprawa
npm run lint -- --fix
```

### Konfiguracja (`eslint.config.js`)

- `@eslint/js` — bazowe reguły JavaScript
- `typescript-eslint` — wsparcie TypeScript
- `eslint-plugin-react-hooks` — reguły React Hooks
- `eslint-plugin-react-refresh` — wsparcie HMR

### Prettier (opcjonalnie)

Projekt nie wymusza Prettiera — formatowanie można dodać według preferencji zespołu.

---

## 📐 Standardy kodu

### Konwencje nazewnictwa

| Element | Konwencja | Przykład |
|---------|-----------|----------|
| Komponenty | PascalCase | `MysteryCard.tsx` |
| Hooki | camelCase + `use` prefix | `useUserData.ts` |
| Funkcje/zmienne | camelCase | `handleSubmit`, `isLoading` |
| Typy/Interfejsy | PascalCase | `Profile`, `Mystery` |
| Stałe | SCREAMING_SNAKE_CASE | `QUERY_KEYS`, `ROUTES` |
| Pliki CSS | kebab-case | `index.css` |

### Struktura komponentu

```tsx
// 1. Importy (external → internal → types)
import { useState } from 'react'
import { Button } from '@/shared/components/ui/button'
import type { Profile } from '@/shared/types/domain.types'

// 2. Typy (jeśli lokalne)
interface MemberCardProps {
  member: Profile
  onEdit?: () => void
}

// 3. Komponent
export function MemberCard({ member, onEdit }: MemberCardProps) {
  // Hooki
  const [isOpen, setIsOpen] = useState(false)
  
  // Handlery
  const handleClick = () => setIsOpen(true)
  
  // Render
  return (
    <div>...</div>
  )
}
```

### Konwencja commitów (Conventional Commits)

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

**Typy:**
- `feat` — nowa funkcjonalność
- `fix` — naprawa błędu
- `docs` — dokumentacja
- `style` — formatowanie (nie zmieniające logiki)
- `refactor` — refaktoryzacja
- `test` — testy
- `chore` — zadania pomocnicze

**Przykłady:**
```
feat(admin): add batch mystery rotation
fix(dashboard): correct countdown timer calculation
docs(readme): update installation instructions
```

---

## 🚢 Deployment

### Vercel (produkcja)

Projekt jest skonfigurowany do deploymentu na **Vercel**:

1. Połącz repozytorium z Vercel
2. Ustaw zmienne środowiskowe (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`)
3. Deploy automatycznie przy push do `main`

**Konfiguracja** (`vercel.json`):
```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

### Środowiska

| Środowisko | Branch | URL |
|------------|--------|-----|
| Production | `main` | `https://roza-rozancowa.vercel.app` |
| Preview | PR branches | Automatyczne preview URL |
| Local | — | `http://localhost:5173` |

### Edge Functions (Supabase)

```bash
# Deploy funkcji
npx supabase functions deploy create-user
npx supabase functions deploy delete-user
npx supabase functions deploy update-user-login
npx supabase functions deploy update-user-password
```

---

## 🗺 Roadmapa

### ✅ Zrealizowane (MVP)

- [x] Autentykacja (email/hasło)
- [x] Panel użytkownika z podglądem tajemnicy
- [x] Potwierdzenie modlitwy
- [x] Panel administratora (CRUD członków, Róż)
- [x] Automatyczna rotacja tajemnic
- [x] Intencje miesięczne
- [x] Responsywny design (mobile-first)
- [x] Dark/Light mode
- [x] Testy jednostkowe (Vitest + React Testing Library)
- [x] Testy e2e (Playwright)

### 🚧 W planach

- [ ] **PWA** — instalacja na urządzeniu, offline support
- [ ] **Powiadomienia push** — przypomnienia o modlitwie
- [ ] **i18n** — wielojęzyczność (PL/EN)
- [ ] **Statystyki** — dashboard ze statystykami modlitwy
- [ ] **Eksport danych** — CSV/PDF raportów

### 💡 Pomysły na przyszłość

- [ ] Integracja z kalendarzem (Google/iCal)
- [ ] Aplikacja mobilna (React Native)
- [ ] Powiadomienia email (Resend)

---

## ❓ FAQ / Najczęstsze problemy

### Błąd: "Invalid API key"

**Przyczyna:** Nieprawidłowe klucze Supabase w `.env`

**Rozwiązanie:**
1. Sprawdź czy plik `.env` istnieje w głównym katalogu
2. Zweryfikuj klucze w panelu Supabase (Settings → API)
3. Upewnij się, że używasz `anon key`, nie `service_role key`

---

### Błąd: "supabase start" nie działa

**Przyczyna:** Docker nie jest uruchomiony

**Rozwiązanie:**
```bash
# Sprawdź status Dockera
docker info

# Uruchom Docker Desktop (Windows/Mac)
# lub: sudo systemctl start docker (Linux)
```

---

### Tajemnice się nie wyświetlają

**Przyczyna:** Brak danych w tabeli `mysteries`

**Rozwiązanie:**
```bash
# Lokalnie
npx supabase db reset

# Lub ręcznie wykonaj supabase/seed.sql w SQL Editorze
```

---

### Jak dodać nowego administratora?

1. Utwórz użytkownika normalnie
2. W Supabase Dashboard → Table Editor → `profiles`
3. Znajdź użytkownika i zmień `role` na `admin`

---

### Nie mogę się zalogować lokalnie

**Przyczyna:** Inbucket nie przechwytuje emaili weryfikacyjnych

**Rozwiązanie:**
1. Otwórz Inbucket: `http://localhost:54324`
2. Znajdź email weryfikacyjny i kliknij link

---

## 📄 Licencja

Ten projekt jest udostępniony na licencji **MIT**. Zobacz plik [LICENSE](LICENSE) po szczegóły.

```
MIT License

Copyright (c) 2024-2026 Róża Różańcowa

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software...
```

---

## 📬 Kontakt

- **Issues:** [GitHub Issues](https://github.com/twoj-login/roza-rozancowa/issues)
- **Dyskusje:** [GitHub Discussions](https://github.com/twoj-login/roza-rozancowa/discussions)

---

<div align="center">

**Stworzono z 🙏 na Chwałę Bożą**

*„Różaniec jest moją ulubioną modlitwą"* — Św. Jan Paweł II

</div>
