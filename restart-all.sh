#!/bin/bash

echo "========================================"
echo "  Dental Clinic - Clean Restart Script"
echo "========================================"
echo ""

echo "[1/4] Stopping all Node processes..."
pkill -f node 2>/dev/null
if [ $? -eq 0 ]; then
    echo "✓ Node processes stopped"
else
    echo "ℹ No Node processes were running"
fi
echo ""

echo "[2/4] Waiting for ports to be released..."
sleep 2
echo "✓ Ports released"
echo ""

echo "[3/4] Starting API server on port 3000..."
cd api
npm start &
API_PID=$!
cd ..
sleep 3
echo "✓ API server started (PID: $API_PID)"
echo ""

echo "[4/4] Starting Frontend on port 5173..."
npm run dev &
FRONTEND_PID=$!
echo "✓ Frontend started (PID: $FRONTEND_PID)"
echo ""

echo "========================================"
echo "  All services started successfully!"
echo "========================================"
echo ""
echo "API Server:  http://localhost:3000"
echo "Frontend:    http://localhost:5173"
echo ""
echo "To stop all services, run:"
echo "  kill $API_PID $FRONTEND_PID"
echo ""
