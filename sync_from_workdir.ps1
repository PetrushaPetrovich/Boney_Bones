# Copy the published file set from the working folder into this repository.
# Копирует публикуемый набор файлов из рабочей папки в этот репозиторий.
# Usage / запуск:  powershell -File sync_from_workdir.ps1 [-Source <working folder>]
param(
    [string]$Source = "C:\Programs\_Plugins\AeScripts\_My\Boney_Bones"
)
$Dest = $PSScriptRoot
if (-not (Test-Path $Source)) { throw "Working folder not found / рабочая папка не найдена: $Source" }

# Panel: the single versioned Boney_Bones_<ver>.jsx; older copies in the repo are removed
# Панель: единственный файл Boney_Bones_<ver>.jsx; старые копии в репозитории удаляются
Get-ChildItem "$Dest\Boney_Bones_*.jsx" | Remove-Item -Force
$panel = Get-ChildItem "$Source\Boney_Bones_*.jsx" | Sort-Object Name | Select-Object -Last 1
Copy-Item $panel.FullName $Dest -Force

# Scripts, presets and the template; the repo folder mirrors the working one
# Скрипты, пресеты и шаблон; папка в репозитории зеркалит рабочую
robocopy "$Source\boney_files" "$Dest\boney_files" /MIR /NJH /NJS /NP /NDL /NFL | Out-Null

# Limb expression and the plain-text readme / Экспрешен конечности и текстовый readme
New-Item -ItemType Directory -Force "$Dest\RES" | Out-Null
Copy-Item "$Source\RES\limb.jsx" "$Dest\RES\limb.jsx" -Force
Copy-Item "$Source\README.txt" "$Dest\README.txt" -Force

git -C $Dest status --short
Write-Host "Synced from $Source -> $Dest. Review 'git status' above, then commit. / Синхронизировано; проверьте статус и закоммитьте."
