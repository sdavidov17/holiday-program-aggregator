#!/bin/bash
# Script to set up branch protection rules that work with Vercel

echo "🔒 Setting up branch protection for Vercel deployments"

# Check if gh CLI is installed
if ! command -v gh &> /dev/null; then
    echo "❌ GitHub CLI (gh) is not installed. Please install it first."
    exit 1
fi

# Configure main branch protection
gh api \
  --method PUT \
  -H "Accept: application/vnd.github+json" \
  /repos/$GITHUB_REPOSITORY/branches/main/protection \
  --field "required_status_checks[strict]=true" \
  --field "required_status_checks[contexts][]=quality-checks" \
  --field "required_status_checks[contexts][]=Vercel" \
  --field "enforce_admins=false" \
  --field "required_pull_request_reviews[dismiss_stale_reviews]=true" \
  --field "required_pull_request_reviews[require_code_owner_reviews]=false" \
  --field "required_pull_request_reviews[required_approving_review_count]=0" \
  --field "restrictions=null" \
  --field "allow_force_pushes=false" \
  --field "allow_deletions=false"

echo "✅ Branch protection configured!"
echo ""
echo "Settings applied:"
echo "- CI checks must pass before merge"
echo "- Vercel deployment status is checked"
echo "- Direct pushes to main are blocked"
echo "- All changes must go through PR"