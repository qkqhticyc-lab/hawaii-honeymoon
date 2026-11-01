$ErrorActionPreference = 'Stop'
Set-Location -LiteralPath $PSScriptRoot
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    $bundledNode = Join-Path (Split-Path -Parent $PSScriptRoot) 'ticketlink-analysis-20261005\tools\node-v22.20.0-win-x64'
    if (Test-Path -LiteralPath (Join-Path $bundledNode 'node.exe')) {
        $env:Path = $bundledNode + ';' + $env:Path
    } else { throw 'Node.js 22.12 or newer is required. Install Node.js, then run this script again.' }
}
if (-not (Test-Path -LiteralPath (Join-Path $PSScriptRoot 'node_modules'))) {
    & npm.cmd ci
    if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
}
& npm.cmd run dev -- --open
