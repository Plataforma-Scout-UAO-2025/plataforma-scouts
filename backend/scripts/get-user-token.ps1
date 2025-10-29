param(
  [Parameter(Mandatory=$true)][string]$Username,
  [Parameter(Mandatory=$true)][string]$Password,
  [string]$Connection = "Username-Password-Authentication",
  [string]$Scope = "openid profile email"
)

# Load .env from backend folder
$envPath = Join-Path $PSScriptRoot "..\..\.env"
if (-not (Test-Path $envPath)) {
  throw ".env not found at $envPath"
}

$lines = Get-Content $envPath | Where-Object { $_ -and ($_ -notmatch '^#') }
$envMap = @{}
foreach ($line in $lines) {
  $kv = $line -split '=', 2
  if ($kv.Length -eq 2) { $envMap[$kv[0].Trim()] = $kv[1].Trim() }
}

$domain = $envMap['AUTH0_DOMAIN']
$clientId = $envMap['AUTH0_CLIENT_ID']
$clientSecret = $envMap['AUTH0_CLIENT_SECRET']
$audience = $envMap['AUTH0_AUDIENCE']

if (-not $domain -or -not $clientId -or -not $clientSecret -or -not $audience) {
  throw "Missing required Auth0 settings in .env (AUTH0_DOMAIN, AUTH0_CLIENT_ID, AUTH0_CLIENT_SECRET, AUTH0_AUDIENCE)."
}

$tokenUrl = "https://$domain/oauth/token"

$body = @{
  grant_type    = 'http://auth0.com/oauth/grant-type/password-realm'
  client_id     = $clientId
  client_secret = $clientSecret
  audience      = $audience
  username      = $Username
  password      = $Password
  realm         = $Connection
  scope         = $Scope
}

try {
  $response = Invoke-RestMethod -Method Post -Uri $tokenUrl -ContentType 'application/x-www-form-urlencoded' -Body $body
  Write-Host "access_token:" $response.access_token
  Write-Host "token_type:" $response.token_type
  if ($response.id_token) { Write-Host "id_token:" $response.id_token }
  if ($response.refresh_token) { Write-Host "refresh_token:" $response.refresh_token }
} catch {
  Write-Error $_.Exception.Message
  if ($_.ErrorDetails) { Write-Error $_.ErrorDetails.Message }
  exit 1
}
