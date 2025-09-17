# ChordCraft End-to-End Smoke Test (PowerShell)
# 60-second sanity check for complete flow verification

param(
    [string]$FrontendUrl = "https://chord-craft-l32h.vercel.app",
    [string]$ApiUrl = "https://api.yourdomain.com",
    [string]$TestFile = "deployment/scripts/sample.mp3"
)

# Colors for output
$Green = "Green"
$Yellow = "Yellow" 
$Red = "Red"
$Cyan = "Cyan"

function Write-Test {
    param([string]$Test, [string]$Status, [string]$Details = "")
    $color = if ($Status -eq "✅ PASS") { $Green } elseif ($Status -eq "⚠️ WARN") { $Yellow } else { $Red }
    Write-Host "[$Status] $Test" -ForegroundColor $color
    if ($Details) { Write-Host "    $Details" -ForegroundColor $Cyan }
}

Write-Host "🧪 ChordCraft End-to-End Smoke Test" -ForegroundColor $Cyan
Write-Host "Frontend: $FrontendUrl" -ForegroundColor $Cyan
Write-Host "API: $ApiUrl" -ForegroundColor $Cyan
Write-Host ""

# Test 1: Console Clean Check
Write-Host "1️⃣ Console Clean Check" -ForegroundColor $Yellow
try {
    $response = Invoke-WebRequest -Uri $FrontendUrl -Method Get
    if ($response.StatusCode -eq 200) {
        Write-Test "Frontend loads" "✅ PASS" "Status: $($response.StatusCode)"
    } else {
        Write-Test "Frontend loads" "❌ FAIL" "Status: $($response.StatusCode)"
    }
} catch {
    Write-Test "Frontend loads" "❌ FAIL" "Error: $($_.Exception.Message)"
}

# Test 2: API Health Check
Write-Host "2️⃣ API Health Check" -ForegroundColor $Yellow
try {
    $response = Invoke-RestMethod -Uri "$ApiUrl/health" -Method Get
    if ($response.status -eq "ok") {
        Write-Test "API health endpoint" "✅ PASS" "Status: $($response.status), Version: $($response.version)"
    } else {
        Write-Test "API health endpoint" "❌ FAIL" "Unexpected response: $($response | ConvertTo-Json)"
    }
} catch {
    Write-Test "API health endpoint" "❌ FAIL" "Error: $($_.Exception.Message)"
}

# Test 3: CORS Preflight Check
Write-Host "3️⃣ CORS Preflight Check" -ForegroundColor $Yellow
try {
    $headers = @{
        "Origin" = $FrontendUrl
        "Access-Control-Request-Method" = "POST"
        "Access-Control-Request-Headers" = "Content-Type"
    }
    $response = Invoke-WebRequest -Uri "$ApiUrl/analyze" -Method Options -Headers $headers
    if ($response.StatusCode -eq 204) {
        Write-Test "CORS preflight" "✅ PASS" "Status: $($response.StatusCode)"
    } else {
        Write-Test "CORS preflight" "❌ FAIL" "Status: $($response.StatusCode)"
    }
} catch {
    Write-Test "CORS preflight" "❌ FAIL" "Error: $($_.Exception.Message)"
}

# Test 4: Upload Test (if test file exists)
Write-Host "4️⃣ Upload Test" -ForegroundColor $Yellow
if (Test-Path $TestFile) {
    try {
        $form = @{
            audio = Get-Item $TestFile
        }
        $response = Invoke-RestMethod -Uri "$ApiUrl/analyze" -Method Post -Form $form
        if ($response.success -and $response.code) {
            Write-Test "File upload" "✅ PASS" "Generated code: $($response.code.Length) chars"
        } else {
            Write-Test "File upload" "❌ FAIL" "Response: $($response | ConvertTo-Json)"
        }
    } catch {
        Write-Test "File upload" "❌ FAIL" "Error: $($_.Exception.Message)"
    }
} else {
    Write-Test "File upload" "⚠️ WARN" "Test file not found: $TestFile"
}

# Test 5: Security Headers Check
Write-Host "5️⃣ Security Headers Check" -ForegroundColor $Yellow
try {
    $response = Invoke-WebRequest -Uri $FrontendUrl -Method Get
    $headers = $response.Headers
    
    $requiredHeaders = @(
        "X-Content-Type-Options",
        "Referrer-Policy", 
        "Permissions-Policy"
    )
    
    $passed = 0
    foreach ($header in $requiredHeaders) {
        if ($headers[$header]) {
            Write-Test "Header: $header" "✅ PASS" "Value: $($headers[$header])"
            $passed++
        } else {
            Write-Test "Header: $header" "❌ FAIL" "Missing"
        }
    }
    
    if ($passed -eq $requiredHeaders.Count) {
        Write-Test "Security headers" "✅ PASS" "All required headers present"
    } else {
        Write-Test "Security headers" "⚠️ WARN" "$passed/$($requiredHeaders.Count) headers present"
    }
} catch {
    Write-Test "Security headers" "❌ FAIL" "Error: $($_.Exception.Message)"
}

# Test 6: CSP Check
Write-Host "6️⃣ CSP Check" -ForegroundColor $Yellow
try {
    $response = Invoke-WebRequest -Uri $FrontendUrl -Method Get
    $csp = $response.Headers["Content-Security-Policy"]
    
    if ($csp) {
        $requiredDomains = @(
            "accounts.google.com",
            "apis.google.com", 
            "unpkg.com",
            "*.supabase.co"
        )
        
        $found = 0
        foreach ($domain in $requiredDomains) {
            if ($csp -like "*$domain*") {
                Write-Test "CSP domain: $domain" "✅ PASS" "Found in CSP"
                $found++
            } else {
                Write-Test "CSP domain: $domain" "❌ FAIL" "Missing from CSP"
            }
        }
        
        if ($found -eq $requiredDomains.Count) {
            Write-Test "CSP configuration" "✅ PASS" "All required domains allowed"
        } else {
            Write-Test "CSP configuration" "⚠️ WARN" "$found/$($requiredDomains.Count) domains found"
        }
    } else {
        Write-Test "CSP configuration" "❌ FAIL" "No CSP header found"
    }
} catch {
    Write-Test "CSP configuration" "❌ FAIL" "Error: $($_.Exception.Message)"
}

Write-Host ""
Write-Host "🎯 Manual Tests Required:" -ForegroundColor $Cyan
Write-Host "• Open $FrontendUrl in browser" -ForegroundColor $Cyan
Write-Host "• Check DevTools Console for CSP violations" -ForegroundColor $Cyan
Write-Host "• Test Google OAuth sign-in flow" -ForegroundColor $Cyan
Write-Host "• Upload a small MP3 file" -ForegroundColor $Cyan
Write-Host "• Verify Studio page loads with transport controls" -ForegroundColor $Cyan
Write-Host "• Test hard refresh on /studio page" -ForegroundColor $Cyan
Write-Host "• Check integrity badge functionality" -ForegroundColor $Cyan

Write-Host ""
Write-Host "🚀 If all tests pass, your ChordCraft Studio is production-ready!" -ForegroundColor $Green
