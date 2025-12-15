#!/bin/bash

echo "========================================"
echo "Sanskaar Frontend - Installation Script"
echo "========================================"
echo ""

echo "Step 1: Cleaning old installations..."
rm -rf node_modules package-lock.json build
echo "Done!"
echo ""

echo "Step 2: Clearing npm cache..."
npm cache clean --force
echo "Done!"
echo ""

echo "Step 3: Installing dependencies (this may take 2-3 minutes)..."
npm install
echo "Done!"
echo ""

echo "========================================"
echo "Installation Complete!"
echo "========================================"
echo ""
echo "To start the app, run:"
echo "npm start"
echo ""
