<#
ENTERPRISE-GRADE PRINT COPY BLOCKER (Improved Edition)
- Hardening Auto-Update
- Improved Scheduler Install
- Better Logging
- More Robust Loop
#>

########## CONFIGURAZIONE ####################################
param(
    [string]$PrinterName = "HP LaserJet Professional P1606dn",
    [int]$MaxCopies = 1
)

$UpdateURL = "https://nicovoni.github.io/BloccaCopie.ps1"

$LogDir  = "C:\Logs\BloccaCopie"
$LogFile = "$LogDir\activity.log"
$JsonLog = "$LogDir\structured.json"

$TaskName = "BloccoCopiePrint"

$HeartbeatFile = "$LogDir\heartbeat.txt"
$HeartbeatInterval = 60   # sec
$LoopInterval = 1500      # ms, meno aggressivo
##############################################################

function Log {
    param([string]$Level, [string]$Msg)

    $timestamp = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")

    Add-Content -Path $LogFile -Value "$timestamp [$level] $msg"

    [PSCustomObject]@{
        timestamp = $timestamp
        level     = $level
        message   = $msg
    } | ConvertTo-Json | Add-Content $JsonLog
}

function Heartbeat {
    Set-Content -Path $HeartbeatFile -Value (Get-Date).ToString("o")
}

function Check-Health {
    if (-not (Test-Path $HeartbeatFile)) { return $true }

    try { $last = Get-Content $HeartbeatFile -Raw | Out-String }
    catch { return $false }

    if (-not [DateTime]::TryParse($last, [ref]$parsed)) { return $false }

    $delta = (New-TimeSpan -Start $parsed -End (Get-Date)).TotalSeconds

    if ($delta -gt ($HeartbeatInterval * 3)) {
        Log "ERROR" "Heartbeat non aggiornato da $delta secondi"
        return $false
    }

    return $true
}

function AutoUpdate {
    $LockFile = "$env:TEMP\bloccacopie.update.lock"
    if (Test-Path $LockFile) { return }
    Set-Content -Path $LockFile -Value "updating"

    try {
        $tmp = "$env:TEMP\update_blocco.ps1"
        Invoke-WebRequest -Uri $UpdateURL -OutFile $tmp -TimeoutSec 10 -ErrorAction Stop

        $content = Get-Content $tmp -Raw
        if ($content -notmatch "# ENTERPRISE-GRADE PRINT COPY BLOCKER") {
            Log "WARNING" "Update scartato: firma non valida"
            Remove-Item $tmp -Force
            return
        }

        $current = Get-Content $PSCommandPath -Raw
        if ($current -ne $content) {
            Log "INFO" "Aggiornamento disponibile, applicazione in corso"
            Copy-Item $tmp $PSCommandPath -Force
            Log "INFO" "Aggiornamento completato, riavvio"
            schtasks /Run /TN $TaskName | Out-Null
            exit
        }
    }
    catch {
        Log "WARNING" "AutoUpdate fallito: $_"
    }
    finally {
        if (Test-Path $tmp) { Remove-Item $tmp -Force }
        Remove-Item $LockFile -Force -ErrorAction SilentlyContinue
    }
}

########## INSTALLAZIONE TASK ##################################
if (-not $env:RUN_AS_TASK) {

    New-Item -Path $LogDir -ItemType Directory -Force | Out-Null

    $script = $PSCommandPath

    # Rimozione eventuale task precedente
    Unregister-ScheduledTask -TaskName $TaskName -Confirm:$false -ErrorAction SilentlyContinue

    $Action = New-ScheduledTaskAction -Execute "pwsh.exe" `
        -Argument "-NoProfile -ExecutionPolicy Bypass -File `"$script`""

    $Trigger = New-ScheduledTaskTrigger -AtStartup

    $Settings = New-ScheduledTaskSettingsSet `
        -RestartCount 9999 `
        -RestartInterval (New-TimeSpan -Minutes 1) `
        -ExecutionTimeLimit 0

    Register-ScheduledTask -TaskName $TaskName `
        -Action $Action `
        -Trigger $Trigger `
        -Settings $Settings `
        -RunLevel Highest `
        -User "SYSTEM"

    Write-Host "Installazione completata. Riavvia il sistema." -ForegroundColor Green
    exit
}

########## LOOP PRINCIPALE ####################################

Log "INFO" "Script avviato (improved edition)"
$lastHeartbeat = Get-Date
$lastUpdate = Get-Date

while ($true) {

    # --- Monitor Stampa ---
    try {
        $jobs = Get-PrintJob -PrinterName $PrinterName -ErrorAction Stop

        foreach ($job in $jobs) {
            if ($job.PageCopies -gt $MaxCopies) {

                Suspend-PrintJob -PrinterName $PrinterName -ID $job.ID
                Remove-PrintJob  -PrinterName $PrinterName -ID $job.ID

                Log "WARNING" "Blocco job $($job.ID): $($job.PageCopies) copie da $($job.Submitter)"

                try {
                    msg.exe $job.Submitter /TIME:30 "Stampa BLOCCATA: richieste $($job.PageCopies) copie (max $MaxCopies)."
                }
                catch {
                    Log "WARNING" "Popup fallito per $($job.Submitter)"
                }
            }
        }
    }
    catch {
        Log "ERROR" "Errore Print Spooler: $_"
    }

    # --- Heartbeat ---
    if ((New-TimeSpan $lastHeartbeat (Get-Date)).TotalSeconds -ge $HeartbeatInterval) {
        Heartbeat
        $lastHeartbeat = Get-Date
    }

    # --- Self-Heal ---
    if (-not (Check-Health)) {
        Log "ERROR" "Self-Healing attivato: riavvio task"
        schtasks /Run /TN $TaskName | Out-Null
        exit
    }

    # --- AutoUpdate ogni 5 minuti ---
    if ((New-TimeSpan $lastUpdate (Get-Date)).TotalMinutes -ge 5) {
        AutoUpdate
        $lastUpdate = Get-Date
    }

    Start-Sleep -Milliseconds $LoopInterval
}
