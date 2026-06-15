'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

const BACKEND_REQUIRED = [
  {
    key: 'MONGODB_URI',
    example: 'mongodb://localhost:27017/mi-saas',
    desc: 'URI de conexión a MongoDB. Para desarrollo local instalar MongoDB o usar Atlas.',
  },
  {
    key: 'JWT_ACCESS_SECRET',
    example: '$(openssl rand -hex 64)',
    desc: 'Secreto para firmar access tokens. Generar con OpenSSL.',
  },
  {
    key: 'JWT_REFRESH_SECRET',
    example: '$(openssl rand -hex 64)',
    desc: 'Secreto para firmar refresh tokens. Usar un valor distinto al anterior.',
  },
  {
    key: 'RESEND_API_KEY',
    example: 're_xxxxxxxxxxxxxxxx',
    desc: 'API Key de Resend para enviar emails. Crear cuenta en resend.com.',
  },
  {
    key: 'RESEND_FROM_EMAIL',
    example: 'noreply@tudominio.com',
    desc: 'Email remitente. Debe estar verificado en tu cuenta de Resend.',
  },
  {
    key: 'APP_URL',
    example: 'http://localhost:3000',
    desc: 'URL del frontend. Se usa en los links de los emails de verificación y reset.',
  },
  {
    key: 'CORS_ORIGINS',
    example: 'http://localhost:3000',
    desc: 'URL del frontend separada por coma. Debe coincidir con APP_URL.',
  },
]

const BACKEND_OPTIONAL = [
  { key: 'PORT', example: '3001', desc: 'Puerto del servidor (default: 3001).' },
  { key: 'JWT_ACCESS_EXPIRES_IN', example: '15m', desc: 'Duración del access token (default: 15m).' },
  { key: 'JWT_REFRESH_EXPIRES_IN', example: '7d', desc: 'Duración del refresh token (default: 7d).' },
  { key: 'RESEND_FROM_NAME', example: '"Mi SaaS"', desc: 'Nombre del remitente que ven los destinatarios.' },
  { key: 'COOKIE_SECRET', example: '$(openssl rand -hex 32)', desc: 'Secreto para firmar cookies.' },
]

const FRONTEND_REQUIRED = [
  {
    key: 'NEXT_PUBLIC_API_URL',
    example: 'http://localhost:3001',
    desc: 'URL base del backend. Debe coincidir con el PORT del backend.',
  },
]

function EnvVar({ varKey, example, desc }: { varKey: string; example: string; desc: string }) {
  const [copied, setCopied] = useState(false)

  const copy = () => {
    navigator.clipboard.writeText(`${varKey}=${example}`)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div className="py-3 border-b border-zinc-100 last:border-0">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <code className="text-sm font-mono font-semibold text-zinc-900">{varKey}</code>
          </div>
          <p className="text-xs text-zinc-500 leading-relaxed">{desc}</p>
          <code className="text-xs text-zinc-400 font-mono">{example}</code>
        </div>
        <button
          onClick={copy}
          className="shrink-0 text-xs text-zinc-400 hover:text-zinc-700 transition-colors px-2 py-1 rounded border border-zinc-200 hover:border-zinc-300"
        >
          {copied ? '✓' : 'copiar'}
        </button>
      </div>
    </div>
  )
}

function CodeBlock({ children }: { children: string }) {
  const [copied, setCopied] = useState(false)

  const copy = () => {
    navigator.clipboard.writeText(children)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div className="relative group">
      <pre className="bg-zinc-950 text-zinc-100 rounded-lg px-4 py-3 text-sm font-mono overflow-x-auto">
        {children}
      </pre>
      <button
        onClick={copy}
        className="absolute top-2 right-2 text-xs text-zinc-500 hover:text-zinc-300 transition-colors bg-zinc-800 px-2 py-0.5 rounded"
      >
        {copied ? '✓' : 'copiar'}
      </button>
    </div>
  )
}

