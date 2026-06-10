<p align="center"><samp>
╔══════════════════════════════════╗<br/>
║&nbsp;&nbsp;prueba2-backend&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<br/>
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

`prueba2` genera este repositorio completo **en un comando**. Viene con
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
| Auth (passport) | passport + passport-jwt | 0.7 / 4.x |
| Validación | class-validator | 0.14 |
| Transformación | class-transformer | 0.5 |
| Emails | Resend | 4.x |
| Documentación API | Swagger | 11.x |
| Tareas programadas | @nestjs/schedule | 6.x |
| Testing | Jest | 30 |
| Formateo | Prettier | 3.x |
| Linting | ESLint | 9.x |

## Características principales

- **Multi-tenancy real** — Aislamiento por `workspaceId` garantizado en cada query. Un `WorkspaceTenantInterceptor` extrae el tenant del header `x-workspace-id` o del JWT. `BaseRepository` fuerza el filtro en toda operación. Imposible leakear datos entre workspaces por error humano.

- **Auth completo** — Registro, login, refresh token rotativo, email verification, password reset, change password. Access + refresh tokens en cookies `HttpOnly`, `Secure`, `SameSite=Strict`. Nunca en `localStorage` ni en el body.

- **BaseRepository genérico** — Soft delete, paginación, filtros dinámicos, agregaciones, conteo, upsert. Manejo automático de errores MongoDB (duplicate key, cast error). 12 métodos heredados por todos los repositorios.

- **DTOs con validación estricta** — `class-validator` con mensajes en español. `class-transformer` para coerción de tipos. `PartialType` de Swagger para updates. `forbidNonWhitelisted` + `whitelist` para rechazar campos no declarados.

- **Manejo de errores uniforme** — `GlobalExceptionFilter` transforma toda excepción a `{ statusCode, message, error, timestamp, path }`. Errores 5xx se loguean, 4xx no. Mensajes de validación concatenados y en español.

- **Emails con Resend** — Servicio de mail con métodos para verificación, reset de contraseña y bienvenida. Templates HTML inline. Preparado para reintentos con `@nestjs/schedule` y cola de emails fallidos.

- **Swagger automático** — `@ApiProperty` y `@ApiTags` en cada DTO y controller. Documentación interactiva en `/api/docs` sin configuración extra.

- **Soporte multi-agente IA** — El proyecto incluye `.ai-docs/` (fuente de verdad compartida entre herramientas), `.claude/CLAUDE.md` (leído automáticamente por Claude Code) y `.opencode/` (prompt + config para OpenCode/DeepSeek). Cada herramienta tiene tareas asignadas según su fortaleza: Claude Code para arquitectura y decisiones de seguridad, DeepSeek para tareas mecánicas como generar CRUD o tests.

## Cómo empezar

```bash
# 1. Clonar
git clone <repo-url> mi-saas-backend
cd mi-saas-backend

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
cp .env.example .env
# Editar .env con tus valores (MONGODB_URI, JWT secrets, RESEND_API_KEY, etc.)

# 4. Levantar en desarrollo
npm run start:dev
```

El servidor corre en `http://localhost:3000/api`. Swagger en `http://localhost:3000/api/docs`.

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
│       └── workspace-tenant.interceptor.ts  # x-workspace-id header → request.workspaceId
├── modules/
│   ├── auth/           # Registro, login, refresh, email verification, password reset
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

Privado (UNLICENSED). Generado con [`prueba2`](https://github.com/anomalyco/prueba2).
