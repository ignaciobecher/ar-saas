# ar-saas

<p align="center">
  <img src="assets/logo.png" alt="ar-saas" width="400" />
</p>

<p align="center">
  <strong>Generador de proyectos SaaS multi-tenant para startups argentinas</strong><br/>
  Backend NestJS + Frontend Next.js completo — landing, auth, dashboard y legal listos para producción.
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/ar-saas"><img src="https://img.shields.io/npm/v/ar-saas.svg" alt="npm version" /></a>
  <a href="https://github.com/ignaciobecher/ar-saas/blob/main/LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="license" /></a>
  <img src="https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen" alt="node version" />
</p>

---

## Quickstart

```bash
npx ar-saas mi-proyecto
```

Respondés algunas preguntas y en minutos tenés un proyecto completo corriendo localmente.

---

## ¿Qué genera?

```
mi-proyecto/
├── backend/                          # NestJS 11 + MongoDB
│   ├── src/
│   │   ├── modules/
│   │   │   ├── auth/                 # Auth completo (JWT + GitHub OAuth en cookies HttpOnly)
│   │   │   ├── users/                # Usuarios con roles
│   │   │   ├── workspaces/           # Multi-tenancy por workspace
│   │   │   └── mail/                 # Emails transaccionales con Resend
│   │   └── common/                   # Guards, filtros, decoradores, base repository
│   ├── .env                          # Copiado de .env.example automáticamente
│   └── package.json
│
├── frontend/                         # Next.js 15 + Tailwind CSS 4 + shadcn/ui
│   ├── src/
│   │   ├── config/
│   │   │   └── site.ts               # ← Personalización central del SaaS
│   │   ├── app/
│   │   │   ├── page.tsx              # Landing page completa
│   │   │   ├── (auth)/               # Login, register (+términos), verify, reset
│   │   │   ├── (dashboard)/          # Rutas protegidas
│   │   │   │   ├── dashboard/        # Overview con stat cards
│   │   │   │   ├── profile/          # Perfil de usuario + cambio de contraseña
│   │   │   │   ├── settings/         # Notificaciones, workspace, zona peligrosa
│   │   │   │   ├── billing/          # Plan actual, historial, upgrade
│   │   │   │   └── team/             # Miembros + invitaciones
│   │   │   ├── (legal)/
│   │   │   │   ├── terms/            # Términos y condiciones
│   │   │   │   └── privacy/          # Política de privacidad
│   │   │   └── setup/                # Onboarding inicial
│   │   ├── components/
│   │   │   ├── landing/              # Navbar, Hero, Features, Pricing, FAQ, Footer
│   │   │   ├── dashboard/            # Sidebar, Header, StatCard
│   │   │   └── ui/                   # 15+ componentes shadcn/ui
│   │   ├── providers/                # AuthProvider con estado global
│   │   └── lib/api/                  # Cliente axios con refresh automático
│   ├── .env.local                    # Copiado de .env.local.example automáticamente
│   └── package.json
│
└── railway.toml / fly.toml / docker-compose.yml
```

---

## Personalización

Al generar el proyecto, el CLI pregunta el nombre, tagline, descripción y email de soporte del SaaS. Esos valores se inyectan automáticamente en un único archivo:

```
frontend/src/config/site.ts
```

Ese archivo es la **fuente de verdad** para todo el contenido de la app:

```ts
export const siteConfig = {
  name: 'Mi SaaS',
  tagline: 'La plataforma que tu equipo necesita',
  description: 'Automatizá tu negocio...',
  supportEmail: 'hola@mi-saas.com',

  // Navegación de la landing
  nav: { links: [...] },

  // Secciones de la landing
  hero: { headline, description, cta, ctaSecondary },
  features: [...],     // Íconos, títulos y descripciones
  pricing: [...],      // 3 tiers con features, precios y CTAs
  faq: [...],          // Preguntas y respuestas

  // Footer
  footer: { columns, social, copyright },

  // Usado en /terms y /privacy
  legal: { companyName, email, lastUpdated },
}
```

Editás ese archivo una sola vez y toda la app (landing, footer, páginas legales) queda actualizada.

---

## Stack

### Backend
| Tecnología | Versión | Uso |
|---|---|---|
| NestJS | 11 | Framework principal |
| MongoDB + Mongoose | 9 | Base de datos |
| JWT (passport) | — | Autenticación en cookies HttpOnly |
| passport-github2 | — | OAuth con GitHub |
| Resend | — | Emails transaccionales |
| Swagger | — | Documentación automática en `/api/docs` |

### Frontend
| Tecnología | Versión | Uso |
|---|---|---|
| Next.js | 15 | App Router, Server Components |
| Tailwind CSS | 4 | Estilos |
| shadcn/ui + Radix UI | — | 15+ componentes listos (button, dialog, dropdown, tabs, accordion, avatar, switch, etc.) |
| react-hook-form | — | Formularios con validación |
| axios | — | HTTP client con interceptor de refresh |
| lucide-react | — | Íconos |

---

## Módulos incluidos

### Frontend — siempre incluido

| Sección | Contenido |
|---|---|
| **Landing page** | Navbar sticky, Hero con mockup, Features (6 cards), Pricing (3 tiers), FAQ (acordeón), CTA final, Footer |
| **Auth** | Login, Register (con checkbox de términos), Verify email, Forgot password, Reset password |
| **Dashboard** | Overview con stat cards, sidebar con navegación activa, header con avatar + dropdown |
| **Perfil** | Editar nombre/email, cambiar contraseña (modal), zona de eliminación de cuenta |
| **Ajustes** | Switches de notificaciones por email, configuración de workspace, zona peligrosa |
| **Facturación** | Plan actual, método de pago, historial de facturas, botón de upgrade |
| **Equipo** | Lista de miembros, invitar por email (modal), gestión de roles |
| **Legal** | Términos y condiciones, Política de privacidad — ambas enlazadas desde el footer y el register |