export default function SetupPage() {
  const router = useRouter()

  const handleDone = () => {
    localStorage.setItem('setup_dismissed', 'true')
    router.push('/landing')
  }

  const handleSkip = () => {
    router.push('/login')
  }

  return (
    <div className="min-h-screen bg-zinc-50">
      <div className="max-w-3xl mx-auto px-4 py-12">

        {/* Header */}
        <div className="mb-10">
          <div className="inline-flex items-center gap-2 bg-zinc-900 text-white text-xs font-mono px-3 py-1.5 rounded-full mb-4">
            <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
            ar-saas
          </div>
          <h1 className="text-3xl font-bold text-zinc-900 mb-2">
            Tu proyecto está listo
          </h1>
          <p className="text-zinc-500 text-lg">
            Completá la configuración antes de empezar a desarrollar.
            Son 5 minutos y después tenés todo andando.
          </p>
        </div>

        {/* MongoDB */}
        <section className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-7 h-7 rounded-full bg-zinc-900 text-white text-xs font-bold flex items-center justify-center">1</div>
            <h2 className="text-lg font-semibold text-zinc-900">Levantar MongoDB</h2>
          </div>

          <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden mb-3">
            <div className="px-4 py-2.5 bg-zinc-50 border-b border-zinc-100 flex items-center gap-2">
              <span className="text-xs font-semibold text-zinc-700">Opción A — Docker</span>
              <span className="text-xs bg-zinc-900 text-white px-1.5 py-0.5 rounded font-mono">recomendado</span>
            </div>
            <div className="p-4 space-y-3">
              <p className="text-xs text-zinc-500">El proyecto ya incluye un <code className="bg-zinc-100 px-1 py-0.5 rounded">docker-compose.dev.yml</code> en la raíz. Solo necesitás tener Docker instalado.</p>
              <CodeBlock>{`# Desde la raíz del proyecto (no desde /backend)
docker compose -f docker-compose.dev.yml up -d

# Verificar que está corriendo
docker ps`}</CodeBlock>
              <p className="text-xs text-zinc-400">MongoDB queda disponible en <code className="bg-zinc-100 px-1 py-0.5 rounded">mongodb://localhost:27017</code>. Los datos persisten en un volumen de Docker.</p>
            </div>
          </div>

          <details className="bg-white border border-zinc-200 rounded-xl overflow-hidden mb-3">
            <summary className="px-4 py-2.5 bg-zinc-50 border-b border-zinc-100 cursor-pointer text-xs font-semibold text-zinc-500 uppercase tracking-wider hover:text-zinc-700">
              Opción B — MongoDB Atlas (cloud gratuito)
            </summary>
            <div className="p-4 space-y-2">
              <ol className="text-xs text-zinc-600 space-y-1.5 list-none">
                {[
                  'Crear cuenta gratis en mongodb.com/atlas',
                  'Crear un cluster gratuito (M0 Free Tier)',
                  'En "Database Access" → crear un usuario con contraseña',
                  'En "Network Access" → agregar tu IP (o 0.0.0.0/0 para dev)',
                  'En "Connect" → elegir "Connect your application" → copiar la URI',
                  'Reemplazar <password> en la URI con la contraseña del paso 3',
                  'Pegar la URI completa en MONGODB_URI del .env del backend',
                ].map((step, i) => (
                  <li key={i} className="flex gap-2">
                    <span className="shrink-0 w-4 h-4 rounded-full bg-zinc-200 text-zinc-600 flex items-center justify-center font-bold text-[10px]">{i + 1}</span>
                    {step}
                  </li>
                ))}
              </ol>
            </div>
          </details>

          <details className="bg-white border border-zinc-200 rounded-xl overflow-hidden">
            <summary className="px-4 py-2.5 bg-zinc-50 border-b border-zinc-100 cursor-pointer text-xs font-semibold text-zinc-500 uppercase tracking-wider hover:text-zinc-700">
              Opción C — MongoDB local sin Docker
            </summary>
            <div className="p-4">
              <p className="text-xs text-zinc-500">
                Instalá MongoDB Community Edition siguiendo las instrucciones oficiales para tu sistema operativo:{' '}
                <span className="font-mono text-zinc-700">docs.mongodb.com/manual/installation</span>
              </p>
            </div>
          </details>
        </section>

        {/* Backend */}
        <section className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-7 h-7 rounded-full bg-zinc-900 text-white text-xs font-bold flex items-center justify-center">2</div>
            <h2 className="text-lg font-semibold text-zinc-900">Backend — configurar <code className="text-sm bg-zinc-100 px-1.5 py-0.5 rounded">.env</code></h2>
          </div>

          <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden mb-4">
            <div className="px-4 py-2.5 bg-zinc-50 border-b border-zinc-100">
              <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Variables requeridas</span>
            </div>
            <div className="px-4">
              {BACKEND_REQUIRED.map((v) => (
                <EnvVar key={v.key} varKey={v.key} example={v.example} desc={v.desc} />
              ))}
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-4">
            <p className="text-xs font-semibold text-amber-800 mb-2">Generar JWT secrets</p>
            <p className="text-xs text-amber-700 mb-2">Usá cualquiera de estos comandos para generar valores seguros para <code className="bg-amber-100 px-1 rounded">JWT_ACCESS_SECRET</code> y <code className="bg-amber-100 px-1 rounded">JWT_REFRESH_SECRET</code>. Usá un valor distinto para cada uno.</p>
            <CodeBlock>{`# Con Node.js (disponible si tenés Node instalado)
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Con openssl
openssl rand -hex 64`}</CodeBlock>
          </div>

          <details className="bg-white border border-zinc-200 rounded-xl overflow-hidden mb-4">
            <summary className="px-4 py-2.5 bg-zinc-50 border-b border-zinc-100 cursor-pointer text-xs font-semibold text-zinc-500 uppercase tracking-wider hover:text-zinc-700">
              Variables opcionales
            </summary>
            <div className="px-4">
              {BACKEND_OPTIONAL.map((v) => (
                <EnvVar key={v.key} varKey={v.key} example={v.example} desc={v.desc} />
              ))}
            </div>
          </details>

          <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden mb-4">
            <div className="px-4 py-2.5 bg-zinc-50 border-b border-zinc-100">
              <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Configurar Resend (emails)</span>
            </div>
            <div className="p-4 space-y-2">
              <ol className="text-xs text-zinc-600 space-y-1.5 list-none">
                {[
                  'Crear cuenta gratis en resend.com (3 000 emails/mes gratis)',
                  'Ir a API Keys → "Create API Key" → copiar la key',
                  'Pegar en RESEND_API_KEY del .env',
                  'Para dev podés usar el dominio sandbox de Resend (solo envía a tu propio email)',
                  'Para prod: agregar y verificar tu dominio en "Domains"',
                ].map((step, i) => (
                  <li key={i} className="flex gap-2">
                    <span className="shrink-0 w-4 h-4 rounded-full bg-zinc-200 text-zinc-600 flex items-center justify-center font-bold text-[10px]">{i + 1}</span>
                    {step}
                  </li>
                ))}
              </ol>
            </div>
          </div>

          <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden">
            <div className="px-4 py-2.5 bg-zinc-50 border-b border-zinc-100">
              <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Iniciar el backend</span>
            </div>
            <div className="p-4 space-y-3">
              <CodeBlock>{`cd backend
# .env ya fue copiado automáticamente desde .env.example
# Completar las variables faltantes (JWT secrets, Resend key)
npm install
npm run start:dev`}</CodeBlock>
              <p className="text-xs text-zinc-400">
                El servidor levanta en <code className="bg-zinc-100 px-1 py-0.5 rounded">http://localhost:3001</code>.
                Swagger en <code className="bg-zinc-100 px-1 py-0.5 rounded">http://localhost:3001/api/docs</code>.
              </p>
            </div>
          </div>
        </section>

        {/* Frontend */}
        <section className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-7 h-7 rounded-full bg-zinc-900 text-white text-xs font-bold flex items-center justify-center">3</div>
            <h2 className="text-lg font-semibold text-zinc-900">Frontend — configurar <code className="text-sm bg-zinc-100 px-1.5 py-0.5 rounded">.env.local</code></h2>
          </div>

          <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden mb-4">
            <div className="px-4 py-2.5 bg-zinc-50 border-b border-zinc-100">
              <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Variables requeridas</span>
            </div>
            <div className="px-4">
              {FRONTEND_REQUIRED.map((v) => (
                <EnvVar key={v.key} varKey={v.key} example={v.example} desc={v.desc} />
              ))}
            </div>
          </div>

          <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden">
            <div className="px-4 py-2.5 bg-zinc-50 border-b border-zinc-100">
              <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Iniciar el frontend</span>
            </div>
            <div className="p-4 space-y-3">
              <CodeBlock>{`cd frontend
# .env.local ya fue copiado automáticamente desde .env.local.example
# Ajustar NEXT_PUBLIC_API_URL si cambiaste el PORT del backend
npm install
npm run dev`}</CodeBlock>
              <p className="text-xs text-zinc-400">
                El frontend levanta en <code className="bg-zinc-100 px-1 py-0.5 rounded">http://localhost:3000</code> (puerto default de Next.js).
              </p>
            </div>
          </div>
        </section>

        {/* Verificación */}
        <section className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-7 h-7 rounded-full bg-zinc-900 text-white text-xs font-bold flex items-center justify-center">4</div>
            <h2 className="text-lg font-semibold text-zinc-900">Verificar que todo funciona</h2>
          </div>

          <div className="bg-white border border-zinc-200 rounded-xl p-4 space-y-2">
            {[
              { label: 'MongoDB corriendo', hint: 'docker ps muestra el contenedor activo, o verificá que el proceso mongod esté levantado. Si el backend da ECONNREFUSED, MongoDB no está corriendo.' },
              { label: 'Backend corre sin errores', hint: 'npm run start:dev no muestra errores rojos. Errores de JWT_SECRET faltante o MONGODB_URI indican variables sin completar.' },
              { label: 'Swagger disponible', hint: 'http://localhost:3001/api/docs carga correctamente y lista los endpoints de auth.' },
              { label: 'MongoDB conectado', hint: 'El log del backend dice "Connected to MongoDB successfully". Si no aparece, verificá MONGODB_URI en backend/.env.' },
              { label: 'Registro funciona', hint: 'Ir a http://localhost:3000/register y crear una cuenta. Si falla con CORS, verificar que CORS_ORIGINS en backend/.env incluya http://localhost:3000.' },
              { label: 'Email de verificación llega', hint: 'Revisar spam si no aparece en inbox. Si no llega, verificar RESEND_API_KEY y RESEND_FROM_EMAIL en backend/.env.' },
            ].map((item) => (
              <div key={item.label} className="flex items-start gap-3 py-1.5">
                <div className="w-4 h-4 rounded border-2 border-zinc-300 mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm text-zinc-800 font-medium">{item.label}</p>
                  <p className="text-xs text-zinc-400">{item.hint}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <div className="flex items-center justify-between">
          <button
            onClick={handleSkip}
            className="text-xs text-zinc-400 hover:text-zinc-600 transition-colors"
          >
            Saltar →
          </button>
          <button
            onClick={handleDone}
            className="bg-zinc-900 hover:bg-zinc-700 text-white font-medium text-sm px-6 py-2.5 rounded-lg transition-colors"
          >
            Todo listo, ver la app →
          </button>
        </div>

      </div>
    </div>
  )
}
