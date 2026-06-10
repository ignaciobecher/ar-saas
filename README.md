# create-saas-ar

Generador de proyectos SaaS multi-tenant para startups argentinas.

## Quickstart

```bash
npx create-saas-ar mi-proyecto
```

Seguí el asistente interactivo y en minutos tenés un proyecto listo para correr.

## Qué genera

**Backend** — NestJS 11 + MongoDB + JWT en cookies HttpOnly + multi-tenancy por workspace + mail con Resend + Swagger automático.

**Frontend** — Next.js 15 + Tailwind CSS 4 + shadcn/ui + auth completo + refresh automático de tokens.

## Módulos incluidos (free)

- Auth completo: registro, login, verificación de email, reset de password
- Multi-tenancy con aislamiento estricto por `workspaceId`
- Mail transaccional con Resend (verificación, bienvenida, reset)

## Módulos PRO

| Módulo | Descripción |
|---|---|
| Auth avanzado | OAuth GitHub/Google + 2FA TOTP (Google Authenticator) |
| Notificaciones | Notificaciones in-app + Push Web (VAPID) |
| Invoices + Quotes | Facturación con generación de PDF |
| CRM | Kanban + Pipeline de ventas |
| MercadoPago | Suscripciones recurrentes con webhooks |

[Conseguir licencia PRO →](https://create-saas-ar.dev)

## Opciones de deploy

El CLI genera la configuración para:

- **Railway** — `railway.toml` listo para usar
- **Fly.io** — `fly.toml` con región `gru` (São Paulo)
- **Docker** — `docker-compose.yml` con MongoDB incluido

## Requisitos

- Node.js 18+
- MongoDB (o usar el Docker Compose incluido)
- Cuenta en [Resend](https://resend.com) para emails

## Variables de entorno

El CLI copia `.env.example` → `.env` automáticamente. Completar al menos:

```
MONGODB_URI=
JWT_ACCESS_SECRET=
JWT_REFRESH_SECRET=
RESEND_API_KEY=
```

## Licencia

MIT — el código generado es tuyo, sin restricciones.
