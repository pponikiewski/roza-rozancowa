# 🧪 Testy

Struktura i konwencje testowe dla projektu Róża Różańcowa.

## 📁 Struktura

```
tests/
├── unit/             # Testy jednostkowe (Vitest) - 10 kluczowych testów
│   ├── auth/
│   │   ├── LoginPage.test.tsx        # 3 testy
│   │   └── ProtectedRoute.test.tsx   # 2 testy
│   ├── user/
│   │   ├── MysteryCard.test.tsx      # 3 testy
│   │   └── useMysteryChangeTimer.test.ts  # 1 test
│   └── shared/
│       └── useTypedMutation.test.tsx # 1 test
├── e2e/              # Testy end-to-end (Playwright)
│   └── auth/
├── utils/            # Helpery testowe
│   ├── test-utils.tsx
│   ├── hook-helpers.tsx
│   └── index.ts
└── setup.ts
```

## 🔧 Konfiguracja

### Uruchomienie testów

```bash
# Wszystkie testy jednostkowe
npm test

# Testy z UI (interactive mode)
npm run test:ui

# Testy z coverage
npm run test:coverage

# Testy E2E
npm run test:e2e
```

## 📚 Helpery testowe

### Renderowanie komponentów

```tsx
import { renderWithProviders, screen } from '@tests/utils'

test('component test', async () => {
  const { user } = renderWithProviders(<MyComponent />)
  
  await user.click(screen.getByRole('button'))
  expect(screen.getByText('Success')).toBeInTheDocument()
})
```

### Renderowanie hooks

```tsx
import { renderHookWithQuery } from '@tests/utils'

test('hook test', async () => {
  const { result, queryClient } = renderHookWithQuery(() => useMyHook())
  
  await result.current.execute()
  expect(result.current.data).toBeDefined()
})
```

### Fake timers

```tsx
import { setupTimers, cleanupTimers } from '@tests/utils'

describe('Timer tests', () => {
  beforeEach(setupTimers)
  afterEach(cleanupTimers)
  
  it('should work with fake time', () => {
    vi.setSystemTime(new Date(2026, 0, 15))
    // ... test logic
  })
})
```

## 🎭 Mockowanie

Mockuj zależności bezpośrednio w plikach testowych używając `vi.mock()` (jest automatycznie hoistowane):

### Przykład: Toast notifications

```tsx
import { vi } from 'vitest'

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
    warning: vi.fn(),
    loading: vi.fn(),
    dismiss: vi.fn(),
  },
}))

import { toast } from 'sonner'
import { myFunction } from '@/feature'

const mockToast = vi.mocked(toast)

test('shows success toast', async () => {
  await myFunction()
  expect(mockToast.success).toHaveBeenCalledWith('Success message')
})
```

### Przykład: Utilities

```tsx
vi.mock('@/shared/lib/utils', () => ({
  getErrorMessage: (error: Error) => error.message,
  cn: (...args: unknown[]) => args.filter(Boolean).join(' '),
}))
```

**Ważne:** `vi.mock()` musi być przed importem mockowanego modułu (Vitest automatycznie hoistuje mocki na początek pliku).

## 📋 Konwencje

### Nazewnictwo plików

- Testy jednostkowe: `*.test.{ts,tsx}`
- Testy E2E: `*.spec.ts`

### Struktura testów

```tsx
describe('Feature/Component name', () => {
  beforeEach(() => {
    // Setup przed każdym testem
    clearAllMocks()
  })

  it('should describe what it tests in Polish', () => {
    // Arrange
    const input = 'test data'
    
    // Act
    const result = myFunction(input)
    
    // Assert
    expect(result).toBe('expected output')
  })
})
```

### Best practices

1. **Izolacja** - każdy test jest niezależny, używaj `beforeEach`/`afterEach`
2. **Mockuj w pliku testowym** - używaj `vi.mock()` bezpośrednio w pliku testu, nie twórz współdzielonych mocków (wyjątek: złożone mocki używane w wielu plikach)
3. **Testy w języku polskim** - opisy testów (`it()`) po polsku dla czytelności
4. **AAA Pattern** - Arrange, Act, Assert w każdym teście
5. **Helpery** - wykorzystuj `renderWithProviders()`, `renderHookWithQuery()` zamiast ręcznych wrapperów
6. **waitFor dla asynchroniczności** - gdy sprawdzasz callbacki/efekty uboczne, używaj `waitFor(() => { expect(...) })`

## 🎯 Coverage

Coverage jest generowany w folderze `coverage/`:
- HTML report: `coverage/index.html`
- JSON data: `coverage/coverage-final.json`

Docelowy próg: **80% coverage** dla krytycznych modułów.

## 🔍 Debugowanie

### VS Code

Ustaw breakpoint i uruchom test w debug mode (F5 w pliku testu).

### Browser

```bash
npm run test:ui
```

Otwiera interaktywny UI z możliwością debugowania.