### Backend — siempre incluido

| Módulo | Descripción |
|---|---|
| **Auth completo** | Registro, login, verificación de email, reset de password |
| **GitHub OAuth** | Login/registro con GitHub (código de intercambio + cookies HttpOnly) |
| **Multi-tenancy** | Aislamiento estricto por `workspaceId` en todas las queries |
| **Mail transaccional** | Verificación, bienvenida y reset con Resend. Fail-open si Resend falla |

### Módulos opcionales

| Módulo | Descripción |
|---|---|
| **Notificaciones** | Notificaciones in-app + Push Web (VAPID) |
| **Invoices + Quotes** | Facturación con generación de PDF |
| **CRM** | Kanban + Pipeline de ventas |

---

## Configuración

Al ejecutar el CLI se copian automáticamente los archivos `.env.example` → `.env`.

### Backend — variables requeridas

| Variable | Descripción |
|---|---|
| `MONGODB_URI` | URI de conexión a MongoDB |
| `JWT_ACCESS_SECRET` | Secreto para access tokens (`openssl rand -hex 64`) |
| `JWT_REFRESH_SECRET` | Secreto para refresh tokens (distinto al anterior) |
| `RESEND_API_KEY` | API Key de [Resend](https://resend.com) |
| `RESEND_FROM_EMAIL` | Email remitente verificado en Resend |
| `APP_URL` | URL del frontend (para links en emails) |
| `CORS_ORIGINS` | URL del frontend separada por comas |
| `FRONTEND_URL` | URL del frontend para redirecciones OAuth |
| `GITHUB_CLIENT_ID` | Client ID de tu GitHub OAuth App |
| `GITHUB_CLIENT_SECRET` | Client Secret de tu GitHub OAuth App |
| `GITHUB_CALLBACK_URL` | Callback URL registrada en GitHub |

### Frontend — variables requeridas

| Variable | Descripción |
|---|---|
| `NEXT_PUBLIC_API_URL` | URL base del backend (ej: `http://localhost:3000`) |

---

## Deploy

El CLI genera la configuración según el entorno elegido:

### Railway
```toml
# railway.toml generado automáticamente
[build]
builder = "nixpacks"

[deploy]
startCommand = "npm run start:prod"
healthcheckPath = "/api/health"
```

### Fly.io
```toml
# fly.toml generado automáticamente
app = "mi-proyecto"
primary_region = "gru"  # São Paulo
```

### Docker
```yaml
# docker-compose.yml generado automáticamente
# Incluye backend + frontend + MongoDB
docker compose up
```

---

## Iniciar el proyecto generado

```bash
# Backend
cd mi-proyecto/backend
npm install
npm run start:dev
# → http://localhost:3000
# → Swagger: http://localhost:3000/api/docs

# Frontend (en otra terminal)
cd mi-proyecto/frontend
npm install
npm run dev
# → http://localhost:3001 (landing page)
# → http://localhost:3001/login
# → http://localhost:3001/dashboard
```

La landing page aparece directo en `/`. El primer setup del backend se hace desde la pantalla de onboarding.

---

## Flujos de autenticación implementados

- `POST /api/auth/register` — Registro con email de verificación
- `GET  /api/auth/verify-email?token=` — Verificación de email
- `POST /api/auth/login` — Login (setea cookies HttpOnly)
- `POST /api/auth/refresh` — Refresh automático del access token
- `POST /api/auth/logout` — Logout (limpia cookies)
- `POST /api/auth/forgot-password` — Solicitud de reset
- `POST /api/auth/reset-password` — Reset de contraseña
- `GET  /api/auth/me` — Datos del usuario autenticado
- `GET  /api/auth/github` — Inicia el flujo OAuth con GitHub
- `GET  /api/auth/github/callback` — Callback de GitHub
- `POST /api/auth/github/exchange` — Canjea el código por cookies de sesión

Los tokens JWT viajan **únicamente en cookies HttpOnly**. Nunca en `localStorage` ni en el body de las respuestas.

---

## Requisitos

- **Node.js** 18+
- **MongoDB** local o [Atlas](https://www.mongodb.com/atlas) (free tier disponible)
- Cuenta en [Resend](https://resend.com) para emails (free tier: 100 emails/día)

---

## Licencia

MIT © 2026 [Ignacio Becher](https://github.com/ignaciobecher)

El código generado por esta herramienta es completamente tuyo, sin restricciones de uso comercial. Podés usarlo, modificarlo y distribuirlo libremente.

---

## Legal

**Propiedad del código generado**

Todo el código que `ar-saas` genera en tu proyecto te pertenece a vos. No reclamamos ningún derecho sobre el código generado ni sobre los productos que construyas con él.

**Sin garantías**

Esta herramienta se provee "tal cual" (*as is*), sin garantías de ningún tipo. No nos hacemos responsables por:

- Vulnerabilidades de seguridad en el código generado si modificás la configuración por defecto
- Daños directos o indirectos derivados del uso del software
- Pérdida de datos o interrupciones de servicio en proyectos construidos con esta herramienta

**Dependencias de terceros**

El código generado incluye dependencias de terceros (NestJS, Next.js, MongoDB, etc.), cada una con su propia licencia. Es tu responsabilidad revisar y cumplir con los términos de cada dependencia en tu proyecto.

**Seguridad**

Si encontrás una vulnerabilidad de seguridad en esta herramienta, por favor reportala abriendo un issue en el [repositorio de GitHub](https://github.com/ignaciobecher/ar-saas) en lugar de hacerlo público.

---

<p align="center">
  Hecho en Argentina 🇦🇷
</p>
