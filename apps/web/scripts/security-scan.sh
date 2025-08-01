#!/bin/bash

# Security Scanning Script for Local Development
# Run this script to perform security checks before committing code

set -e

echo "🔒 Running Security Scans..."
echo "=========================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Track if any checks fail
FAILED=0

# Function to check command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# 1. Dependency Vulnerability Scan
echo -e "\n📦 Checking dependencies for vulnerabilities..."
if pnpm audit --json > audit-report.json 2>/dev/null; then
    CRITICAL=$(cat audit-report.json | jq '.metadata.vulnerabilities.critical // 0' 2>/dev/null || echo 0)
    HIGH=$(cat audit-report.json | jq '.metadata.vulnerabilities.high // 0' 2>/dev/null || echo 0)
    MODERATE=$(cat audit-report.json | jq '.metadata.vulnerabilities.moderate // 0' 2>/dev/null || echo 0)
    
    if [ "$CRITICAL" -gt 0 ] || [ "$HIGH" -gt 0 ]; then
        echo -e "${RED}❌ Found $CRITICAL critical and $HIGH high vulnerabilities${NC}"
        echo "Run 'pnpm audit' for details"
        FAILED=1
    elif [ "$MODERATE" -gt 0 ]; then
        echo -e "${YELLOW}⚠️  Found $MODERATE moderate vulnerabilities${NC}"
    else
        echo -e "${GREEN}✅ No vulnerabilities found${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  Could not run pnpm audit${NC}"
fi

# 2. Check for outdated packages
echo -e "\n📅 Checking for outdated packages..."
OUTDATED_COUNT=$(pnpm outdated --format json 2>/dev/null | jq 'length' 2>/dev/null || echo 0)
if [ "$OUTDATED_COUNT" -gt 0 ]; then
    echo -e "${YELLOW}⚠️  Found $OUTDATED_COUNT outdated packages${NC}"
    echo "Run 'pnpm outdated' for details"
else
    echo -e "${GREEN}✅ All packages up to date${NC}"
fi

# 3. Secret Detection
echo -e "\n🔍 Scanning for exposed secrets..."
if command_exists gitleaks; then
    if gitleaks detect --no-git --verbose > /dev/null 2>&1; then
        echo -e "${GREEN}✅ No secrets detected${NC}"
    else
        echo -e "${RED}❌ Potential secrets found!${NC}"
        echo "Run 'gitleaks detect --verbose' for details"
        FAILED=1
    fi
else
    echo -e "${YELLOW}⚠️  Gitleaks not installed. Install with: brew install gitleaks${NC}"
fi

# 4. License Check
echo -e "\n📜 Checking licenses..."
PROBLEMATIC_LICENSES="GPL|AGPL|LGPL|SSPL|Commons-Clause"
if command_exists license-checker; then
    license-checker --json --excludePrivatePackages > licenses.json 2>/dev/null
    if grep -E "$PROBLEMATIC_LICENSES" licenses.json > /dev/null 2>&1; then
        echo -e "${RED}❌ Found packages with potentially problematic licenses${NC}"
        echo "Run 'license-checker' for details"
        FAILED=1
    else
        echo -e "${GREEN}✅ All licenses compatible${NC}"
    fi
    rm -f licenses.json
else
    echo -e "${YELLOW}⚠️  license-checker not installed. Install with: pnpm add -g license-checker${NC}"
fi

# 5. Basic SAST checks
echo -e "\n🐛 Running basic security checks..."

# Check for hardcoded secrets patterns
SECRET_PATTERNS=(
    "password.*=.*['\"].*['\"]"
    "api[_-]?key.*=.*['\"].*['\"]"
    "secret.*=.*['\"].*['\"]"
    "token.*=.*['\"].*['\"]"
    "private[_-]?key.*=.*['\"].*['\"]"
)

FOUND_PATTERNS=0
for pattern in "${SECRET_PATTERNS[@]}"; do
    if grep -r -i -E "$pattern" --include="*.ts" --include="*.tsx" --include="*.js" --exclude-dir=node_modules --exclude-dir=.next . 2>/dev/null | grep -v -E "(process\.env|import\.meta\.env)" > /dev/null; then
        FOUND_PATTERNS=1
    fi
done

if [ "$FOUND_PATTERNS" -eq 1 ]; then
    echo -e "${RED}❌ Potential hardcoded secrets found${NC}"
    FAILED=1
else
    echo -e "${GREEN}✅ No hardcoded secrets detected${NC}"
fi

# 6. Security Headers Check (if server is running)
echo -e "\n🛡️  Checking security headers..."
if curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 | grep -q "200" 2>/dev/null; then
    HEADERS=$(curl -s -I http://localhost:3000)
    MISSING_HEADERS=()
    
    REQUIRED_HEADERS=(
        "X-Frame-Options"
        "X-Content-Type-Options"
        "X-XSS-Protection"
        "Referrer-Policy"
        "Content-Security-Policy"
    )
    
    for header in "${REQUIRED_HEADERS[@]}"; do
        if ! echo "$HEADERS" | grep -qi "$header"; then
            MISSING_HEADERS+=("$header")
        fi
    done
    
    if [ ${#MISSING_HEADERS[@]} -gt 0 ]; then
        echo -e "${RED}❌ Missing security headers: ${MISSING_HEADERS[*]}${NC}"
        FAILED=1
    else
        echo -e "${GREEN}✅ All security headers present${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  Server not running, skipping header check${NC}"
fi

# Summary
echo -e "\n=========================="
if [ "$FAILED" -eq 0 ]; then
    echo -e "${GREEN}✅ All security checks passed!${NC}"
    exit 0
else
    echo -e "${RED}❌ Some security checks failed. Please fix issues before committing.${NC}"
    exit 1
fi