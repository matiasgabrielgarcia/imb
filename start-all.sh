#!/bin/bash

# Colors for output
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
MAGENTA='\033[0;35m'
GREEN='\033[0;32m'
NC='\033[0m' # No Color

echo -e "${GREEN}Starting all services in background...${NC}\n"

# Get the script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"

# Start Backend
echo -e "${CYAN}Starting Backend on port 3000...${NC}"
cd "$SCRIPT_DIR/back"
npm run dev > "$SCRIPT_DIR/back.log" 2>&1 &
BACK_PID=$!
echo -e "  PID: $BACK_PID"

# Start Frontend  
echo -e "${YELLOW}Starting Frontend on port 5173...${NC}"
cd "$SCRIPT_DIR/front"
npm run dev > "$SCRIPT_DIR/front.log" 2>&1 &
FRONT_PID=$!
echo -e "  PID: $FRONT_PID"

# Start WhatsApp Service
echo -e "${MAGENTA}Starting WhatsApp Service on port 3002...${NC}"
cd "$SCRIPT_DIR/wapp"
npm run dev > "$SCRIPT_DIR/wapp.log" 2>&1 &
WAPP_PID=$!
echo -e "  PID: $WAPP_PID"

# Start Public Site
echo -e "\033[0;32mStarting Public Site on port 5174...${NC}"
cd "$SCRIPT_DIR/public-site"
npm run dev > "$SCRIPT_DIR/public-site.log" 2>&1 &
PUBLIC_PID=$!
echo -e "  PID: $PUBLIC_PID"

cd "$SCRIPT_DIR"

# Save PIDs to file
echo $BACK_PID > .services.pid
echo $FRONT_PID >> .services.pid
echo $WAPP_PID >> .services.pid
echo $PUBLIC_PID >> .services.pid

echo -e "\n${GREEN}✓ All services started!${NC}\n"
echo -e "${CYAN}Backend:${NC}  http://localhost:3001  (PID: $BACK_PID)"
echo -e "${YELLOW}Frontend (Backoffice):${NC} http://localhost:5173  (PID: $FRONT_PID)"
echo -e "\033[0;32mPublic Site:${NC} http://localhost:5174  (PID: $PUBLIC_PID)"
echo -e "${MAGENTA}WhatsApp:${NC} http://localhost:3002  (PID: $WAPP_PID)"

echo -e "\n${GREEN}View logs:${NC}"
echo -e "  tail -f back.log"
echo -e "  tail -f front.log"
echo -e "  tail -f public-site.log"
echo -e "  tail -f wapp.log"

echo -e "\n${GREEN}Stop services:${NC}"
echo -e "  ./stop-all.sh"
echo -e "\nServices are running in the background. You can close this terminal."

