#!/usr/bin/env node

import { runCli } from './cli'
import { generate } from './generator'

async function main(): Promise<void> {
  const defaultName = process.argv[2]
  const config = await runCli(defaultName)
  await generate(config)
}

main().catch((error: Error) => {
  console.error(error.message)
  process.exit(1)
})
