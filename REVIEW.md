# ar-saas — Security & Quality Audit

**Date:** 2026-06-10
**Auditor:** Claude (gsd-code-reviewer)
**Depth:** Deep (cross-file, full source review)
**Repositories reviewed:**
- `c:/Users/ignac/Documents/programacion/ar-saas` (CLI tool, v0.3.3)
- `c:/Users/ignac/Documents/programacion/ar-saas-templates/create-saas-ar-frontend` (Frontend template source)
- `c:/Users/ignac/Documents/programacion/ar-saas-templates/create-saas-backend` (Backend template source)

---

## Executive Summary

**ar-saas** is a Node.js CLI tool (published to npm as `ar-saas`) that scaffolds production-ready SaaS projects. It interactively prompts the user for project configuration, then copies two template projects and applies name/token substitutions.

### What the CLI generates

**Backend template** (`/backend`): A NestJS application with:
- Multi-tenant architecture using MongoDB (via Mongoose) and workspaces
- Full authentication: register, email verification, login, JWT access/refresh token rotation (cookie-based), password reset
- Email delivery via Resend
- Swagger documentation
- Global validation pipe, exception filter, and workspace-tenant interceptor
- Base repository with soft-delete and pagination support

**Frontend template** (`/frontend`): A Next.js 15 application with:
- Landing page (hero, features, pricing, FAQ, footer) driven by `src/config/site.ts`
- Auth pages: login, register, forgot password, reset password, email verification
- Protected dashboard with profile, settings, billing, and team management pages
- Cookie-based auth using an axios client with automatic token refresh
- Interactive `/setup` page guiding first-time configuration

### Overall assessment

The project is architecturally sound and shows good security intent (httpOnly cookies, bcrypt, refresh token rotation, constant-time bcrypt comparison). However, there are **three issues that will prevent the generated projects from working correctly** (the name-replacement bug, the health-check mismatch, and hardcoded template strings left in generated output), plus several security gaps and unfinished features that should be resolved before a public release.

---

## Findings

### CRITICAL

---

#### CR-01: Template name-replacement patterns do not match template file contents — generated projects will have wrong package names

**File:** `c:/Users/ignac/Documents/programacion/ar-saas/src/generator.ts:135-138`

**Issue:**
`applyNameReplacements()` searches for the strings `ar-saas-backend`, `ar-saas-frontend`, and `ar-saas`. However, the actual template files contain `create-saas-ar-backend`, `create-saas-ar-frontend`, and `create-saas-ar`. As a result, the `package.json` `"name"` fields, the Swagger title, the auth layout heading, and the `<title>` in the root layout will never be renamed in a generated project — users will ship code that says `create-saas-ar` and `create-saas-ar-backend`.

Affected template occurrences:
- `templates/backend/package.json:2` — `"name": "create-saas-ar-backend"`
- `templates/frontend/package.json:2` — `"name": "create-saas-ar-frontend"`
- `templates/backend/src/main.ts:36` — `.setTitle('create-saas-ar API')`
- `templates/frontend/src/app/layout.tsx:11` — `title: 'create-saas-ar'`
- `templates/frontend/src/app/(auth)/layout.tsx:22` — `create-saas-ar`
- `templates/frontend/src/app/setup/page.tsx:142` — `create-saas-ar`

**Fix:** Change the replacement patterns in `generator.ts` to match the actual strings, or rename the tokens in the templates to match the existing patterns. The simplest approach is to update `generator.ts`:

```typescript
function applyNameReplacements(content: string, config: ProjectConfig): string {
  const { projectName, siteTitle, siteTagline, siteDescription, supportEmail } = config
  return content
    .replace(/create-saas-ar-backend/g, `${projectName}-backend`)
    .replace(/create-saas-ar-frontend/g, `${projectName}-frontend`)
    .replace(/create-saas-ar/g, projectName)   // must come after the more specific patterns
    .replace(/__SITE_NAME__/g, siteTitle)
    .replace(/__SITE_TAGLINE__/g, siteTagline)
    .replace(/__SITE_DESCRIPTION__/g, siteDescription)
    .replace(/__SUPPORT_EMAIL__/g, supportEmail)
}
```

---

#### CR-02: Railway health-check path will always 404 — Railway will continuously restart the container

**File:** `c:/Users/ignac/Documents/programacion/ar-saas/src/generator.ts:256`

