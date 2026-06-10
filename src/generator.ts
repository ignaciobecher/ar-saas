import path from 'path'
import fs from 'fs'
import fse from 'fs-extra'
import chalk from 'chalk'
import ora from 'ora'
import type { ProjectConfig } from './cli'

const TEMPLATES_DIR = path.join(__dirname, '..', 'templates')
const TEXT_EXTENSIONS = new Set([
  '.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs',
  '.json', '.md', '.txt',
  '.env', '.example',
  '.yml', '.yaml',
  '.toml', '.ini',
  '.html', '.css',
  '.gitignore', '.npmignore', '.eslintrc',
  '.prettierrc', '.editorconfig',
  'Dockerfile', 'Makefile', 'Procfile',
])
const SKIP_DIRS = new Set(['.git', 'node_modules', 'dist', '.next', '.turbo', 'build'])

export async function generate(config: ProjectConfig): Promise<void> {
  const projectDir = path.join(process.cwd(), config.projectName)
  const spinner = ora()

  console.log()

  if (fs.existsSync(projectDir)) {
    console.error(chalk.red(`✖ El directorio "${config.projectName}" ya existe`))
    process.exit(1)
  }

  spinner.start(`Creando ${chalk.cyan(config.projectName)}...`)
  fs.mkdirSync(projectDir, { recursive: true })

  const hasBackend = config.stack === 'backend' || config.stack === 'backend-frontend'
  const hasFrontend = config.stack === 'frontend' || config.stack === 'backend-frontend'

  if (hasBackend) {
    spinner.text = 'Copiando backend...'
    const src = path.join(TEMPLATES_DIR, 'backend')
    const dest = path.join(projectDir, 'backend')

    if (!fs.existsSync(src) || fs.readdirSync(src).length === 0) {
      spinner.warn(chalk.yellow('Templates de backend vacíos — ejecutá npm run sync-templates antes de publicar'))
      fs.mkdirSync(dest, { recursive: true })
    } else {
      await fse.copy(src, dest)
      processDir(dest, config)
    }
  }

  if (hasFrontend) {
    spinner.text = 'Copiando frontend...'
    const src = path.join(TEMPLATES_DIR, 'frontend')
    const dest = path.join(projectDir, 'frontend')

    if (!fs.existsSync(src) || fs.readdirSync(src).length === 0) {
      spinner.warn(chalk.yellow('Templates de frontend vacíos — ejecutá npm run sync-templates antes de publicar'))
      fs.mkdirSync(dest, { recursive: true })
    } else {
      await fse.copy(src, dest)
      processDir(dest, config)
    }
  }

  spinner.text = 'Generando configuración de deploy...'
  generateDeployConfig(projectDir, config)

  spinner.text = 'Configurando variables de entorno...'
  setupEnvFiles(projectDir, config)

  spinner.succeed(chalk.green(`Proyecto ${chalk.bold(config.projectName)} creado`))
  console.log()
  console.log(chalk.cyan(`  Sitio: ${chalk.bold(config.siteTitle)}`))
  console.log(chalk.gray(`  "${config.siteTagline}"`))
  printNextSteps(config)
}

function processDir(dir: string, config: ProjectConfig): void {
  for (const file of collectTextFiles(dir)) {
    try {
      let content = fs.readFileSync(file, 'utf-8')
      content = applyNameReplacements(content, config)
      fs.writeFileSync(file, content, 'utf-8')
    } catch {
      // skip unreadable or binary files
    }
  }
}

function collectTextFiles(dir: string): string[] {
  const result: string[] = []

  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name)

    if (entry.isDirectory()) {
      if (!SKIP_DIRS.has(entry.name)) {
        result.push(...collectTextFiles(fullPath))
      }
    } else {
      const ext = path.extname(entry.name)
      if (TEXT_EXTENSIONS.has(ext) || TEXT_EXTENSIONS.has(entry.name) || entry.name.startsWith('.')) {
        result.push(fullPath)
      }
    }
  }

  return result
}

function applyNameReplacements(content: string, config: ProjectConfig): string {
  const { projectName, siteTitle, siteTagline, siteDescription, supportEmail } = config
  return content
    .replace(/ar-saas-backend/g, `${projectName}-backend`)
    .replace(/ar-saas-frontend/g, `${projectName}-frontend`)
    .replace(/ar-saas/g, projectName)
    .replace(/__SITE_NAME__/g, siteTitle)
    .replace(/__SITE_TAGLINE__/g, siteTagline)
    .replace(/__SITE_DESCRIPTION__/g, siteDescription)
    .replace(/__SUPPORT_EMAIL__/g, supportEmail)
}

