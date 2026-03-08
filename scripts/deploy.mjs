/**
 * Deploy script – copies the dist/ folder contents to the Adobe CEP extensions directory.
 * Usage: node scripts/deploy.mjs
 *
 * This script copies files instead of using symlinks so it works without
 * administrator privileges and across different drive letters.
 */

import { cpSync, existsSync, mkdirSync, rmSync } from 'fs'
import { join } from 'path'
import { fileURLToPath } from 'url'

const EXTENSION_ID = 'com.dony.tools'

// Resolve paths
const __dirname = fileURLToPath(new URL('.', import.meta.url))
const projectRoot = join(__dirname, '..')
const distDir = join(projectRoot, 'dist')

// CEP extensions folder  (%APPDATA%/Adobe/CEP/extensions/<id>)
const appData = process.env.APPDATA
if (!appData) {
  console.error('ERROR: APPDATA environment variable not found. Are you on Windows?')
  process.exit(1)
}

const cepExtensionsDir = join(appData, 'Adobe', 'CEP', 'extensions')
const targetDir = join(cepExtensionsDir, EXTENSION_ID)

// Verify dist/ exists
if (!existsSync(distDir)) {
  console.error('ERROR: dist/ folder not found. Run "npm run build" first.')
  process.exit(1)
}

// Ensure CEP extensions dir exists
if (!existsSync(cepExtensionsDir)) {
  mkdirSync(cepExtensionsDir, { recursive: true })
}

// Remove old version if present
if (existsSync(targetDir)) {
  rmSync(targetDir, { recursive: true, force: true })
  console.log(`Removed old extension at: ${targetDir}`)
}

// Copy dist/ → target
cpSync(distDir, targetDir, { recursive: true })

console.log(`\nDeployed successfully!`)
console.log(`  From: ${distDir}`)
console.log(`  To:   ${targetDir}`)
console.log(`\nRestart After Effects to load the updated extension.`)