**Issue:**
The Railway config hard-codes `healthcheckPath = "/api/health"`. The actual health endpoint in the generated backend is registered with `@Get()` on the root controller, so it lives at `/api` (the default `API_PREFIX`), not `/api/health`. Railway will hit `/api/health`, receive a 404, and cycle-restart the container indefinitely.

**Fix:** Either add a dedicated `/health` sub-path to the AppController:

```typescript
// templates/backend/src/app.controller.ts
@Get('health')
@ApiOperation({ summary: 'Health check' })
getHealth(): { status: string; timestamp: string } {
  return this.appService.getHealth();
}
```

…or correct the Railway TOML to point to `/api`:

```typescript
// src/generator.ts — buildRailwayConfig()
function buildRailwayConfig(): string {
  return `[build]
builder = "nixpacks"

[deploy]
startCommand = "npm run start:prod"
healthcheckPath = "/api"
healthcheckTimeout = 30
restartPolicyType = "on_failure"
`
}
```

---

#### CR-03: `WorkspaceTenantInterceptor` accepts an unauthenticated caller-supplied `x-workspace-id` header as authoritative — horizontal privilege escalation in generated apps

**File:** `c:/Users/ignac/Documents/programacion/ar-saas/templates/backend/src/common/interceptors/workspace-tenant.interceptor.ts:21-24`

**Issue:**
The interceptor checks the `x-workspace-id` HTTP header *before* it checks the authenticated user's JWT-derived workspaceId. Any unauthenticated or authenticated-but-unauthorized caller can send `x-workspace-id: <any_workspace_id>` and, if the interceptor reaches a protected route that trusts `request.workspaceId`, they can read or write another tenant's data. This undermines the entire multi-tenancy security model.

```typescript
// current — header is trusted before auth token
const headerWorkspaceId = request.headers['x-workspace-id'];
if (headerWorkspaceId && typeof headerWorkspaceId === 'string') {
  request.workspaceId = headerWorkspaceId;   // ← caller controls this
  return next.handle();
}
```

Note: The JWT strategy populates `request.user` only after `JwtAuthGuard` runs. The interceptor (a global interceptor) runs before per-route guards, so `request.user` is always `undefined` at interceptor time. This means the fallback to `request.user?.workspaceId` never actually fires on authenticated routes — the header branch always wins.

**Fix:** Remove the `x-workspace-id` header branch entirely, or restrict it to internal service-to-service calls validated by a shared secret. The workspaceId for all authenticated routes should come exclusively from the JWT payload. Move workspace extraction into the JWT strategy or a per-route guard that runs after authentication:

```typescript
// Recommended: strip the unauthenticated header branch
intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
  const request = context.switchToHttp().getRequest<TenantRequest>();
  const apiPrefix = process.env.API_PREFIX ?? 'api';

  // Public auth routes do not require a workspace
  if (request.path.startsWith(`/${apiPrefix}/auth/`)) {
    return next.handle();
  }

  // Only trust workspace from verified JWT payload (set by JwtAuthGuard)
  const workspaceId =
    typeof request.user?.workspaceId === 'string'
      ? request.user.workspaceId
      : undefined;

  if (!workspaceId) {
    throw new UnauthorizedException('Autenticación requerida.');
  }

  request.workspaceId = workspaceId;
  return next.handle();
}
```

---

#### CR-04: Registration creates a workspace with `ownerId: 'pending'` that is not cleaned up on failure — orphaned workspaces accumulate in the database

**File:** `c:/Users/ignac/Documents/programacion/ar-saas/templates/backend/src/modules/auth/auth.service.ts:40-53`

**Issue:**
`register()` creates a workspace first with `ownerId: 'pending'`, then creates the user, then patches the workspace. If `usersService.create()` throws (e.g., duplicate email, validation error), the workspace record remains in MongoDB with `ownerId: 'pending'` permanently — there is no cleanup or transaction. Over time this silently accumulates orphaned workspace documents.

```typescript
// Step 1 succeeds:
const workspace = await this.workspacesService.create('pending', dto.name);
// Step 2 throws ConflictException for duplicate email:
const user = await this.usersService.create({ ... });  // ← throws
// Step 3 is never reached; workspace is orphaned
await this.workspacesService.update(workspaceId, { ownerId: userId });
```

