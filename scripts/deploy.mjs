/**
 * Deploy script – copies the dist/ folder contents to the Adobe CEP extensions directory.
 * Usage: node scripts/deploy.mjs
 *
 * This script copies files instead of using symlinks so it works without
 * administrator privileges and across different drive letters.
 */

import { cpSync, existsSync, mkdirSync, readdirSync, readFileSync, rmSync } from 'fs'
import { join } from 'path'
import { fileURLToPath } from 'url'

const EXTENSION_ID = 'com.donyaep.DonyTools'

// Installs left over from the pre-4.0.0 bundle id. CEP loads every folder it
// finds, so a stale copy registers a second "dony Tools" panel and both halves
// fight over the same $.global.com_dony_tools namespace.
const LEGACY_EXTENSION_IDS = ['com.dony.tools']

/**
 * Folders in a CEP extensions directory whose manifest declares one of `ids`.
 * The folder name is free-form — CEP reads the bundle id out of the manifest —
 * so matching on the directory name alone misses installs like
 * `dony-tools-v3.0.0`.
 */
function findInstalls(cepDir, ids) {
  if (!existsSync(cepDir)) return []
  return readdirSync(cepDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => {
      const manifest = join(cepDir, entry.name, 'CSXS', 'manifest.xml')
      if (!existsSync(manifest)) return null
      const bundleId = readFileSync(manifest, 'utf-8').match(/ExtensionBundleId="([^"]+)"/)?.[1]
      return bundleId && ids.includes(bundleId)
        ? { dir: join(cepDir, entry.name), bundleId }
        : null
    })
    .filter(Boolean)
}

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

// Drop installs under the previous bundle id, otherwise After Effects shows
// two "dony Tools" panels and they fight over the same ExtendScript globals.
for (const { dir, bundleId } of findInstalls(cepExtensionsDir, LEGACY_EXTENSION_IDS)) {
  rmSync(dir, { recursive: true, force: true })
  console.log(`Removed legacy install (${bundleId}) at: ${dir}`)
}

// The system-wide CEP folder needs admin rights, so report instead of deleting.
const systemCepDir = process.env['CommonProgramFiles(x86)']
  ? join(process.env['CommonProgramFiles(x86)'], 'Adobe', 'CEP', 'extensions')
  : null
if (systemCepDir) {
  const clashes = findInstalls(systemCepDir, [...LEGACY_EXTENSION_IDS, EXTENSION_ID])
  for (const { dir, bundleId } of clashes) {
    console.warn(`WARNING: ${bundleId} is also installed at ${dir}`)
  }
  if (clashes.length) {
    console.warn('  Delete it (needs admin) or After Effects will load two dony Tools panels.')
  }
}

// Copy dist/ → target
cpSync(distDir, targetDir, { recursive: true })

console.log(`\nDeployed successfully!`)
console.log(`  From: ${distDir}`)
console.log(`  To:   ${targetDir}`)
console.log(`\nThe bundle id changed in 4.0.0 — restart After Effects once so it`)
console.log(`registers the new panel. Later deploys only need the panel reopened,`)
console.log(`or "Refresh dony Tools" from the panel's flyout menu.`)
