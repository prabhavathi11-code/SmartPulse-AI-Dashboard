$repo = "prabhavathi11-code/SmartPulse-AI-Dashboard"
Write-Host "Listening for repository creation at https://github.com/$repo ..."

$pushed = $false
for ($i = 0; $i -lt 40; $i++) {
    try {
        $res = Invoke-RestMethod -Uri "https://api.github.com/repos/$repo" -ErrorAction Stop
        if ($res.name -eq "SmartPulse-AI-Dashboard") {
            Write-Host "[SUCCESS] Repository detected on GitHub! Pushing code now..."
            git push -u origin main
            $pushed = $true
            break
        }
    } catch {
        Write-Host "Waiting for repository to be created... (Attempt $($i + 1)/40)"
        Start-Sleep -Seconds 3
    }
}

if (-not $pushed) {
    Write-Host "Timed out waiting for repository creation. Please run 'git push -u origin main' after creating it on GitHub."
}

