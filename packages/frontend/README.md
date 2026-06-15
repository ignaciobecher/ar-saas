# ar-saas — Frontend

Frontend del template SaaS para startups argentinas. Stack: Next.js 15, TypeScript, Tailwind CSS 4, shadcn/ui.

---

## Stack

| Capa | Tecnología |
|---|---|
| Framework | Next.js 15 (App Router) |
| Lenguaje | TypeScript (strict) |
| Estilos | Tailwind CSS 4 |
| Componentes UI | shadcn/ui |
| Formularios | react-hook-form |
| HTTP | axios (con interceptor de refresh automático) |
| Auth | Cookies HttpOnly — tokens manejados por el backend |

---

## Prerequisitos

- Node.js 20 LTS o superior
- El backend corriendo en `http://localhost:3000` (o la URL configurada en `NEXT_PUBLIC_API_URL`)
- MongoDB corriendo (ver instrucciones en el README del backend)

---

## Setup inicial

### 1. Instalar dependencias

```bash
cd frontend
npm install
```

### 2. Configurar variables de entorno

```bash
# El generador ya copió .env.local.example → .env.local automáticamente
# Solo verificar que el valor sea correcto:
cat .env.local
```

| Variable | Descripción | Valor por defecto |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | URL base del backend | `http://localhost:3000` |

Si cambiaste el puerto del backend, actualizá este valor.

### 3. Levantar el backend primero

El frontend depende del backend para autenticación. Antes de arrancar el frontend, asegurate de que el backend esté corriendo:

```bash
# En otra terminal
cd backend
npm run start:dev
# Verificar: http://localhost:3000/api/docs debe cargar
```

Para levantar MongoDB antes del backend, ver las instrucciones en `backend/README.md` o ejecutar:

```bash
# Desde la raíz del proyecto
docker compose -f docker-compose.dev.yml up -d
```

### 4. Iniciar el frontend

```bash
npm run dev
```

El frontend levanta en `http://localhost:3001`. Al abrirlo por primera vez verás la pantalla de setup con instrucciones paso a paso.

---

## Comandos disponibles

```bash
npm run dev          # Servidor de desarrollo con hot reload
npm run build        # Build de producción
npm run start        # Servidor de producción (requiere build previo)
npm run lint         # ESLint
```

---

## Estructura de carpetas

```
src/
├── app/
│   ├── (auth)/          # Login, registro, verificación de email, reset de contraseña
│   ├── (dashboard)/     # Rutas protegidas (dashboard, perfil, billing, equipo)
│   ├── (legal)/         # Términos y privacidad
│   ├── auth/
│   │   └── github/
│   │       └── callback/ # Página que completa el intercambio de código OAuth de GitHub
│   ├── setup/           # Pantalla de setup inicial (se muestra al arrancar por primera vez)
│   ├── layout.tsx       # Layout raíz con AuthProvider
│   └── page.tsx         # Redirige a /login
├── components/
│   ├── auth/            # Componentes de autenticación (GitHubButton)
│   ├── landing/         # Componentes de la landing page (navbar, hero, features, pricing)
│   ├── dashboard/       # Sidebar, header y cards del dashboard
│   └── ui/              # Componentes shadcn/ui (no modificar directamente)
├── config/
│   └── site.ts          # Configuración centralizada de contenido del sitio
├── lib/
│   ├── api/
│   │   ├── client.ts    # Instancia axios con interceptor de 401 → refresh automático
│   │   └── auth.ts      # Métodos de API de autenticación
│   └── hooks/
│       └── use-auth.ts  # Hook para acceder al estado de auth
├── providers/
│   └── auth-provider.tsx # Contexto global de auth (login, logout, register, estado)
└── types/               # Interfaces TypeScript (User, Workspace, ApiError, etc.)
```

---

## Personalizar el contenido del sitio

Todo el contenido de la landing page (nombre, tagline, features, precios, FAQ) está centralizado en [`src/config/site.ts`](src/config/site.ts).

Los valores con formato `__PLACEHOLDER__` son reemplazados automáticamente por el generador al crear el proyecto. Para personalizarlos manualmente:

```typescript
// src/config/site.ts
export const siteConfig = {
  name: 'Mi SaaS',
  tagline: 'La descripción corta de tu producto',
  description: 'Descripción larga para SEO',
  supportEmail: 'soporte@midominio.com',
  // ... pricing, features, FAQ, etc.
}
```

---

## Rutas protegidas

Las rutas bajo `(dashboard)/` requieren autenticación. Si el usuario no está logueado, es redirigido a `/login` automáticamente (manejado en el layout del grupo, sin middleware).

Para agregar nuevas rutas protegidas, crear la carpeta dentro de `src/app/(dashboard)/`.

---

## Autenticación

- Tokens JWT en cookies HttpOnly — el frontend nunca lee ni guarda tokens.
- `useAuth()` expone `user`, `isAuthenticated`, `isLoading`, `login()`, `logout()`, `register()`, `refreshUser()`.
- El cliente axios renueva el access token automáticamente cuando recibe un 401.

### GitHub OAuth

El flujo de autenticación con GitHub está integrado en las páginas de login y registro.

**Flujo completo:**

1. Usuario hace click en "Continuar con GitHub"
2. El browser redirige a `{NEXT_PUBLIC_API_URL}/api/auth/github`
3. El backend inicia el OAuth flow con GitHub
4. GitHub redirige al backend con un código de autorización
5. El backend valida el código, busca o crea el usuario, y genera un código de intercambio (válido 30 segundos)
6. El backend redirige al frontend a `/auth/github/callback?code=...`
7. La página callback llama a `POST /api/auth/github/exchange` con el código
8. El backend setea las cookies `access_token` y `refresh_token` y retorna `{ success, alreadyExisted }`
9. El frontend refresca el estado de auth y redirige a `/dashboard`

**Casos manejados:**

| Caso | Comportamiento |
|---|---|
| Usuario nuevo | Se crea workspace + usuario, email marcado como verificado |
| Usuario existente por githubId | Login directo |
| Usuario existente por email | Se linkea el githubId, email marcado como verificado si no lo estaba |
| GitHub sin email público | Error — el usuario debe hacer público su email en GitHub |
| Código expirado o inválido | Redirección a `/auth/github/callback?error=github_failed`, se muestra pantalla de error |

**Archivos relevantes:**

| Archivo | Descripción |
|---|---|
| [`src/components/auth/github-button.tsx`](src/components/auth/github-button.tsx) | Botón reutilizable "Continuar con GitHub" |
| [`src/app/auth/github/callback/page.tsx`](src/app/auth/github/callback/page.tsx) | Página que recibe el código y completa el intercambio |
| [`src/lib/api/auth.ts`](src/lib/api/auth.ts) | `authApi.exchangeGithubCode(code)` |

**Configuración necesaria en el backend** (ver `backend/README.md`):
- Crear una GitHub OAuth App en [github.com/settings/applications/new](https://github.com/settings/applications/new)
- Configurar `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`, `GITHUB_CALLBACK_URL` y `FRONTEND_URL` en el `.env` del backend
