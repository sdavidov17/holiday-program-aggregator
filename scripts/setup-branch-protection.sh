#!/bin/bash

# GitHub Branch Protection Setup Script
# This script sets up branch protection rules for the main branch

set -e

echo "🔒 Setting up GitHub branch protection rules..."

# Check if gh CLI is installed
if ! command -v gh &> /dev/null; then
    echo "❌ GitHub CLI (gh) is not installed. Please install it first:"
    echo "   brew install gh"
    exit 1
fi

# Check if authenticated
if ! gh auth status &> /dev/null; then
    echo "❌ Not authenticated with GitHub. Please run:"
    echo "   gh auth login"
    exit 1
fi

# Get repository info
REPO=$(gh repo view --json nameWithOwner -q .nameWithOwner)
echo "📦 Repository: $REPO"

# Set up branch protection for main branch
echo "🛡️  Configuring protection rules for 'main' branch..."

gh api \
  --method PUT \
  -H "Accept: application/vnd.github+json" \
  "/repos/${REPO}/branches/main/protection" \
  --field "required_status_checks[strict]=true" \
  --field "required_status_checks[contexts][]=test" \
  --field "required_status_checks[contexts][]=security-scan" \
  --field "enforce_admins=true" \
  --field "required_pull_request_reviews[required_approving_review_count]=1" \
  --field "required_pull_request_reviews[dismiss_stale_reviews]=true" \
  --field "required_pull_request_reviews[require_code_owner_reviews]=false" \
  --field "required_conversation_resolution=true" \
  --field "restrictions=null" \
  --field "allow_force_pushes=false" \
  --field "allow_deletions=false" \
  --field "required_linear_history=false" \
  --field "allow_squash_merge=true" \
  --field "allow_merge_commit=false" \
  --field "allow_rebase_merge=false" \
  --field "delete_branch_on_merge=true"

echo "✅ Branch protection rules configured successfully!"

# Configure additional repository settings
echo "⚙️  Configuring repository settings..."

# Enable auto-delete head branches
gh api \
  --method PATCH \
  -H "Accept: application/vnd.github+json" \
  "/repos/${REPO}" \
  --field "delete_branch_on_merge=true" \
  --field "allow_squash_merge=true" \
  --field "allow_merge_commit=false" \
  --field "allow_rebase_merge=false"

echo "✅ Repository settings configured!"

# Create sample PR template
echo "📝 Creating PR template..."

mkdir -p .github
cat > .github/pull_request_template.md << 'EOF'
## Description
Brief description of the changes in this PR

## Story Reference
- Epic: 
- Story: 
- Link: 

## Type of Change
- [ ] 🐛 Bug fix (non-breaking change which fixes an issue)
- [ ] ✨ New feature (non-breaking change which adds functionality)
- [ ] 💥 Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] 📚 Documentation update
- [ ] 🎨 Code style update (formatting, renaming)
- [ ] ♻️ Refactoring (no functional changes)
- [ ] ⚡ Performance improvement
- [ ] ✅ Test update
- [ ] 🔧 Configuration change

## Checklist
- [ ] My code follows the style guidelines of this project
- [ ] I have performed a self-review of my code
- [ ] I have added tests that prove my fix is effective or that my feature works
- [ ] New and existing unit tests pass locally with my changes
- [ ] I have made corresponding changes to the documentation
- [ ] My changes generate no new warnings
- [ ] Any dependent changes have been merged and published

## Screenshots (if applicable)
Add screenshots to help explain your changes

## Additional Notes
Any additional information that would be helpful for reviewers
EOF

echo "✅ PR template created!"

echo ""
echo "🎉 GitHub branch protection setup complete!"
echo ""
echo "📋 Summary of protection rules:"
echo "   ✅ Require PR reviews (1 approval minimum)"
echo "   ✅ Dismiss stale reviews on new commits"
echo "   ✅ Require status checks: test, security-scan"
echo "   ✅ Require branches to be up to date"
echo "   ✅ Require conversation resolution"
echo "   ✅ Enforce rules for administrators"
echo "   ✅ Block force pushes"
echo "   ✅ Block branch deletion"
echo "   ✅ Auto-delete head branches after merge"
echo "   ✅ Allow only squash merging"
echo ""
echo "🔗 View settings at: https://github.com/${REPO}/settings/branches"