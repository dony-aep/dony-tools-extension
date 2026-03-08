/**
 * Package script – builds the extension and creates a zip ready for GitHub Releases.
 * Output: releases/dony-tools-v{version}.zip
 *
 * Usage:
 *   node scripts/package.mjs          → build + zip
 *   npm run package                   → same via npm script
 */

import { existsSync, mkdirSync, readFileSync, createWriteStream } from 'fs'
import { join, resolve } from 'path'
import { fileURLToPath } from 'url'
import { execSync } from 'child_process'
import { createReadStream, readdirSync, statSync } from 'fs'
import { createDeflateRaw } from 'zlib'

const __dirname = fileURLToPath(new URL('.', import.meta.url))
const projectRoot = join(__dirname, '..')

// Read version from package.json
const pkg = JSON.parse(readFileSync(join(projectRoot, 'package.json'), 'utf-8'))
const version = pkg.version

const distDir = join(projectRoot, 'dist')
const releasesDir = join(projectRoot, 'releases')
const zipName = `dony-tools-v${version}.zip`
const zipPath = join(releasesDir, zipName)

// 1. Build
console.log(`\nBuilding dony Tools v${version}...\n`)
try {
  execSync('npm run build', { cwd: projectRoot, stdio: 'inherit' })
} catch {
  console.error('\nBuild failed. Aborting package.')
  process.exit(1)
}

// 2. Verify dist exists
if (!existsSync(distDir)) {
  console.error('ERROR: dist/ folder not found after build.')
  process.exit(1)
}

// 3. Create releases/ dir
if (!existsSync(releasesDir)) {
  mkdirSync(releasesDir, { recursive: true })
}

// 4. Create zip using PowerShell (available on Windows)
console.log(`\nPackaging → ${zipName}`)

const distAbsolute = resolve(distDir)
const zipAbsolute = resolve(zipPath)

// Remove old zip if exists
try {
  execSync(`Remove-Item -Path "${zipAbsolute}" -Force -ErrorAction SilentlyContinue`, {
    shell: 'powershell.exe',
    stdio: 'ignore',
  })
} catch {
  // ignore
}

// Compress using PowerShell's Compress-Archive
execSync(
  `Compress-Archive -Path "${distAbsolute}\\*" -DestinationPath "${zipAbsolute}" -Force`,
  { shell: 'powershell.exe', stdio: 'inherit' },
)

// Verify
if (!existsSync(zipPath)) {
  console.error('ERROR: Failed to create zip file.')
  process.exit(1)
}

const sizeMB = (statSync(zipPath).size / 1024 / 1024).toFixed(2)
console.log(`\n✓ Package created: releases/${zipName} (${sizeMB} MB)`)
console.log(`  Ready to upload to GitHub Release v${version}`)
