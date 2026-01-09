# Testy E2E - Setup Guide

## 🚀 Pierwsze uruchomienie

### 1. Dodaj service_role key do .env.local

Projekt już ma `.env.local` z konfiguracją Supabase. Musisz tylko dodać klucz dla testów:

```bash
# Edytuj .env.local i dodaj:
VITE_SUPABASE_SERVICE_ROLE_KEY=twoj-service-role-key
```

**Gdzie znaleźć service_role key?**
- Supabase Dashboard → Settings → API
- Znajdź `service_role` key → kliknij "Reveal" → skopiuj

### 2. Uruchom testy

Użytkownicy testowi zostaną **automatycznie utworzeni** przy pierwszym uruchomieniu!

```bash
# Uruchom wszystkie testy E2E
npm run test:e2e

# Uruchom z UI (zalecane do debugowania)
npm run test:e2e:ui

# Uruchom w trybie debug
npm run test:e2e:debug
```

**Co się dzieje przy pierwszym uruchomieniu:**
1. Global setup sprawdza czy użytkownicy testowi istnieją
2. Jeśli nie, tworzy ich automatycznie:
   - `test.user@example.com` (zwykły użytkownik)
   - `admin@example.com` (administrator)
   - `no.assignment@example.com` (bez przypisania)
3. Dodaje ich do tabeli `members`
4. Uruchamia testy

## 🧹 Czyszczenie użytkowników testowych

Jeśli chcesz usunąć użytkowników testowych:

1. Supabase Dashboard → Authentication → Users
2. Usuń użytkowników: `test.user@example.com`, `admin@example.com`, `no.assignment@example.com`
3. Przy następnym uruchomieniu testów zostaną utworzeni ponownie

##  Struktura testów

```
tests/e2e/
├── auth/
│   └── auth.spec.ts          # 8 testów autoryzacji
├── fixtures/
│   └── test-data.ts          # Dane testowe (użytkownicy, tajemnice)
└── helpers/
    └── auth-helpers.ts       # Funkcje pomocnicze (login, logout)
```

## 🧪 Testy autoryzacji (8 testów)

1. ✅ Renderowanie strony logowania
2. ✅ Logowanie zwykłego użytkownika
3. ✅ Logowanie administratora
4. ✅ Błąd przy niepoprawnym haśle
5. ✅ Walidacja formatu email
6. ✅ Wylogowanie użytkownika
7. ✅ Ochrona tras przed niezalogowanymi
8. ✅ Ochrona /admin przed zwykłymi użytkownikami

## 🐛 Debugowanie

### Playwright UI Mode (zalecane)
```bash
npm run test:e2e:ui
```

### Playwright Debug Mode
```bash
npm run test:e2e:debug
```

### Obejrzyj raport po testach
```bash
npx playwright show-report
```

## 📝 Notatki

- Testy automatycznie uruchamiają dev server (`npm run dev`)
- Testy działają na `http://localhost:5173`
- Screenshots i video tylko przy błędach (oszczędność miejsca)
- Trace dostępne przy błędzie (do debugowania)

## ⚠️ Typowe problemy

**Problem:** Testy nie mogą się połączyć z bazą
- **Rozwiązanie:** Sprawdź czy `.env` ma poprawne dane Supabase

**Problem:** "Missing Supabase configuration" przy uruchomieniu
- **Rozwiązanie:** Dodaj `VITE_SUPABASE_SERVICE_ROLE_KEY` do `.env`

**Problem:** "Invalid login credentials"
- **Rozwiązanie:** Sprawdź czy użytkownicy testowi istnieją w bazie

**Problem:** Timeout podczas ładowania strony
- **Rozwiązanie:** Upewnij się że dev server działa (`npm run dev`)

**Problem:** Test przechodzi lokalnie ale pada na CI
- **Rozwiązanie:** Zwiększ timeout w `playwright.config.ts`
