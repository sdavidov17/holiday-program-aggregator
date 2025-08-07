#!/bin/bash
# Simple rollback script for emergency situations

echo "🚨 Emergency Rollback Script"
echo "=========================="

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
  echo "❌ Error: Run this script from the repository root"
  exit 1
fi

# Get the last few tags
echo "Recent releases:"
git tag -l "v*" | sort -V | tail -5

echo ""
echo "Current production deployment:"
echo "- Check Vercel dashboard for current deployment"
echo ""

# Provide rollback options
echo "Rollback options:"
echo "1. Vercel Dashboard (Recommended):"
echo "   - Go to https://vercel.com/dashboard"
echo "   - Click on your project"
echo "   - Go to 'Deployments' tab"
echo "   - Find a previous stable deployment"
echo "   - Click '...' menu → 'Promote to Production'"
echo ""
echo "2. Git Revert (for code rollback):"
echo "   git checkout main"
echo "   git pull origin main"
echo "   git revert -m 1 HEAD"
echo "   git push origin main"
echo ""
echo "3. Deploy specific tag:"
echo "   git checkout v2025.08.06-abc123"
echo "   vercel --prod --yes"
echo ""

read -p "Do you want to create a rollback commit? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
  git checkout main
  git pull origin main
  
  # Create revert commit
  git revert -m 1 HEAD --no-edit
  
  # Tag the rollback
  ROLLBACK_TAG="v$(date +%Y.%m.%d)-rollback-$(git rev-parse --short HEAD)"
  git tag $ROLLBACK_TAG
  
  echo "✅ Created rollback commit and tag: $ROLLBACK_TAG"
  echo "Push with: git push origin main --tags"
else
  echo "ℹ️  No changes made. Use Vercel dashboard for instant rollback."
fi