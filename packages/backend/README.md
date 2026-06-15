<p align="center"><samp>
╔══════════════════════════════════╗<br/>
║&nbsp;&nbsp;ar-saas-backend&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<br/>
║&nbsp;&nbsp;AFIP&nbsp;·&nbsp;Mercado&nbsp;Pago&nbsp;·&nbsp;Auth&nbsp;·&nbsp;Mail&nbsp;&nbsp;<br/>
║&nbsp;&nbsp;todo&nbsp;integrado&nbsp;en&nbsp;un&nbsp;comando&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<br/>
╚══════════════════════════════════╝<br/>
</samp></p>

<p align="center">
  <strong>El backend SaaS que ojalá hubieras tenido cuando empezaste.</strong>
  <br/>
  AFIP, Mercado Pago, auth, multi-tenancy, emails — ya integrado. En vez de perder
  3 semanas armando lo mismo de siempre, clonás esto y empezás a facturar.
</p>

---

## ¿Por qué existe esto?

Armar un SaaS en Argentina duele. Pasás semanas cableando autenticación con JWT,
aislamiento multi-tenant, envío de mails, validaciones, estructura de carpetas,
manejo de errores. Y cuando por fin terminás todo ese boilerplate, te das cuenta
de que todavía falta integrar AFIP para facturación electrónica y Mercado Pago
para cobrar. Otras 2 semanas.

`ar-saas` genera este repositorio completo **en un comando**. Viene con
todo lo genérico ya resuelto, más integraciones reales para operar en Argentina.
**Solo tenés que agregar tus módulos de negocio** siguiendo el patrón de
`.ai-docs/`.

## Stack

| Capa | Tecnología | Versión |
|---|---|---|
| Runtime | Node.js | 22 LTS |
| Lenguaje | TypeScript | 5.7 |
| Framework | NestJS | 11 |
| Base de datos | MongoDB | 8 |
| ODM | Mongoose | 9 |
| Auth (tokens) | JWT + cookies HttpOnly | — |
| Auth (passwords) | bcrypt | 5.x |
| Auth (passport) | passport + passport-jwt + passport-github2 | 0.7 / 4.x / 0.1.x |
| Validación | class-validator | 0.14 |
| Transformación | class-transformer | 0.5 |
| Emails | Resend | 4.x |
| Documentación API | Swagger | 11.x |
| Tareas programadas | @nestjs/schedule | 6.x |
| Testing | Jest | 30 |
| Formateo | Prettier | 3.x |
| Linting | ESLint | 9.x |

## Características principales

- **Multi-tenancy real** — Aislamiento por `workspaceId` garantizado en cada query. El `workspaceId` se extrae del JWT verificado del usuario autenticado. `BaseRepository` fuerza el filtro en toda operación. Imposible leakear datos entre workspaces por error humano.

- **Auth completo** — Registro, login, refresh token rotativo, email verification, password reset y **OAuth con GitHub**. Access + refresh tokens en cookies `HttpOnly`, `Secure`. `SameSite=none` + `Partitioned` en producción para soporte cross-domain. Con rate limiting en endpoints sensibles y Helmet para headers de seguridad. Nunca en `localStorage` ni en el body.

- **BaseRepository genérico** — Soft delete, paginación, filtros dinámicos, agregaciones, conteo, upsert. Manejo automático de errores MongoDB (duplicate key, cast error). 12 métodos heredados por todos los repositorios.

- **DTOs con validación estricta** — `class-validator` con mensajes en español. `class-transformer` para coerción de tipos. `PartialType` de Swagger para updates. `forbidNonWhitelisted` + `whitelist` para rechazar campos no declarados.

- **Manejo de errores uniforme** — `GlobalExceptionFilter` transforma toda excepción a `{ statusCode, message, error, timestamp, path }`. Errores 5xx se loguean, 4xx no. Mensajes de validación concatenados y en español.

- **Emails con Resend** — Servicio de mail con métodos para verificación, reset de contraseña y bienvenida. Templates HTML inline. Preparado para reintentos con `@nestjs/schedule` y cola de emails fallidos.

- **Swagger automático** — `@ApiProperty` y `@ApiTags` en cada DTO y controller. Documentación interactiva en `/api/docs` sin configuración extra.

- **Soporte multi-agente IA** — El proyecto incluye `.ai-docs/` (fuente de verdad compartida entre herramientas), `.claude/CLAUDE.md` (leído automáticamente por Claude Code) y `.opencode/` (prompt + config para OpenCode/DeepSeek). Cada herramienta tiene tareas asignadas según su fortaleza: Claude Code para arquitectura y decisiones de seguridad, DeepSeek para tareas mecánicas como generar CRUD o tests.

