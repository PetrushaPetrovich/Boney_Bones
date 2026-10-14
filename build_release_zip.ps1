# Build the distribution archive Boney_Bones_<ver>.zip from this repository (panel + boney_files + README.txt).
# Собирает архив дистрибутива Boney_Bones_<ver>.zip из этого репозитория (панель + boney_files + README.txt).
# Usage / запуск:  powershell -ExecutionPolicy Bypass -File build_release_zip.ps1   -> dist\Boney_Bones_<ver>.zip
$Root = $PSScriptRoot
$panel = Get-ChildItem "$Root\Boney_Bones_*.jsx" | Sort-Object Name | Select-Object -Last 1
if (-not $panel) { throw "Panel file Boney_Bones_<ver>.jsx not found / файл панели не найден" }
$ver = $panel.BaseName -replace '^Boney_Bones_', ''
$dist = Join-Path $Root "dist"
New-Item -ItemType Directory -Force $dist | Out-Null
$zip = Join-Path $dist "Boney_Bones_$ver.zip"
if (Test-Path $zip) { Remove-Item $zip -Force }
Compress-Archive -Path $panel.FullName, "$Root\boney_files", "$Root\README.txt" -DestinationPath $zip -CompressionLevel Optimal
Write-Host "Built / собран: $zip ($([math]::Round((Get-Item $zip).Length / 1MB, 1)) MB)"
