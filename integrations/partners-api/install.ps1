$ErrorActionPreference = 'Stop'
$apiRoot = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot '../../../tuplus-partners-api'))
if (-not (Test-Path (Join-Path $apiRoot 'src/routes/index.js'))) { throw 'No se encontró tuplus-partners-api junto al portal.' }
$utf8 = New-Object System.Text.UTF8Encoding($false)
$files = @{
  '010_etapas.sql' = 'database/migrations/010_etapas.sql'
  'etapasService.js' = 'src/services/etapasService.js'
  'crmService.js' = 'src/services/crmService.js'
  'etapas.routes.js' = 'src/routes/etapas.routes.js'
}
foreach ($file in $files.Keys) {
  Copy-Item -LiteralPath (Join-Path $PSScriptRoot $file) -Destination (Join-Path $apiRoot $files[$file]) -Force
}
$indexPath = Join-Path $apiRoot 'src/routes/index.js'
$index = [IO.File]::ReadAllText($indexPath)
if (-not $index.Contains("from './etapas.routes.js'")) {
  $index = "import etapas from './etapas.routes.js'`n" + $index
  $index = $index.Replace('export default router', "router.use('/etapas', etapas)`nexport default router")
  [IO.File]::WriteAllText($indexPath, $index, $utf8)
}
# Mantiene la ruta antigua y aplica la misma validación de nivel y publicación.
$servicePath = Join-Path $apiRoot 'src/services/academiaService.js'
$service = [IO.File]::ReadAllText($servicePath)
if (-not $service.Contains('completarSeguro')) {
  $service = "import { completar as completarSeguro } from './etapasService.js'`n" + $service
  $service = $service.Replace('export async function completarLeccion(usuario, leccionId) {', "export async function completarLeccion(usuario, leccionId) {`n  return completarSeguro(usuario, leccionId)`n}`n`nasync function completarLeccionAnterior(usuario, leccionId) {")
  [IO.File]::WriteAllText($servicePath, $service, $utf8)
}
Write-Output 'Archivos de las etapas instalados. Ejecuta npm run db:crear en la API.'
