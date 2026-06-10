#!/usr/bin/env node

import { runCli } from './cli'
import { generate } from './generator'

async function main(): Promise<void> {
  const config = await runCli()
  await generate(config)
}

main().catch((error: Error) => {
  console.error(error.message)
  process.exit(1)
})