**Fix (option A — transactional):** Use a Mongoose session/transaction if the MongoDB deployment supports replica sets. (The `.env.example` already mentions replica set support.)

**Fix (option B — reorder):** Create the user first, then create the workspace. The user's uniqueness constraint runs before any workspace is created:

```typescript
async register(dto: RegisterDto): Promise<{ message: string }> {
  // Create user first — if email is duplicate, this throws before workspace creation
  const tempUser = await this.usersService.createUnverified({
    name: dto.name,
    email: dto.email,
    password: dto.password,
    workspaceId: '',
  });
  const userId = String(tempUser._id);

  const workspace = await this.workspacesService.create(userId, dto.name);
  const workspaceId = String(workspace._id);

  await this.usersService.update(userId, { workspaceId });
  // ... rest of flow
}
```

---

### HIGH

---

#### HI-01: Email verification tokens stored and queried in plaintext — anyone with read access to MongoDB can instantly compromise any unverified account

**File:** `c:/Users/ignac/Documents/programacion/ar-saas/templates/backend/src/modules/users/users.service.ts:53-58`
**File:** `c:/Users/ignac/Documents/programacion/ar-saas/templates/backend/src/modules/users/users.repository.ts:27-31`

**Issue:**
`emailVerificationToken` and `passwordResetToken` are stored as raw hex strings and looked up with a direct equality query. The refresh token, by contrast, is correctly bcrypt-hashed before storage (`users.service.ts:37-39`). A database breach, a MongoDB misconfiguration, a compromised backup, or a Mongoose query injection gives an attacker every pending verification link verbatim.

**Fix:** Hash these tokens before storing them (SHA-256 is sufficient — no need for bcrypt since they are already high-entropy random bytes), and compare hashes at lookup time:

```typescript
// In UsersService.setEmailVerificationToken:
const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
await this.usersRepository.update(userId, {
  emailVerificationToken: tokenHash,
  emailVerificationTokenExpiresAt: expiresAt,
});

// In UsersRepository.findByVerificationToken:
async findByVerificationToken(tokenHash: string): Promise<UserDocument | null> {
  return this.userModel
    .findOne({ emailVerificationToken: tokenHash })
    .select('+emailVerificationToken')
    .exec();
}

// Caller hashes before calling:
const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
const user = await this.usersService.findByVerificationToken(tokenHash);
```

Apply the same pattern to `passwordResetToken`.

---

#### HI-02: No rate limiting on authentication endpoints — credential stuffing and brute-force attacks are unrestricted

**File:** `c:/Users/ignac/Documents/programacion/ar-saas/templates/backend/src/app.module.ts`
**File:** `c:/Users/ignac/Documents/programacion/ar-saas/templates/backend/src/modules/auth/auth.controller.ts`

**Issue:**
The `.env.example` defines `THROTTLE_TTL` and `THROTTLE_LIMIT`, but `ThrottlerModule` is not imported in `AppModule` and no `@Throttle()` or `ThrottlerGuard` decorators appear anywhere in the codebase. The `/api/auth/login`, `/api/auth/register`, `/api/auth/forgot-password`, and `/api/auth/reset-password` endpoints are completely unprotected against automated attacks.

**Fix:** Install `@nestjs/throttler` and wire it up:

```typescript
// app.module.ts
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';

@Module({
  imports: [
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ([{
        ttl: config.get<number>('THROTTLE_TTL', 60) * 1000,
        limit: config.get<number>('THROTTLE_LIMIT', 100),
      }]),
    }),
    // ...
  ],
  providers: [
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    // ...
  ],
})

// auth.controller.ts — tighter limits on sensitive endpoints
@Post('login')
@Throttle({ default: { limit: 5, ttl: 60000 } })
async login(...) { ... }
```

---

#### HI-03: No HTTP security headers (no Helmet) — generated backend is missing standard browser-facing protections

**File:** `c:/Users/ignac/Documents/programacion/ar-saas/templates/backend/src/main.ts`

**Issue:**
`helmet` is not installed or used. The generated API is missing `X-Content-Type-Options`, `X-Frame-Options`, `Strict-Transport-Security`, `X-XSS-Protection`, and Content Security Policy headers. While a pure JSON API's exposure is limited, the absence of these headers is a red flag for any security review.

**Fix:**

