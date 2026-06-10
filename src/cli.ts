import inquirer from 'inquirer'
import chalk from 'chalk'

export interface ProjectConfig {
  projectName: string
  stack: 'backend-frontend' | 'backend' | 'frontend'
  modules: string[]
  deployTarget: 'railway' | 'flyio' | 'docker' | 'later'
}

const ALWAYS_INCLUDED = ['auth', 'multi-tenancy', 'mail']

interface RawAnswers {
  projectName: string
  stack: 'backend-frontend' | 'backend' | 'frontend'
  modules: string[]
  deployTarget: 'railway' | 'flyio' | 'docker' | 'later'
}

export async function runCli(): Promise<ProjectConfig> {
  console.log(chalk.bold('\n  ar-saas'))
  console.log(chalk.gray('  Backend NestJS + Frontend Next.js listos para producción\n'))

  const answers = await inquirer.prompt<RawAnswers>([
    {
      type: 'input',
      name: 'projectName',
      message: 'Nombre del proyecto:',
      default: 'my-saas',
      validate: (input: string) => {
        if (!/^[a-z0-9][a-z0-9-]{1,}$/.test(input)) {
          return 'Solo letras minúsculas, números y guiones (mínimo 2 caracteres)'
        }
        return true
      },
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
        { name: 'OAuth GitHub/Google + 2FA', value: 'auth-advanced' },
        { name: 'Notificaciones + Push Web', value: 'notifications' },
        { name: 'Invoices + Quotes + PDF', value: 'invoices' },
        { name: 'CRM + Kanban', value: 'crm' },
        { name: 'MercadoPago suscripciones', value: 'mercadopago' },
      ],
      filter: (selected: string[]) =>
        Array.from(new Set([...ALWAYS_INCLUDED, ...selected])),
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
  ])

  return {
    projectName: answers.projectName,
    stack: answers.stack,
    modules: answers.modules,
    deployTarget: answers.deployTarget,
  }
}
