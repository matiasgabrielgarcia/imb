#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}====================================${NC}"
echo -e "${YELLOW}Installing Public Site Dependencies${NC}"
echo -e "${YELLOW}====================================${NC}\n"

# Check if public-site directory exists
if [ ! -d "public-site" ]; then
    echo -e "${RED}Error: public-site directory not found${NC}"
    exit 1
fi

# Check if package.json exists
if [ ! -f "public-site/package.json" ]; then
    echo -e "${RED}Error: package.json not found in public-site directory${NC}"
    exit 1
fi

cd public-site

echo -e "Installing dependencies...\n"
npm install

if [ $? -eq 0 ]; then
    echo -e "\n${GREEN}====================================${NC}"
    echo -e "${GREEN}Installation completed successfully!${NC}"
    echo -e "${GREEN}====================================${NC}\n"
    echo -e "You can now start all services with:"
    echo -e "  ${YELLOW}./start-all.sh${NC}\n"
    echo -e "Or start just the public site with:"
    echo -e "  ${YELLOW}cd public-site && npm run dev${NC}\n"
else
    echo -e "\n${RED}====================================${NC}"
    echo -e "${RED}Installation failed!${NC}"
    echo -e "${RED}====================================${NC}\n"
    echo -e "Please check the error messages above.\n"
    exit 1
fi