```typescript
// main.ts
import helmet from 'helmet';
// ...
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(helmet());
  // ...
}
```

Add `helmet` to `package.json` dependencies:
```json
"helmet": "^8.0.0"
```

---

#### HI-04: `pnpm-workspace.yaml` files ship with placeholder values — `allowBuilds` fields are invalid and will cause pnpm install to fail

**File:** `c:/Users/ignac/Documents/programacion/ar-saas/templates/frontend/pnpm-workspace.yaml`
**File:** `c:/Users/ignac/Documents/programacion/ar-saas/pnpm-workspace.yaml`

**Issue:**
Both files contain:
```yaml
allowBuilds:
  sharp: set this to true or false
  unrs-resolver: set this to true or false
```
`"set this to true or false"` is a string, not a boolean. pnpm will either error on startup or silently ignore the directive, which defeats the purpose. This ships to every user who runs the CLI.

**Fix:** Set correct boolean values in the template, or remove the file if it is not needed for the generated project:

```yaml
# templates/frontend/pnpm-workspace.yaml
allowBuilds:
  sharp: true
  unrs-resolver: true
```

---

### MEDIUM

---

#### MD-01: `x-workspace-id` header is trusted before JWT on the interceptor (see CR-03), but even after fixing that, the interceptor runs globally before per-route guards — `request.user` is always undefined at interceptor time

**File:** `c:/Users/ignac/Documents/programacion/ar-saas/templates/backend/src/common/interceptors/workspace-tenant.interceptor.ts:27-33`

**Issue:** (Structural — complements CR-03)
In NestJS, global interceptors run before per-route guards. The interceptor code checks `request.user?.workspaceId`, but `request.user` is only populated by `JwtAuthGuard` which runs later. For authenticated routes, the user branch is never reached. The only path that ever sets `request.workspaceId` for a non-auth route is the dangerous header branch. After fixing CR-03 by removing the header branch, the interceptor will always throw `BadRequestException` on authenticated routes. The fix from CR-03 (described above) handles this correctly.

---

#### MD-02: `findByEmail` in `UsersRepository` unconditionally selects `+password +refreshToken` — sensitive fields are fetched even when only checking email existence

**File:** `c:/Users/ignac/Documents/programacion/ar-saas/templates/backend/src/modules/users/users.repository.ts:12-17`

**Issue:**
Every call to `findByEmail` fetches the hashed password and hashed refresh token from MongoDB, even in `forgotPassword()` where only the email's existence and verification status need to be checked. This unnecessarily exposes these fields in memory and across any logging or serialization that touches the returned document.

**Fix:** Create a `findByEmailWithPassword` variant for the login case, and a plain `findByEmail` that does not select secrets:

```typescript
async findByEmail(email: string): Promise<UserDocument | null> {
  return this.userModel.findOne({ email }).exec();
}

async findByEmailWithPassword(email: string): Promise<UserDocument | null> {
  return this.userModel.findOne({ email }).select('+password').exec();
}
```

Update `UsersService.login` to call `findByEmailWithPassword`.

---

#### MD-03: Workspace slug generation has an unbounded retry loop — a malicious or pathological name can spin indefinitely

**File:** `c:/Users/ignac/Documents/programacion/ar-saas/templates/backend/src/modules/workspaces/workspaces.service.ts:36-40`

**Issue:**
`generateUniqueSlug` loops with `while (await this.workspacesRepository.findBySlug(slug))`, incrementing a counter each time. There is no upper bound on the loop. If the database is under high load or if many similarly-named workspaces exist, this can execute an unbounded number of queries per registration request.

**Fix:** Add a maximum retry count:

```typescript
private async generateUniqueSlug(name: string): Promise<string> {
  const base = /* ... normalize ... */;
  let slug = base || 'workspace';
  let counter = 1;
  const MAX_ATTEMPTS = 20;
  while (counter <= MAX_ATTEMPTS && await this.workspacesRepository.findBySlug(slug)) {
    slug = `${base}-${counter++}`;
  }
  if (counter > MAX_ATTEMPTS) {
    slug = `${base}-${crypto.randomBytes(4).toString('hex')}`;
  }
  return slug;
}
```

---

#### MD-04: Profile, settings, and team-invite forms have no backend wiring — they silently succeed on submit