function generateDeployConfig(projectDir: string, config: ProjectConfig): void {
  if (config.deployTarget === 'later') return

  if (config.deployTarget === 'docker') {
    fs.writeFileSync(
      path.join(projectDir, 'docker-compose.yml'),
      buildDockerCompose(config),
      'utf-8',
    )
  }

  if (config.deployTarget === 'railway') {
    fs.writeFileSync(
      path.join(projectDir, 'railway.toml'),
      buildRailwayConfig(),
      'utf-8',
    )
  }

  if (config.deployTarget === 'flyio') {
    fs.writeFileSync(
      path.join(projectDir, 'fly.toml'),
      buildFlyConfig(config),
      'utf-8',
    )
  }
}

function buildDockerCompose(config: ProjectConfig): string {
  const hasBackend = config.stack === 'backend' || config.stack === 'backend-frontend'
  const hasFrontend = config.stack === 'frontend' || config.stack === 'backend-frontend'
  const services: string[] = []

  if (hasBackend) {
    services.push(`  backend:
    build: ./backend
    ports:
      - "3000:3000"
    env_file:
      - ./backend/.env
    depends_on:
      - mongodb
    restart: unless-stopped

  mongodb:
    image: mongo:7
    ports:
      - "27017:27017"
    volumes:
      - mongodb_data:/data/db
    restart: unless-stopped`)
  }

  if (hasFrontend) {
    services.push(`  frontend:
    build: ./frontend
    ports:
      - "3001:3000"
    env_file:
      - ./frontend/.env.local
    environment:
      - NEXT_PUBLIC_API_URL=http://backend:3000
    ${hasBackend ? 'depends_on:\n      - backend\n    ' : ''}restart: unless-stopped`)
  }

  const volumes = hasBackend ? '\nvolumes:\n  mongodb_data:' : ''

  return `version: '3.8'

services:
${services.join('\n\n')}
${volumes}
`
}

function buildRailwayConfig(): string {
  return `[build]
builder = "nixpacks"

[deploy]
startCommand = "npm run start:prod"
healthcheckPath = "/api/health"
healthcheckTimeout = 30
restartPolicyType = "on_failure"
`
}

function buildFlyConfig(config: ProjectConfig): string {
  return `app = "${config.projectName}"
primary_region = "gru"

[build]

[http_service]
  internal_port = 3000
  force_https = true
  auto_stop_machines = true
  auto_start_machines = true
  min_machines_running = 0

[[vm]]
  memory = "256mb"
  cpu_kind = "shared"
  cpus = 1
`
}

function setupEnvFiles(projectDir: string, config: ProjectConfig): void {
  const hasBackend = config.stack === 'backend' || config.stack === 'backend-frontend'
  const hasFrontend = config.stack === 'frontend' || config.stack === 'backend-frontend'

  if (hasBackend) {
    const example = path.join(projectDir, 'backend', '.env.example')
    const dest = path.join(projectDir, 'backend', '.env')
    if (fs.existsSync(example) && !fs.existsSync(dest)) {
      fse.copySync(example, dest)
    }
  }

  if (hasFrontend) {
    const example = path.join(projectDir, 'frontend', '.env.local.example')
    const dest = path.join(projectDir, 'frontend', '.env.local')
    if (fs.existsSync(example) && !fs.existsSync(dest)) {
      fse.copySync(example, dest)
    }
  }
}

function printNextSteps(config: ProjectConfig): void {
  const hasBackend = config.stack === 'backend' || config.stack === 'backend-frontend'
  const hasFrontend = config.stack === 'frontend' || config.stack === 'backend-frontend'

  console.log()
  console.log(chalk.bold('Próximos pasos:'))

  if (hasBackend) {
    console.log()
    console.log(chalk.cyan(`  cd ${config.projectName}/backend`))
    console.log(chalk.gray('  # Completar las variables en .env'))
    console.log(chalk.cyan('  npm install'))
    console.log(chalk.cyan('  npm run start:dev'))
  }

  if (hasFrontend) {
    console.log()
    console.log(chalk.cyan(`  cd ${config.projectName}/frontend`))
    console.log(chalk.gray('  # Completar .env.local con la URL del backend'))
    console.log(chalk.gray('  # Personalizar contenido en src/config/site.ts'))
    console.log(chalk.cyan('  npm install'))
    console.log(chalk.cyan('  npm run dev'))
  }

  console.log()
  console.log(chalk.gray('  Documentación: https://ar-saas.dev/docs'))
  console.log()
}
