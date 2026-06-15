import path from 'path'
import fs from 'fs'
import fse from 'fs-extra'
import chalk from 'chalk'
import ora from 'ora'

const CLI_ROOT = path.join(__dirname, '..')
const TEMPLATES_DIR = path.join(CLI_ROOT, 'templates')

const BACKEND_SRC = path.join(CLI_ROOT, 'packages', 'backend')
const FRONTEND_SRC = path.join(CLI_ROOT, 'packages', 'frontend')

const EXCLUDE = new Set([
  'node_modules',
  '.git',
  'dist',
  '.env',
  '.next',
  'build',
  '.turbo',
  '.vercel',
  'coverage',
  // archivos internos de planificación, no van en el template
  '.ai-docs',
  '.claude',
  '.opencode',
  'ROADMAP.md',
])

async function syncRepo(src: string, dest: string, label: string): Promise<void> {
  const spinner = ora(`Sincronizando ${label}...`).start()

  if (!fs.existsSync(src)) {
    spinner.fail(chalk.red(`No se encontró el repo en ${src}`))
    return
  }

  await fse.emptyDir(dest)

  await fse.copy(src, dest, {
    filter: (srcPath: string) => {
      const relative = path.relative(src, srcPath)
      if (relative === '') return true
      const parts = relative.split(path.sep)
      return !parts.some((part) => EXCLUDE.has(part) || part === '.env')
    },
  })

  const count = countFiles(dest)
  spinner.succeed(chalk.green(`${label} sincronizado → templates/${path.basename(dest)} (${count} archivos)`))
}

function countFiles(dir: string): number {
  let count = 0
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      count += countFiles(path.join(dir, entry.name))
    } else {
      count++
    }
  }
  return count
}

async function main(): Promise<void> {
  console.log(chalk.bold.cyan('\n  sync-templates\n'))

  await syncRepo(BACKEND_SRC, path.join(TEMPLATES_DIR, 'backend'), 'Backend')
  await syncRepo(FRONTEND_SRC, path.join(TEMPLATES_DIR, 'frontend'), 'Frontend')

  console.log()
  console.log(chalk.green('  ✅ Templates sincronizados'))
  console.log(chalk.gray('     Ahora podés ejecutar: npm run build && npm pack\n'))
}

main().catch((error: Error) => {
  console.error(chalk.red('\n  Error:'), error.message)
  process.exit(1)
})
