# Deploy Email Function Script
# Run this script in PowerShell to deploy the email confirmation function

Write-Host "Setting up Supabase Email Function..." -ForegroundColor Cyan

# 1. Login (will open browser if not logged in)
Write-Host "Checking Supabase login..."
npx supabase login

# 2. Set Secret
Write-Host "Setting RESEND_API_KEY secret..."
npx supabase secrets set RESEND_API_KEY=re_EsSZuouR_KLeHiW8DGwMQjWrhwqCAUGww

# 3. Deploy Function
Write-Host "Deploying send-confirmation function..."
npx supabase functions deploy send-confirmation

Write-Host "Done! Email function is live." -ForegroundColor Green
pause
