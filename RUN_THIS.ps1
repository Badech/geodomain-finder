# Quick fix script for GeoDomain Scout installation issue
# Run this in PowerShell: .\RUN_THIS.ps1

Write-Host "🔧 Fixing GeoDomain Scout installation..." -ForegroundColor Cyan

# Step 1: Clean up
Write-Host "`n📦 Step 1: Cleaning old files..." -ForegroundColor Yellow
if (Test-Path "node_modules") {
    Remove-Item -Recurse -Force "node_modules"
    Write-Host "✓ Removed node_modules" -ForegroundColor Green
}

if (Test-Path "package-lock.json") {
    Remove-Item -Force "package-lock.json"
    Write-Host "✓ Removed package-lock.json" -ForegroundColor Green
}

# Step 2: Clear npm cache
Write-Host "`n🧹 Step 2: Clearing npm cache..." -ForegroundColor Yellow
npm cache clean --force
Write-Host "✓ Cache cleared" -ForegroundColor Green

# Step 3: Install dependencies
Write-Host "`n📥 Step 3: Installing dependencies (this may take a minute)..." -ForegroundColor Yellow
npm install
Write-Host "✓ Dependencies installed" -ForegroundColor Green

# Step 4: Generate Prisma client
Write-Host "`n⚙️  Step 4: Generating Prisma client..." -ForegroundColor Yellow
npx prisma generate
Write-Host "✓ Prisma client generated" -ForegroundColor Green

# Step 5: Start dev server
Write-Host "`n🚀 Step 5: Starting development server..." -ForegroundColor Yellow
Write-Host "Server will start at http://localhost:3000" -ForegroundColor Cyan
Write-Host "Press Ctrl+C to stop the server`n" -ForegroundColor Gray

npm run dev