## Cómo empezar

### 1. Instalar dependencias

```bash
cd backend
npm install
```

### 2. Levantar MongoDB

El generador crea un `docker-compose.dev.yml` en la raíz del proyecto con MongoDB preconfigurado.

**Opción A — Docker (recomendado):**

```bash
# Desde la raíz del proyecto (no desde /backend)
docker compose -f docker-compose.dev.yml up -d

# Verificar que está corriendo
docker ps
```

MongoDB queda disponible en `mongodb://localhost:27017`. Los datos persisten en un volumen Docker entre reinicios.

**Opción B — MongoDB Atlas (cloud gratuito):**

1. Crear cuenta en [mongodb.com/atlas](https://mongodb.com/atlas) (M0 Free Tier)
2. En **Database Access** → crear un usuario con contraseña
3. En **Network Access** → agregar tu IP (o `0.0.0.0/0` para desarrollo)
4. En **Connect** → "Connect your application" → copiar la URI de conexión
5. Reemplazar `<password>` en la URI con la contraseña del paso 2
6. Pegar la URI completa en `MONGODB_URI` del `.env`

**Opción C — MongoDB local sin Docker:**

Instalá MongoDB Community Edition siguiendo las instrucciones oficiales:
`docs.mongodb.com/manual/installation`

### 3. Configurar variables de entorno

```bash
# El generador ya copió .env.example → .env automáticamente
# Completar los valores faltantes:
```

**Variables obligatorias:**

| Variable | Descripción |
|---|---|
| `MONGODB_URI` | URI de MongoDB. Local: `mongodb://localhost:27017/mi-saas` |
| `JWT_ACCESS_SECRET` | Secreto para access tokens — ver instrucción abajo |
| `JWT_REFRESH_SECRET` | Secreto para refresh tokens — usar valor distinto al anterior |
| `RESEND_API_KEY` | API key de Resend para enviar emails |
| `RESEND_FROM_EMAIL` | Email remitente verificado en Resend |
| `APP_URL` | URL del frontend: `http://localhost:3001` |
| `CORS_ORIGINS` | URL del frontend (misma que APP_URL): `http://localhost:3001` |
| `GITHUB_CLIENT_ID` | Client ID de la GitHub OAuth App |
| `GITHUB_CLIENT_SECRET` | Client Secret de la GitHub OAuth App |
| `GITHUB_CALLBACK_URL` | `http://localhost:3001/api/auth/github/callback` en desarrollo |
| `FRONTEND_URL` | URL del frontend para redirigir después del OAuth: `http://localhost:3000` |

**Configurar GitHub OAuth:**

1. Ir a [github.com/settings/applications/new](https://github.com/settings/applications/new)
2. Completar:
   - **Application name**: nombre de tu app
   - **Homepage URL**: `http://localhost:3000`
   - **Authorization callback URL**: `http://localhost:3001/api/auth/github/callback`
3. Hacer click en **Register application**
4. Copiar el **Client ID** → `GITHUB_CLIENT_ID`
5. Generar un **Client Secret** → `GITHUB_CLIENT_SECRET`

En producción, crear una segunda OAuth App con las URLs de producción, o actualizar la existente.

**Generar JWT secrets:**

```bash
# Con Node.js
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# O con openssl
openssl rand -hex 64
```

Ejecutar dos veces para obtener dos valores distintos: uno para `JWT_ACCESS_SECRET` y otro para `JWT_REFRESH_SECRET`.

**Configurar Resend (emails):**

1. Crear cuenta gratis en [resend.com](https://resend.com) (3 000 emails/mes gratis)
2. Ir a **API Keys** → "Create API Key" → copiar la key
3. Pegar en `RESEND_API_KEY`
4. Para desarrollo: podés usar el dominio sandbox de Resend (solo envía a tu propio email)
5. Para producción: agregar y verificar tu dominio en "Domains"

### 4. Levantar el servidor

```bash
npm run start:dev
```

El servidor corre en `http://localhost:3000/api`. Swagger en `http://localhost:3000/api/docs`.

**Verificar que todo funciona:**

- El log muestra `Connected to MongoDB successfully`
- `http://localhost:3000/api/docs` carga y lista los endpoints de auth
- `POST http://localhost:3000/api/auth/register` crea un usuario correctamente

**Errores frecuentes:**

| Error | Causa probable |
|---|---|
| `ECONNREFUSED 127.0.0.1:27017` | MongoDB no está corriendo — ejecutar `docker compose -f docker-compose.dev.yml up -d` |
| `secretOrPrivateKey must have a value` | `JWT_ACCESS_SECRET` o `JWT_REFRESH_SECRET` vacíos en `.env` |
| Error de CORS en el frontend | `CORS_ORIGINS` en `.env` no incluye `http://localhost:3001` |
| Emails no llegan | Verificar `RESEND_API_KEY` y que `RESEND_FROM_EMAIL` esté verificado en Resend |
| GitHub OAuth: `redirect_uri_mismatch` | La callback URL en la GitHub App no coincide con `GITHUB_CALLBACK_URL` en `.env` |
| GitHub OAuth: `No public email on GitHub account` | El usuario de GitHub tiene el email en privado — debe hacerlo público en [github.com/settings/profile](https://github.com/settings/profile) |

## Comandos disponibles

```bash
npm run start:dev       # Desarrollo con hot reload
npm run start:prod      # Producción (build + node dist/main)
npm run build           # Compilar TypeScript
npm run test            # Tests unitarios
npm run test:e2e        # Tests end-to-end
npm run test:cov        # Tests con coverage
npm run lint            # ESLint con fix automático
npm run format          # Prettier en todo el proyecto
```

## Estructura del proyecto

```
src/
├── common/
│   ├── base/
│   │   ├── base.schema.ts          # workspaceId, createdBy, deletedAt
│   │   └── base.repository.ts      # findAll, findById, create, update, softDelete, paginate, aggregate...
│   ├── decorators/
│   │   ├── workspace-id.decorator.ts  # @WorkspaceId()
│   │   └── current-user.decorator.ts  # @CurrentUser()
│   ├── filters/
│   │   └── global-exception.filter.ts # 4xx/5xx → { statusCode, message, error, timestamp, path }
│   ├── guards/
│   │   └── jwt-auth.guard.ts          # AuthGuard('jwt')
│   └── interceptors/
│       └── workspace-tenant.interceptor.ts  # Extrae workspaceId del JWT verificado
├── modules/
│   ├── auth/           # Registro, login, refresh, email verification, password reset, GitHub OAuth
│   ├── users/          # CRUD de usuarios
│   ├── workspaces/     # CRUD de workspaces
│   └── mail/           # Envío de emails con Resend (@Global)
├── app.module.ts
└── main.ts             # bootstrap: ValidationPipe, cookieParser, CORS, Swagger
.ai-docs/               # Documentación compartida entre agentes AI y desarrolladores
├── architecture/       # overview, module-pattern, database-pattern
├── conventions/        # naming, error-handling, dto-validation
├── modules/            # auth, multi-tenancy, mail
└── examples/           # full-module-example (módulo Clientes completo), repository-example
.claude/                # Prompt y reglas para Claude Code
.opencode/              # Prompt y config para OpenCode/DeepSeek
```

## Documentación para agentes AI

Este proyecto está diseñado para que dos agentes de IA trabajen en paralelo:

| Herramienta | Config | Ideal para |
|---|---|---|
| **Claude Code** | `.claude/CLAUDE.md` | Arquitectura, auth avanzado, decisiones de seguridad, refactors |
| **OpenCode / DeepSeek** | `.opencode/config.json` + `system-prompt.md` | CRUD de módulos nuevos, DTOs, tests, renombrar archivos |

Ambos leen `.ai-docs/` como fuente de verdad. Las **8 reglas absolutas** están en `.claude/CLAUDE.md` y `.opencode/system-prompt.md`.

## Cómo crear un módulo nuevo

Seguí el checklist de 12 pasos en `.ai-docs/examples/full-module-example.md`. El resumen:

1. Crear carpeta `src/modules/{nombre}/` con `schemas/` y `dto/`
2. Schema → extiende `BaseSchema`
3. DTO Create → `class-validator` con mensajes en español
4. DTO Update → `extends PartialType(CreateXxxDto)`
5. Repository → extiende `BaseRepository`, métodos con `workspaceId` primero
6. Service → `create`, `findAll`, `findById`, `update`, `remove`
7. Controller → `@WorkspaceId()`, `@CurrentUser()`, nunca `@Req()`
8. Module → `MongooseModule.forFeature(...)`, exporta el service
9. Registrar en `AppModule`
10. `npm run build` → verificar que compila
11. Swagger → verificar en `/api/docs`
12. Tests → unitarios del service, e2e del controller

El archivo `.ai-docs/examples/full-module-example.md` tiene el módulo Clientes completo para copiar y adaptar.

## Licencia

Privado (UNLICENSED). Generado con [`ar-saas`](https://github.com/anomalyco/ar-saas).
