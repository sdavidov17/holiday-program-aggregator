#!/bin/bash

# Test runner with automatic test user cleanup
# This ensures test users are cleaned up before and after test runs

set -e

echo "🧹 Starting test run with user cleanup..."

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if database is running (for integration tests)
if [[ "$1" == "integration" ]] || [[ "$2" == "integration" ]]; then
  echo -e "${YELLOW}Checking PostgreSQL connection...${NC}"
  if docker-compose ps postgres | grep -q "running"; then
    echo -e "${GREEN}✅ PostgreSQL is running${NC}"
  else
    echo -e "${YELLOW}Starting PostgreSQL...${NC}"
    docker-compose up -d postgres
    sleep 5
  fi
fi

# Clean up test users before running tests
echo -e "${YELLOW}Cleaning up test users before tests...${NC}"
npx tsx -e "
import { cleanupTestUsers } from './src/__tests__/helpers/test-users';
cleanupTestUsers()
  .then(() => console.log('✅ Pre-test cleanup complete'))
  .catch(err => console.warn('⚠️ Pre-test cleanup failed:', err.message));
"

# Run tests based on arguments
if [[ "$1" == "watch" ]]; then
  echo -e "${GREEN}Running tests in watch mode...${NC}"
  npm test -- --watch
elif [[ "$1" == "coverage" ]]; then
  echo -e "${GREEN}Running tests with coverage...${NC}"
  npm test -- --coverage
elif [[ "$1" == "integration" ]]; then
  echo -e "${GREEN}Running integration tests...${NC}"
  npm test -- src/__tests__/integration
elif [[ "$1" == "unit" ]]; then
  echo -e "${GREEN}Running unit tests only...${NC}"
  npm test -- src/__tests__/unit
elif [[ -n "$1" ]]; then
  echo -e "${GREEN}Running specific test: $1${NC}"
  npm test -- "$@"
else
  echo -e "${GREEN}Running all tests...${NC}"
  npm test
fi

TEST_EXIT_CODE=$?

# Clean up test users after running tests
echo -e "${YELLOW}Cleaning up test users after tests...${NC}"
npx tsx -e "
import { cleanupTestUsers } from './src/__tests__/helpers/test-users';
cleanupTestUsers()
  .then(() => console.log('✅ Post-test cleanup complete'))
  .catch(err => console.warn('⚠️ Post-test cleanup failed:', err.message));
"

# Report results
if [ $TEST_EXIT_CODE -eq 0 ]; then
  echo -e "${GREEN}✅ Tests passed successfully!${NC}"
else
  echo -e "${RED}❌ Tests failed with exit code $TEST_EXIT_CODE${NC}"
fi

exit $TEST_EXIT_CODE