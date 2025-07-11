# PowerShell script to securely upload environment variables to EAS
#
# Usage:
# 1. Make sure you are logged into EAS: `eas login`
# 2. Run this script from the project root: `.\push-secrets.ps1`

Write-Host "Pushing secrets to EAS..."

eas secret:push --scope project --file ./.env --force

Write-Host "Secrets have been pushed successfully." 