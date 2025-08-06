#!/bin/bash

# BMAD Quick Launcher
# Easy access to BMAD squad configurations

echo "🤖 BMAD Squad Launcher"
echo ""
echo "Select configuration:"
echo "1) Basic BMAD Squad (5 agents)"
echo "2) Full Autonomous Squad (10 agents)"
echo "3) Kill all BMAD sessions"
echo "4) Exit"
echo ""
read -p "Choice [1-4]: " choice

case $choice in
    1)
        echo "Starting Basic BMAD Squad..."
        ./scripts/bmad-squad-setup.sh
        ;;
    2)
        echo "Starting Full Autonomous Squad..."
        ./scripts/bmad-autonomous-squad.sh
        ;;
    3)
        echo "Killing all BMAD sessions..."
        tmux kill-session -t bmad-squad 2>/dev/null || true
        tmux kill-session -t bmad-autonomous 2>/dev/null || true
        echo "All sessions terminated."
        ;;
    4)
        echo "Goodbye!"
        exit 0
        ;;
    *)
        echo "Invalid choice. Please run again."
        exit 1
        ;;
esac