**Files:**
- `templates/frontend/src/app/(dashboard)/profile/page.tsx:51-63`
- `templates/frontend/src/app/(dashboard)/settings/page.tsx:47-49`
- `templates/frontend/src/app/(dashboard)/team/page.tsx:49-57`

**Issue:**
Three dashboard pages contain `// TODO: llamar a ...` comments followed by `console.log(...)` and a fake "success" state. A user who generates a project, builds it, and deploys it will have:
- A **Profile page** where "Save changes" does nothing to the database
- A **Settings page** where notification preferences are never persisted
- A **Team page** where "Invite" shows a success message but sends no invitation

This is not just unfinished UI — it creates a false impression to end users that their data was saved. These are `console.log` leaks into production builds too.

**Fix:** Either implement the API calls (the backend has the necessary user/workspace update endpoints) or clearly disable the submit buttons and display "Coming soon" banners so generated apps do not mislead their own users:

```typescript
// profile/page.tsx — replace the fake handler
async function onSaveProfile(data: ProfileForm) {
  await apiClient.patch('/api/users/me', data)
  setSaved(true)
  setTimeout(() => setSaved(false), 2000)
}
```

---

#### MD-05: `RESEND_API_KEY` and `APP_URL` are called with `getOrThrow` — startup crashes if not set, but the error message does not help the user

**File:** `c:/Users/ignac/Documents/programacion/ar-saas/templates/backend/src/modules/mail/mail.service.ts:27-31`

**Issue:**
This is minor compared to the rest, but the error thrown by NestJS's `getOrThrow` is `"Configuration key 'RESEND_API_KEY' does not exist"` — a terse message that is easy to miss in production logs. More critically, the `MailService` is a `@Global()` module and is initialized at startup, so a missing `RESEND_API_KEY` will crash the entire application even in contexts where email is not immediately needed.

