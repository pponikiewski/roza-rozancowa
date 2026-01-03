/**
 * Centralne miejsce dla stałych aplikacji
 */

/** Ścieżki routingu */
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  DASHBOARD: '/dashboard',
  ADMIN: {
    ROOT: '/admin',
    MEMBERS: '/admin/members',
    INTENTIONS: '/admin/intentions',
    ROSES: '/admin/roses',
  }
} as const

/** Klucze dla React Query */
export const QUERY_KEYS = {
  AUTH: ['auth'],
  PROFILE: (userId: string) => ['profile', userId],
  MYSTERY: (userId: string) => ['mystery', userId],
  INTENTION: ['intention'],
  ACKNOWLEDGMENT: (userId: string, mysteryId: number) => ['acknowledgment', userId, mysteryId],
  ROSE_MEMBERS: (groupId: number) => ['rose-members', groupId],
  // Admin
  ADMIN_MEMBERS: ['admin-members'],
  ADMIN_INTENTIONS: ['admin-intentions'],
  ADMIN_INTENTIONS_HISTORY: ['admin-intentions-history'],
  ADMIN_ROSES: ['admin-roses'],
} as const

/** Części różańca */
export const ROSARY_PARTS = {
  JOYFUL: 'Radosne',
  LUMINOUS: 'Światła',
  SORROWFUL: 'Bolesne',
  GLORIOUS: 'Chwalebne'
} as const

/** Cytaty różańcowe */
export const ROSARY_QUOTES = [
  { text: "Różaniec to potężna broń. Używaj go z ufnością, a zobaczysz cuda.", author: "Św. Josemaria Escriva" },
  { text: "Nie ma takiego problemu, ani osobistego, ani rodzinnego, ani narodowego, ani międzynarodowego, którego nie można byłoby rozwiązać przy pomocy Różańca.", author: "Siostra Łucja z Fatimy" },
  { text: "Uciekajcie się do Maryi... i odmawiajcie codziennie Różaniec.", author: "Św. Jan Bosko" },
  { text: "Różaniec jest moją ulubioną modlitwą.", author: "Św. Jan Paweł II" },
  { text: "Kto trzyma w ręku Różaniec, ten trzyma dłoń Matki Bożej.", author: "Św. Ojciec Pio" },
  { text: "Kochajcie Maryję i czyńcie wszystko, by Ją kochano. Odmawiajcie zawsze Jej Różaniec.", author: "Św. Ojciec Pio" },
  { text: "Zdrowaś Maryjo dobrze odmawiane, czyli z uwagą, nabożeństwem i skromnością, jest - według świętych - nieprzyjacielem szatana.", author: "Św. Ludwik Maria Grignion de Montfort" }
] as const
