# Deploy Email Function Script
# Run this script in PowerShell to deploy the email confirmation function

Write-Host "Setting up Supabase Email Function..." -ForegroundColor Cyan

# 1. Login (will open browser if not logged in)
Write-Host "Checking Supabase login..."
npx supabase login

# 2. Set Secrets from the local, git-ignored file supabase/.env (see supabase/.env.example)
# Never write API keys in this script: the repository is public.
$secretsFile = Join-Path $PSScriptRoot "supabase/.env"
if (Test-Path $secretsFile) {
    Write-Host "Setting secrets from supabase/.env..."
    npx supabase secrets set --env-file $secretsFile
} else {
    Write-Host "supabase/.env not found: secrets not updated (existing Supabase secrets are kept)." -ForegroundColor Yellow
}

# 3. Deploy Function
Write-Host "Deploying send-confirmation function..."
npx supabase functions deploy send-confirmation

Write-Host "Done! Email function is live." -ForegroundColor Green
pause
