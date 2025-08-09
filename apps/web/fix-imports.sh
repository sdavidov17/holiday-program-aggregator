#!/bin/bash

# Fix SubscriptionStatus imports
echo "Fixing SubscriptionStatus imports..."
find src -type f \( -name "*.ts" -o -name "*.tsx" \) -exec grep -l "import.*SubscriptionStatus.*from.*@prisma/client" {} \; | while read file; do
  echo "Fixing: $file"
  # Replace the import
  sed -i '' "s/import { SubscriptionStatus }/import { SubscriptionStatus }/g" "$file"
  sed -i '' "s/from ['\"]@prisma\/client['\"]/from '~\/server\/db'/g" "$file"
done

# Fix files that import both SubscriptionStatus and other things from @prisma/client
echo "Fixing mixed imports..."
files=(
  "src/services/subscription.service.ts"
  "src/services/subscription-lifecycle.ts"
)

for file in "${files[@]}"; do
  if [ -f "$file" ]; then
    echo "Checking: $file"
    # Add additional import for SubscriptionStatus from db
    if grep -q "SubscriptionStatus" "$file"; then
      # Check if already has the import
      if ! grep -q "from ['\"]~\/server\/db['\"]" "$file"; then
        # Add import after the @prisma/client import
        sed -i '' "/import.*from.*@prisma\/client/a\\
import { SubscriptionStatus } from '~/server/db';" "$file"
      fi
      # Remove SubscriptionStatus from @prisma/client import
      sed -i '' "s/, SubscriptionStatus//g" "$file"
      sed -i '' "s/SubscriptionStatus, //g" "$file"
    fi
  fi
done

echo "Done!"