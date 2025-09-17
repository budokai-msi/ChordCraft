# ChordCraft Production Smoke Tests (PowerShell)
# Run after deployment to verify everything works

param(
    [string]$ApiUrl = "https://api.yourdomain.com",
    [string]$FrontendUrl = "https://studio.yourdomain.com",
    [string]$TestFile = "deployment/scripts/sample.mp3"
)

# Helper functions
function Write-Info {
    param([string]$Message)
    Write-Host "[INFO] $Message" -ForegroundColor Green
}

function Write-Warn {
    param([string]$Message)
    Write-Host "[WARN] $Message" -ForegroundColor Yellow
}

function Write-Error {
    param([string]$Message)
    Write-Host "[ERROR] $Message" -ForegroundColor Red
}

function Test-Health {
    Write-Info "Testing API health endpoint..."
    
    try {
        $response = Invoke-RestMethod -Uri "$ApiUrl/health" -Method Get
        Write-Info "✅ Health check passed"
        $response | ConvertTo-Json -Depth 3
        return $true
    }
    catch {
        Write-Error "❌ Health check failed: $($_.Exception.Message)"
        return $false
    }
}

function Test-Cors {
    Write-Info "Testing CORS preflight..."
    
    try {
        $headers = @{
            "Origin" = $FrontendUrl
            "Access-Control-Request-Method" = "POST"
            "Access-Control-Request-Headers" = "Content-Type"
        }
        
        $response = Invoke-WebRequest -Uri "$ApiUrl/analyze" -Method Options -Headers $headers
        if ($response.StatusCode -eq 204) {
            Write-Info "✅ CORS preflight passed"
            return $true
        } else {
            Write-Error "❌ CORS preflight failed (HTTP $($response.StatusCode))"
            return $false
        }
    }
    catch {
        Write-Error "❌ CORS preflight failed: $($_.Exception.Message)"
        return $false
    }
}

function Test-Upload {
    Write-Info "Testing file upload..."
    
    # Create dummy MP3 if test file doesn't exist
    if (-not (Test-Path $TestFile)) {
        Write-Warn "Test file not found, creating dummy MP3..."
        $dummyMp3 = [byte[]](0xFF, 0xFB, 0x90, 0x00)
        [System.IO.File]::WriteAllBytes("$env:TEMP\test.mp3", $dummyMp3)
        $TestFile = "$env:TEMP\test.mp3"
    }
    
    try {
        $form = @{
            audio = Get-Item $TestFile
        }
        
        $response = Invoke-RestMethod -Uri "$ApiUrl/analyze" -Method Post -Form $form
        Write-Info "✅ Upload test passed"
        
        if ($response.code -and $response.code -like "*Song {*") {
            Write-Info "✅ ChordCraft code generation working"
        } else {
            Write-Warn "⚠️  Upload succeeded but no ChordCraft code found"
        }
        return $true
    }
    catch {
        Write-Error "❌ Upload test failed: $($_.Exception.Message)"
        return $false
    }
}

function Test-RateLimiting {
    Write-Info "Testing rate limiting..."
    
    try {
        # Make multiple rapid requests
        $jobs = @()
        for ($i = 1; $i -le 10; $i++) {
            $jobs += Start-Job -ScriptBlock {
                param($url)
                try {
                    Invoke-RestMethod -Uri $url -Method Get
                    return "200"
                } catch {
                    return $_.Exception.Response.StatusCode.value__
                }
            } -ArgumentList $ApiUrl
        }
        
        $results = $jobs | Wait-Job | Receive-Job
        $jobs | Remove-Job
        
        # Check if we got rate limited
        $rateLimited = $results | Where-Object { $_ -eq "429" }
        if ($rateLimited) {
            Write-Info "✅ Rate limiting working"
        } else {
            Write-Warn "⚠️  Rate limiting not triggered"
        }
        return $true
    }
    catch {
        Write-Warn "⚠️  Rate limiting test failed: $($_.Exception.Message)"
        return $false
    }
}

function Test-SecurityHeaders {
    Write-Info "Testing security headers..."
    
    try {
        $response = Invoke-WebRequest -Uri "$ApiUrl/health" -Method Get
        
        $requiredHeaders = @(
            "X-Content-Type-Options",
            "X-Frame-Options", 
            "Referrer-Policy"
        )
        
        foreach ($header in $requiredHeaders) {
            if ($response.Headers[$header]) {
                Write-Info "✅ $header present"
            } else {
                Write-Warn "⚠️  $header missing"
            }
        }
        return $true
    }
    catch {
        Write-Error "❌ Security headers test failed: $($_.Exception.Message)"
        return $false
    }
}

function Test-Frontend {
    Write-Info "Testing frontend accessibility..."
    
    try {
        $response = Invoke-WebRequest -Uri $FrontendUrl -Method Get
        if ($response.StatusCode -eq 200) {
            Write-Info "✅ Frontend accessible"
            return $true
        } else {
            Write-Error "❌ Frontend not accessible (HTTP $($response.StatusCode))"
            return $false
        }
    }
    catch {
        Write-Error "❌ Frontend not accessible: $($_.Exception.Message)"
        return $false
    }
}

# Main test suite
function Main {
    Write-Info "Starting ChordCraft production smoke tests..."
    Write-Info "API URL: $ApiUrl"
    Write-Info "Frontend URL: $FrontendUrl"
    Write-Host ""
    
    $results = @()
    
    # Run tests
    $results += Test-Health
    $results += Test-Cors
    $results += Test-SecurityHeaders
    $results += Test-Upload
    $results += Test-RateLimiting
    $results += Test-Frontend
    
    Write-Host ""
    $passed = ($results | Where-Object { $_ -eq $true }).Count
    $total = $results.Count
    
    if ($passed -eq $total) {
        Write-Info "🎉 All smoke tests passed! ($passed/$total)"
    } else {
        Write-Warn "⚠️  Some tests failed ($passed/$total passed)"
    }
    
    Write-Info "Check the output above for any warnings or errors."
}

# Run main function
Main
