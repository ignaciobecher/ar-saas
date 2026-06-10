import inquirer from 'inquirer'
import chalk from 'chalk'

export interface ProjectConfig {
  projectName: string
  siteTitle: string
  siteTagline: string
  siteDescription: string
  supportEmail: string
  stack: 'backend-frontend' | 'backend' | 'frontend'
  modules: string[]
  deployTarget: 'railway' | 'flyio' | 'docker' | 'later'
  mongoMode?: 'docker' | 'remote'
  mongoUri?: string
}

export async function runCli(defaultName?: string): Promise<ProjectConfig> {
  console.log(chalk.bold('\n  ar-saas'))
  console.log(chalk.gray('  Backend NestJS + Frontend Next.js listos para producción\n'))

  const answers = await inquirer.prompt<ProjectConfig>([
    {
      type: 'input',
      name: 'projectName',
      message: 'Nombre del proyecto (slug):',
      default: defaultName ?? 'my-saas',
      validate: (input: string) => {
        if (!/^[a-z0-9][a-z0-9-]{1,}$/.test(input)) {
          return 'Solo letras minúsculas, números y guiones (mínimo 2 caracteres)'
        }
        return true
      },
    },
    {
      type: 'input',
      name: 'siteTitle',
      message: 'Nombre del SaaS (cómo se muestra a los usuarios):',
      default: (answers: Partial<ProjectConfig>) =>
        answers.projectName
          ? answers.projectName
              .split('-')
              .map((w: string) => w.charAt(0).toUpperCase() + w.slice(1))
              .join(' ')
          : 'Mi SaaS',
      validate: (input: string) =>
        input.trim().length >= 2 || 'El nombre debe tener al menos 2 caracteres',
    },
    {
      type: 'input',
      name: 'siteTagline',
      message: 'Tagline (frase corta que describe el producto):',
      default: 'La plataforma que tu equipo necesita',
      validate: (input: string) =>
        input.trim().length >= 5 || 'El tagline debe tener al menos 5 caracteres',
    },
    {
      type: 'input',
      name: 'siteDescription',
      message: 'Descripción (una o dos oraciones para la landing):',
      default: 'Automatizá tu negocio, escalá tu equipo y enfocate en lo que importa. Todo desde una sola plataforma.',
    },
    {
      type: 'input',
      name: 'supportEmail',
      message: 'Email de soporte / contacto:',
      default: (answers: Partial<ProjectConfig>) =>
        `hola@${answers.projectName ?? 'mi-saas'}.com`,
      validate: (input: string) =>
        /\S+@\S+\.\S+/.test(input) || 'Ingresá un email válido',
    },
    {
      type: 'list',
      name: 'stack',
      message: '¿Qué querés generar?',
      choices: [
        { name: 'Backend + Frontend', value: 'backend-frontend' },
        { name: 'Solo Backend (NestJS)', value: 'backend' },
        { name: 'Solo Frontend (Next.js)', value: 'frontend' },
      ],
    },
    {
      type: 'checkbox',
      name: 'modules',
      message: 'Módulos adicionales:',
      choices: [
        { name: 'Notificaciones + Push Web', value: 'notifications' },
        { name: 'Invoices + Quotes + PDF', value: 'invoices' },
        { name: 'CRM + Kanban', value: 'crm' },
      ],
    },
    {
      type: 'list',
      name: 'deployTarget',
      message: '¿Dónde lo vas a deployar?',
      choices: [
        { name: 'Railway', value: 'railway' },
        { name: 'Fly.io', value: 'flyio' },
        { name: 'Docker', value: 'docker' },
        { name: 'Después', value: 'later' },
      ],
    },
    {
      type: 'list',
      name: 'mongoMode',
      message: '¿Dónde va a estar tu base de datos MongoDB?',
      when: (answers: Partial<ProjectConfig>) =>
        answers.stack === 'backend' || answers.stack === 'backend-frontend',
      choices: [
        { name: 'Local con Docker (recomendado para desarrollo)', value: 'docker' },
        { name: 'URL remota (MongoDB Atlas u otro)', value: 'remote' },
      ],
    },
    {
      type: 'input',
      name: 'mongoUri',
      message: 'Ingresá la URI de MongoDB:',
      when: (answers: Partial<ProjectConfig>) => answers.mongoMode === 'remote',
      validate: (input: string) =>
        input.startsWith('mongodb://') || input.startsWith('mongodb+srv://')
          ? true
          : 'La URI debe comenzar con mongodb:// o mongodb+srv://',
    },
  ])

  return answers
}
