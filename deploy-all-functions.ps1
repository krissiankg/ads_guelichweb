# Deploy All Supabase Functions
# Run this script to update all Edge Functions with the correct domain (guelichweb.online)

Write-Host "Deploying All Supabase Functions..." -ForegroundColor Cyan

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

# 3. Deploy send-confirmation (Project Submission Email)
Write-Host "Deploying send-confirmation..."
npx supabase functions deploy send-confirmation

# 4. Deploy newsletter-subscribe (Newsletter Email)
Write-Host "Deploying newsletter-subscribe..."
npx supabase functions deploy newsletter-subscribe

Write-Host "Done! All functions are live with correct domain configuration." -ForegroundColor Green
pause
