#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
NC='\033[0m' # No Color

echo -e "${RED}Stopping all services...${NC}\n"

# Check if PID file exists
if [ -f .services.pid ]; then
    # Read PIDs and kill processes
    while read pid; do
        if ps -p $pid > /dev/null 2>&1; then
            echo -e "Killing process $pid..."
            kill $pid 2>/dev/null || kill -9 $pid 2>/dev/null
        else
            echo -e "Process $pid already stopped"
        fi
    done < .services.pid
    
    # Remove PID file
    rm .services.pid
    echo -e "\n${GREEN}All services stopped!${NC}"
else
    # Try to find and kill by name
    echo -e "No PID file found. Attempting to find processes..."
    
    pkill -f "npm run dev" 2>/dev/null && echo -e "${GREEN}Stopped all npm dev processes${NC}" || echo -e "No processes found"
fi

# Clean up log files
if [ -f back.log ] || [ -f front.log ] || [ -f wapp.log ] || [ -f public-site.log ]; then
    read -p "Delete log files? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        rm -f back.log front.log wapp.log public-site.log
        echo -e "${GREEN}Log files deleted${NC}"
    fi
fi

