# 🌹 Róża Różańcowa

Aplikacja internetowa do zarządzania grupami Żywego Różańca, ułatwiająca organizację modlitwy, wymianę tajemnic oraz komunikację wewnątrz wspólnoty.

## ✨ Funkcjonalności

### 👤 Panel Użytkownika
- **Podgląd Tajemnicy**: Wyświetlanie aktualnie przypisanej tajemnicy różańcowej na dany miesiąc.
- **Potwierdzenie Modlitwy**: Możliwość odznaczenia wykonania modlitwy w danym miesiącu.
- **Licznik Czasu**: Odliczanie czasu do najbliższej zmiany tajemnic (pierwsza niedziela miesiąca).
- **Widok Róży**: Podgląd listy członków swojej grupy wraz z ich aktualnymi tajemnicami.

### 🛡️ Panel Administratora
- **Zarządzanie Użytkownikami**: Dodawanie, usuwanie i edycja członków, przypisywanie do grup.
- **Zarządzanie Różami**: Tworzenie i edycja grup modlitewnych (Róż).
- **Rotacja Tajemnic**: Automatyczna lub ręczna rotacja tajemnic dla wszystkich członków grupy.
- **Intencje**: Ustawianie miesięcznej intencji modlitewnej widocznej dla wszystkich.
- **Statystyki**: Podgląd statusu modlitwy w poszczególnych grupach.

## 🛠️ Technologie

Projekt został zbudowany w oparciu o nowoczesny stos technologiczny:

- **Frontend**: [React 19](https://react.dev/), [TypeScript](https://www.typescriptlang.org/), [Vite](https://vitejs.dev/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/), [Shadcn UI](https://ui.shadcn.com/) (Radix UI)
- **Backend / Baza Danych**: [Supabase](https://supabase.com/) (PostgreSQL, Auth, Edge Functions)
- **Routing**: [React Router v7](https://reactrouter.com/)
- **Ikony**: [Lucide React](https://lucide.dev/)

## 🚀 Uruchomienie Projektu

### Wymagania wstępne
- Node.js (wersja 18 lub nowsza)
- Konto w serwisie Supabase

### Instalacja

1. Sklonuj repozytorium:
```bash
git clone https://github.com/twoj-login/roza-rozancowa.git
cd roza-rozancowa
```

2. Zainstaluj zależności:
```bash
npm install
```

3. Skonfiguruj zmienne środowiskowe:
Utwórz plik `.env` w głównym katalogu i dodaj klucze Supabase:
```env
VITE_SUPABASE_URL=twoj_url_projektu
VITE_SUPABASE_ANON_KEY=twoj_klucz_anon
```

4. Uruchom serwer deweloperski:
```bash
npm run dev
```

## 🗄️ Struktura Bazy Danych (Supabase)

Aplikacja korzysta z następujących tabel:
- `profiles`: Rozszerzone dane użytkowników (imię, nazwisko, rola, przypisanie do grupy).
- `groups`: Grupy modlitewne (Róże).
- `mysteries`: Lista tajemnic różańcowych.
- `acknowledgments`: Potwierdzenia modlitwy.
- `intentions`: Miesięczne intencje modlitewne.

## ☁️ Supabase Edge Functions

Projekt wykorzystuje Edge Functions do operacji administracyjnych:
- `create-user`: Bezpieczne tworzenie użytkowników przez administratora.
- `delete-user`: Usuwanie kont użytkowników.
- `update-user-password`: Resetowanie haseł.

## 📱 Responsywność

Aplikacja jest w pełni responsywna i dostosowana do działania na:
- Komputerach stacjonarnych (Desktop)
- Tabletach
- Telefonach komórkowych (Mobile) - z dedykowanym układem nawigacji.

---
*Projekt stworzony na Chwałę Bożą.* 🙏
