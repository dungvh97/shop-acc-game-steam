#!/bin/bash

echo "Starting Shop Acc Game Platform..."

ensure_port_free() {
  PORT="$1"
  echo "Checking if port $PORT is in use..."
  PIDS=""
  if command -v lsof >/dev/null 2>&1; then
    PIDS=$(lsof -t -iTCP:"$PORT" -sTCP:LISTEN 2>/dev/null || true)
  elif command -v ss >/dev/null 2>&1; then
    PIDS=$(ss -ltnp 2>/dev/null | awk -v p=":"$PORT" '$4 ~ p { if ($6 ~ /pid=/) { match($6, /pid=([0-9]+)/, m); if (m[1] != "") print m[1] } }')
  elif command -v fuser >/dev/null 2>&1; then
    PIDS=$(fuser -n tcp "$PORT" 2>/dev/null || true)
  fi

  if [ -n "$PIDS" ]; then
    echo "Port $PORT is in use by PID(s): $PIDS"
    echo "Killing process(es) to free port $PORT..."
    kill -9 $PIDS 2>/dev/null || true
    sleep 1
  else
    echo "Port $PORT is free."
  fi
}

ensure_port_free 5432

echo "Starting PostgreSQL database..."
docker-compose up -d

echo "Waiting for database to be ready..."
sleep 10

echo "Starting Spring Boot backend..."
cd backend
gnome-terminal -- bash -c "mvn spring-boot:run; exec bash" &
cd ..

echo "Starting React frontend with Vite..."
cd frontend
gnome-terminal -- bash -c "npm run dev; exec bash" &
cd ..

echo "All services started!"
echo "Backend: http://localhost:8080"
echo "Frontend: http://localhost:3000"
echo "pgAdmin: http://localhost:5050"
echo ""
echo "Press Ctrl+C to stop all services..."

# Wait for user to stop
trap 'echo "Stopping all services..."; docker-compose down; pkill -f "mvn spring-boot:run"; pkill -f "npm run dev"; echo "All services stopped."; exit' INT

wait
