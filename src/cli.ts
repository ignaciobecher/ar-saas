import inquirer from 'inquirer'
import chalk from 'chalk'

export interface ProjectConfig {
  projectName: string
  stack: 'backend-frontend' | 'backend' | 'frontend'
  modules: string[]
  deployTarget: 'railway' | 'flyio' | 'docker' | 'later'
}

export async function runCli(defaultName?: string): Promise<ProjectConfig> {
  console.log(chalk.bold('\n  ar-saas'))
  console.log(chalk.gray('  Backend NestJS + Frontend Next.js listos para producción\n'))

  const answers = await inquirer.prompt<ProjectConfig>([
    {
      type: 'input',
      name: 'projectName',
      message: 'Nombre del proyecto:',
      default: defaultName ?? 'my-saas',
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
  ])

  return answers
}
