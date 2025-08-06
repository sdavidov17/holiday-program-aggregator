#!/bin/bash

# Setup script for ngrok and Stripe webhook testing
# This script helps you set up ngrok for local Stripe webhook testing

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== Ngrok & Stripe Webhook Setup ===${NC}"
echo ""

# Check if ngrok is installed
check_ngrok() {
    if command -v ngrok &> /dev/null; then
        echo -e "${GREEN}✓ ngrok is installed${NC}"
        return 0
    else
        echo -e "${RED}✗ ngrok is not installed${NC}"
        return 1
    fi
}

# Install ngrok
install_ngrok() {
    echo -e "${YELLOW}Installing ngrok...${NC}"
    
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        if command -v brew &> /dev/null; then
            echo "Installing ngrok via Homebrew..."
            brew install ngrok/ngrok/ngrok
        else
            echo -e "${RED}Homebrew not found. Please install Homebrew first or download ngrok manually from https://ngrok.com/download${NC}"
            exit 1
        fi
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        # Linux
        echo "Downloading ngrok for Linux..."
        curl -s https://ngrok-agent.s3.amazonaws.com/ngrok.asc | sudo tee /etc/apt/trusted.gpg.d/ngrok.asc >/dev/null
        echo "deb https://ngrok-agent.s3.amazonaws.com buster main" | sudo tee /etc/apt/sources.list.d/ngrok.list
        sudo apt update && sudo apt install ngrok
    else
        echo -e "${RED}Unsupported OS. Please download ngrok manually from https://ngrok.com/download${NC}"
        exit 1
    fi
}

# Check if .env file exists
check_env() {
    if [ -f "apps/web/.env" ]; then
        echo -e "${GREEN}✓ .env file found${NC}"
        return 0
    else
        echo -e "${RED}✗ .env file not found${NC}"
        echo -e "${YELLOW}Creating .env from .env.example...${NC}"
        cp apps/web/.env.example apps/web/.env
        echo -e "${GREEN}✓ Created .env file${NC}"
        echo -e "${YELLOW}Please update the .env file with your Stripe keys${NC}"
        return 1
    fi
}

# Check Stripe configuration
check_stripe_config() {
    if [ -f "apps/web/.env" ]; then
        # Check for Stripe keys (without exposing them)
        if grep -q "STRIPE_SECRET_KEY=\"sk_" apps/web/.env && \
           grep -q "STRIPE_ANNUAL_PRICE_ID=\"price_" apps/web/.env && \
           grep -q "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=\"pk_" apps/web/.env; then
            echo -e "${GREEN}✓ Stripe keys are configured${NC}"
            return 0
        else
            echo -e "${RED}✗ Stripe keys are not properly configured${NC}"
            echo -e "${YELLOW}Please update your .env file with valid Stripe keys${NC}"
            echo ""
            echo "Required keys:"
            echo "  STRIPE_SECRET_KEY=\"sk_test_...\""
            echo "  STRIPE_ANNUAL_PRICE_ID=\"price_...\""
            echo "  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=\"pk_test_...\""
            echo "  STRIPE_WEBHOOK_SECRET=\"whsec_...\" (will be set up next)"
            return 1
        fi
    fi
}

# Start ngrok
start_ngrok() {
    echo -e "${BLUE}Starting ngrok...${NC}"
    echo ""
    echo -e "${YELLOW}Opening ngrok in a new terminal window...${NC}"
    
    # Create a temporary script to run ngrok
    cat > /tmp/ngrok-stripe.sh << 'EOF'
#!/bin/bash
echo -e "\033[0;34m=== Ngrok for Stripe Webhooks ===\033[0m"
echo ""
echo -e "\033[1;33mStarting ngrok tunnel to localhost:3000...\033[0m"
echo ""
ngrok http 3000
EOF
    
    chmod +x /tmp/ngrok-stripe.sh
    
    # Open in new terminal based on OS
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        osascript -e 'tell app "Terminal" to do script "/tmp/ngrok-stripe.sh"'
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        # Linux
        if command -v gnome-terminal &> /dev/null; then
            gnome-terminal -- bash -c "/tmp/ngrok-stripe.sh; exec bash"
        elif command -v xterm &> /dev/null; then
            xterm -e "/tmp/ngrok-stripe.sh" &
        else
            echo -e "${YELLOW}Could not open new terminal. Please run this command manually:${NC}"
            echo "ngrok http 3000"
        fi
    fi
    
    echo ""
    echo -e "${GREEN}Ngrok should now be running in a new terminal window${NC}"
    echo ""
    sleep 3
}

