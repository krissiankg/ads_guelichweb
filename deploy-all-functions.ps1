# Deploy All Supabase Functions
# Run this script to update all Edge Functions with the correct domain (guelichweb.online)

Write-Host "Deploying All Supabase Functions..." -ForegroundColor Cyan

# 1. Login (will open browser if not logged in)
Write-Host "Checking Supabase login..."
npx supabase login

# 2. Set Secret (ensure it's set for all functions)
Write-Host "Setting RESEND_API_KEY secret..."
npx supabase secrets set RESEND_API_KEY=re_EsSZuouR_KLeHiW8DGwMQjWrhwqCAUGww

# 3. Deploy send-confirmation (Project Submission Email)
Write-Host "Deploying send-confirmation..."
npx supabase functions deploy send-confirmation

# 4. Deploy newsletter-subscribe (Newsletter Email)
Write-Host "Deploying newsletter-subscribe..."
npx supabase functions deploy newsletter-subscribe

Write-Host "Done! All functions are live with correct domain configuration." -ForegroundColor Green
pause