**Recommendation:** Add a startup validation guard (either using `@nestjs/config`'s `validationSchema` or a `Joi`/`zod` schema) that checks all required env vars at startup and prints a human-readable list of what is missing:

```typescript
// app.module.ts
ConfigModule.forRoot({
  isGlobal: true,
  envFilePath: '.env',
  validationSchema: Joi.object({
    NODE_ENV: Joi.string().valid('development', 'production', 'test').default('development'),
    MONGODB_URI: Joi.string().required(),
    JWT_ACCESS_SECRET: Joi.string().required(),
    JWT_REFRESH_SECRET: Joi.string().required(),
    RESEND_API_KEY: Joi.string().required(),
    RESEND_FROM_EMAIL: Joi.string().email().required(),
    APP_URL: Joi.string().uri().required(),
  }),
})
```

---

#### MD-06: Root page unconditionally redirects to `/setup` — all generated production sites start at the setup wizard

**File:** `c:/Users/ignac/Documents/programacion/ar-saas/templates/frontend/src/app/page.tsx`

**Issue:**
```typescript
export default function RootPage() {
  redirect('/setup')
}
```
The setup page uses `localStorage.getItem('setup_dismissed')` to skip itself. This means every user who visits the root URL on a new device or in incognito mode is sent to the setup wizard — including the end users of the generated SaaS product. The setup page is developer-facing, not user-facing.

**Fix:** The root should redirect to `/login` or `/dashboard` (based on auth state). The setup page should only be reachable directly at `/setup` and should not be in the default user flow:

```typescript
// app/page.tsx
export default function RootPage() {
  redirect('/login')
}
```

---

### LOW

---

#### LO-01: `COOKIE_SECRET` is defined in `.env.example` but not validated — `cookieParser(undefined)` runs silently

**File:** `c:/Users/ignac/Documents/programacion/ar-saas/templates/backend/src/main.ts:14`

**Issue:**
`app.use(cookieParser(process.env.COOKIE_SECRET))` will call `cookieParser(undefined)` if the env var is not set, which is valid but means cookies are not signed. The `.env.example` lists this as an optional variable, so users may leave it empty. Combined with the missing Joi validation from MD-05, there is no warning.

**Fix:** Include `COOKIE_SECRET` in the Joi validation schema from MD-05 recommendation, or at minimum add a startup warning log when it is unset.

---

#### LO-02: `docker-compose.yml` (production deploy) exposes MongoDB port `27017` to the host — database is publicly accessible in a VPS deploy

**File:** `c:/Users/ignac/Documents/programacion/ar-saas/src/generator.ts:220-225`

**Issue:**
```yaml
  mongodb:
    ports:
      - "27017:27017"
```
This maps the MongoDB container port to the host's public interface. On cloud VPS providers (Hetzner, DigitalOcean, etc.) this makes MongoDB externally reachable unless a firewall rule blocks port 27017. A production Docker Compose should not expose MongoDB publicly.

**Fix:** Remove the `ports` mapping from the MongoDB service in the production compose, or bind to localhost only:

```typescript
// generator.ts — buildDockerCompose()
  mongodb:
    image: mongo:7
    # No ports exposed — only accessible from within the Docker network
    volumes:
      - mongodb_data:/data/db
    restart: unless-stopped
```

---

#### LO-03: `sameSite: 'lax'` for auth cookies — CSRF attacks are possible on non-idempotent same-site navigations in some browser configurations

**File:** `c:/Users/ignac/Documents/programacion/ar-saas/templates/backend/src/modules/auth/auth.controller.ts:129`

**Issue:**
`sameSite: 'lax'` allows cookies to be sent with top-level cross-site navigation GET requests. For an API that mutates state only on POST/PUT/DELETE (which is the case here), this is acceptable, but `sameSite: 'strict'` would be more conservative. More importantly, the JWT guard does not check the Origin or Referer header, meaning a CSRF attack via a form POST from another domain could succeed if the browser sends the cookie with cross-site POSTs (which `lax` does not prevent for POSTs).

**Recommendation:** Consider adding CSRF protection for production deployments or switch to `sameSite: 'strict'` for the refresh token cookie. Document the tradeoff.

---

#### LO-04: `findByEmail` in `UsersRepository` does not normalize the email before querying

**File:** `c:/Users/ignac/Documents/programacion/ar-saas/templates/backend/src/modules/users/users.repository.ts:12-17`

**Issue:**
The Mongoose `User` schema sets `lowercase: true` on the email field (via `@Prop({ lowercase: true })`), which normalizes during save. However, `findByEmail` queries with the raw input string. If `email` is passed in uppercase (e.g., `Juan@Example.COM`), MongoDB's case-sensitive default comparison will not find the lowercased stored value, and login or duplicate-detection will fail.

**Fix:**
```typescript
async findByEmail(email: string): Promise<UserDocument | null> {
  return this.userModel.findOne({ email: email.toLowerCase().trim() }).exec();
}
```

---

#### LO-05: `getInitials` in frontend components does not guard against empty string — crashes if `user.name` is an empty string

**Files:**
- `templates/frontend/src/components/dashboard/header.tsx:25-31`
- `templates/frontend/src/app/(dashboard)/profile/page.tsx:22-24`
- `templates/frontend/src/app/(dashboard)/team/page.tsx:29-31`

**Issue:**
```typescript
function getInitials(name: string) {
  return name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()
}
```
If `name` is `''`, `name.split(' ')` returns `['']`, and `n[0]` returns `undefined`. `.toUpperCase()` on `undefined` throws a runtime exception.

**Fix:**
```typescript
function getInitials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase() || 'U'
}
```

---

#### LO-06: Copyright year in site config is hardcoded to `2024`

**File:** `c:/Users/ignac/Documents/programacion/ar-saas/templates/frontend/src/config/site.ts:186`

**Issue:**
```typescript
copyright: '© 2024 __SITE_NAME__. Todos los derechos reservados.',
```
Projects generated in 2026 will display `© 2024` immediately.

**Fix:**
```typescript
copyright: `© ${new Date().getFullYear()} __SITE_NAME__. Todos los derechos reservados.`,
```
Or replace the year with a `__YEAR__` placeholder and emit the current year from the generator.

---

#### LO-07: `version: '3.8'` in generated `docker-compose.yml` is deprecated and produces a warning

**File:** `c:/Users/ignac/Documents/programacion/ar-saas/src/generator.ts:242`

**Issue:**
Docker Compose v2 ignores the `version` field and emits a deprecation warning. This is cosmetic but visible to every user who runs `docker compose up`.

**Fix:** Remove the `version:` key entirely:
```typescript
return `services:
${services.join('\n\n')}
${volumes}
`
```

---

### INFO

---

#### IN-01: `pnpm-workspace.yaml` in the CLI root has a broken placeholder value

**File:** `c:/Users/ignac/Documents/programacion/ar-saas/pnpm-workspace.yaml`

**Issue:**
```yaml
allowBuilds:
  esbuild: set this to true or false
```
Same problem as HI-04 but in the CLI repo itself. Should be `esbuild: true`.

---

#### IN-02: Multiple `console.log` calls in production template code

**Files:**
- `templates/frontend/src/app/(dashboard)/team/page.tsx:50`
- `templates/frontend/src/app/(dashboard)/settings/page.tsx:48`
- `templates/frontend/src/app/(dashboard)/profile/page.tsx:52, 63`

**Issue:**
Four `console.log` calls will appear in generated projects. In Next.js, these fire on the server and/or client depending on context, leaking user-entered form data (email addresses, profile data, preference keys) to application logs.

**Fix:** Remove all `console.log` calls from template source files. Use the `TODO` comment alone as a marker, or remove them entirely once the API calls are implemented (see MD-04).

---

#### IN-03: `auth layout` title is hardcoded to `create-saas-ar` (partially overlaps CR-01)

**File:** `c:/Users/ignac/Documents/programacion/ar-saas/templates/frontend/src/app/(auth)/layout.tsx:22-23`

**Issue:**
Even after fixing CR-01, the hardcoded string `"Tu SaaS listo para Argentina"` in the auth layout subtitle will remain unchanged regardless of what tagline the user enters in the CLI. There is no `__SITE_TAGLINE__` substitution token here.

**Fix:** Replace with a reference to `siteConfig`:
```tsx
import { siteConfig } from '@/config/site'
// ...
<h1 className="text-2xl font-bold tracking-tight">{siteConfig.name}</h1>
<p className="text-sm text-muted-foreground mt-1">{siteConfig.tagline}</p>
```

---

#### IN-04: `metadata` in root layout is hardcoded and will not be customized by the CLI substitution

**File:** `c:/Users/ignac/Documents/programacion/ar-saas/templates/frontend/src/app/layout.tsx:10-13`

**Issue:**
```typescript
export const metadata: Metadata = {
  title: 'create-saas-ar',
  description: 'Tu SaaS listo para Argentina',
}
```
Next.js `metadata` must be a static export and cannot read from `siteConfig` (a module) at the module level in the App Router. However, the description text is also not replaced by CLI tokens. After fixing CR-01, `title` will become `projectName` (the slug), but the `description` remains generic.

**Fix:** Replace with a `generateMetadata` function that references `siteConfig`:
```typescript
export async function generateMetadata(): Promise<Metadata> {
  return {
    title: siteConfig.name,
    description: siteConfig.description,
  }
}
```
Alternatively, set tokens in the layout.tsx file itself and rely on CLI text replacement.

---

#### IN-05: `js-cookie` is listed as a dependency in the frontend template but is never used

**File:** `c:/Users/ignac/Documents/programacion/ar-saas/templates/frontend/package.json:27`

**Issue:**
`"js-cookie": "^3.0.5"` and its type definitions `@types/js-cookie` are installed but nothing in the codebase imports from `js-cookie`. Cookie handling is done entirely server-side via `httpOnly` cookies on the backend. This is dead code in the dependency tree.

**Fix:** Remove from `package.json`:
```json
// Remove these lines:
"js-cookie": "^3.0.5",
"@types/js-cookie": "^3.0.6",
```

---

#### IN-06: `zod` is listed as a dependency but is not used — only `react-hook-form` validation rules are used

**File:** `c:/Users/ignac/Documents/programacion/ar-saas/templates/frontend/package.json:35`

**Issue:**
`"zod": "^3.24.1"` is in dependencies and `@hookform/resolvers` is also installed (which is typically used to bridge Zod schemas with react-hook-form), but no Zod schema is defined anywhere in the template. All form validation uses react-hook-form's `rules` prop directly.

**Fix:** Remove `zod` from `package.json` if it is not being used. If Zod validation is intended, replace the inline `rules` objects with proper Zod resolver schemas.

---

#### IN-07: Billing and team pages contain hardcoded placeholder data that ships to production

**Files:**
- `templates/frontend/src/app/(dashboard)/billing/page.tsx:12-16`
- `templates/frontend/src/app/(dashboard)/team/page.tsx:43`

**Issue:**
```typescript
const invoiceHistory = [
  { id: 'INV-001', date: '01/06/2024', amount: '$0', status: 'Pagado', plan: 'Free' },
  ...
]
```
Fake invoice records and a hardcoded "Plan Free · 1 de 3 usuarios" label will appear in every generated project's billing page.

**Fix:** Replace with empty state components or `// TODO` markers with empty arrays, and display appropriate "No hay facturas" messages.

---

## Summary Table

| ID | Severity | Area | Short description |
|----|----------|------|-------------------|
| CR-01 | CRITICAL | CLI / Generator | Name replacement patterns do not match template strings — `create-saas-ar` never renamed |
| CR-02 | CRITICAL | CLI / Generator | Railway health-check path `/api/health` does not exist — container restart loop |
| CR-03 | CRITICAL | Backend / Auth | `x-workspace-id` header trusted before JWT — horizontal privilege escalation |
| CR-04 | CRITICAL | Backend / Auth | Workspace created before user — orphaned records on duplicate email registration |
| HI-01 | HIGH | Backend / Auth | Email verification and password reset tokens stored plaintext in MongoDB |
| HI-02 | HIGH | Backend / Auth | No rate limiting on any endpoint — brute force / credential stuffing unrestricted |
| HI-03 | HIGH | Backend | No Helmet — standard security headers missing |
| HI-04 | HIGH | CLI / Frontend | `pnpm-workspace.yaml` ships with invalid placeholder boolean values |
| MD-01 | MEDIUM | Backend | Interceptor runs before guards — `request.user` always undefined at interceptor time |
| MD-02 | MEDIUM | Backend | `findByEmail` fetches password hash unnecessarily on non-login paths |
| MD-03 | MEDIUM | Backend | Unbounded slug-generation loop on workspace creation |
| MD-04 | MEDIUM | Frontend | Profile, settings, team-invite forms silently no-op — fake success state in production |
| MD-05 | MEDIUM | Backend | No startup validation of required env vars — terse crash with no guidance |
| MD-06 | MEDIUM | Frontend | Root page always redirects to `/setup` — end users see the developer setup wizard |
| LO-01 | LOW | Backend | `COOKIE_SECRET` unvalidated — unsigned cookies if env var missing |
| LO-02 | LOW | CLI / Docker | Production docker-compose exposes MongoDB port 27017 to host |
| LO-03 | LOW | Backend | `sameSite: lax` on auth cookies — no CSRF protection on POST endpoints |
| LO-04 | LOW | Backend | `findByEmail` does not lowercase input — case-mismatch login failures |
| LO-05 | LOW | Frontend | `getInitials('')` throws on empty name string |
| LO-06 | LOW | Frontend | Copyright year hardcoded to 2024 |
| LO-07 | LOW | CLI / Docker | Deprecated `version: '3.8'` in docker-compose.yml |
| IN-01 | INFO | CLI | `pnpm-workspace.yaml` in CLI root has invalid placeholder |
| IN-02 | INFO | Frontend | `console.log` in production template code leaks form data |
| IN-03 | INFO | Frontend | Auth layout subtitle hardcoded to `create-saas-ar` / generic tagline |
| IN-04 | INFO | Frontend | Root layout `metadata` hardcoded, not customized by CLI |
| IN-05 | INFO | Frontend | Unused `js-cookie` dependency |
| IN-06 | INFO | Frontend | Unused `zod` dependency |
| IN-07 | INFO | Frontend | Billing and team pages contain hardcoded placeholder data |

---

## Recommended Fix Priority

1. **CR-01** immediately — without this fix the CLI's core feature (name customization) does not work.
2. **CR-03 + MD-01** together — the tenant security fix requires restructuring the interceptor, and the two issues share a root cause.
3. **CR-04** before public release — orphaned data in MongoDB is a quiet operational problem.
4. **HI-01** before any email verification goes to real users — plaintext tokens in the DB are a data breach waiting to happen.
5. **HI-02 + HI-03** before production deploy — rate limiting and Helmet are table-stakes for a public API.
6. **CR-02** before Railway users hit the deploy button.
7. **MD-04 + MD-06** — these create confusing UX for everyone who generates a project.
8. **LO-02** before any VPS/Docker deployment.

---

_Reviewed: 2026-06-10_
_Reviewer: Claude (gsd-code-reviewer), deep mode_