# Display setup instructions
show_instructions() {
    echo -e "${BLUE}=== Stripe Webhook Setup Instructions ===${NC}"
    echo ""
    echo "1. Look at the ngrok terminal window for your public URL"
    echo "   It will look like: https://abc123.ngrok.io"
    echo ""
    echo "2. Go to your Stripe Dashboard:"
    echo "   ${PURPLE}https://dashboard.stripe.com/test/webhooks${NC}"
    echo ""
    echo "3. Click 'Add endpoint'"
    echo ""
    echo "4. Set the endpoint URL to:"
    echo "   ${GREEN}https://YOUR-NGROK-URL.ngrok.io/api/stripe/webhook${NC}"
    echo ""
    echo "5. Select these events:"
    echo "   - checkout.session.completed"
    echo "   - customer.subscription.created"
    echo "   - customer.subscription.updated"
    echo "   - customer.subscription.deleted"
    echo "   - invoice.payment_succeeded"
    echo "   - invoice.payment_failed"
    echo ""
    echo "6. Click 'Add endpoint'"
    echo ""
    echo "7. Copy the 'Signing secret' (starts with whsec_)"
    echo ""
    echo "8. Update your .env file:"
    echo "   ${YELLOW}STRIPE_WEBHOOK_SECRET=\"whsec_...\"${NC}"
    echo ""
    echo -e "${GREEN}=== Testing Instructions ===${NC}"
    echo ""
    echo "1. Make sure your dev server is running:"
    echo "   ${BLUE}pnpm dev${NC}"
    echo ""
    echo "2. Test a subscription:"
    echo "   - Go to http://localhost:3000"
    echo "   - Sign in"
    echo "   - Go to your profile"
    echo "   - Click 'Manage Subscription'"
    echo "   - Click 'Subscribe Now'"
    echo ""
    echo "3. Use test card: 4242 4242 4242 4242"
    echo ""
    echo "4. Check the Stripe webhook logs:"
    echo "   ${PURPLE}https://dashboard.stripe.com/test/webhooks${NC}"
    echo ""
    echo -e "${YELLOW}Note: ngrok URL changes each time you restart it${NC}"
    echo -e "${YELLOW}You'll need to update the webhook endpoint in Stripe${NC}"
}

# Alternative: Use Stripe CLI
show_stripe_cli_alternative() {
    echo ""
    echo -e "${BLUE}=== Alternative: Stripe CLI ===${NC}"
    echo ""
    echo "Instead of ngrok, you can use Stripe CLI:"
    echo ""
    echo "1. Install Stripe CLI:"
    echo "   ${YELLOW}brew install stripe/stripe-cli/stripe${NC}"
    echo ""
    echo "2. Login to Stripe:"
    echo "   ${YELLOW}stripe login${NC}"
    echo ""
    echo "3. Forward webhooks to localhost:"
    echo "   ${YELLOW}stripe listen --forward-to localhost:3000/api/stripe/webhook${NC}"
    echo ""
    echo "4. The CLI will show you the webhook signing secret"
    echo "   Update your .env with this secret"
    echo ""
    echo "This is easier as you don't need to update the endpoint URL"
}

# Main execution
main() {
    echo -e "${PURPLE}This script will help you set up ngrok for testing Stripe webhooks locally${NC}"
    echo ""
    
    # Check if we're in the project root
    if [ ! -f "package.json" ] || [ ! -d "apps/web" ]; then
        echo -e "${RED}Error: Please run this script from the project root directory${NC}"
        exit 1
    fi
    
    # Check ngrok installation
    if ! check_ngrok; then
        read -p "Would you like to install ngrok? (y/n) " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            install_ngrok
        else
            echo -e "${RED}ngrok is required for webhook testing. Exiting.${NC}"
            exit 1
        fi
    fi
    
    # Check .env file
    check_env
    
    # Check Stripe configuration
    if ! check_stripe_config; then
        echo ""
        echo -e "${RED}Please configure your Stripe keys before continuing${NC}"
        echo "See: docs/stripe-setup.md"
        exit 1
    fi
    
    # Start ngrok
    read -p "Would you like to start ngrok now? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        start_ngrok
    fi
    
    # Show instructions
    show_instructions
    
    # Show Stripe CLI alternative
    show_stripe_cli_alternative
}

# Run main function
main