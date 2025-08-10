#!/usr/bin/env bash

# Docker Database Management Script
# Provides easy commands for managing PostgreSQL in Docker

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Load environment variables
if [ -f .env.docker ]; then
  export $(cat .env.docker | grep -v '^#' | xargs)
elif [ -f .env ]; then
  export $(cat .env | grep -v '^#' | xargs)
fi

# Default values
POSTGRES_USER=${POSTGRES_USER:-postgres}
POSTGRES_PASSWORD=${POSTGRES_PASSWORD:-postgres}
POSTGRES_DB=${POSTGRES_DB:-holiday_aggregator}

function print_help() {
  echo "Docker Database Management"
  echo ""
  echo "Usage: $0 [command]"
  echo ""
  echo "Commands:"
  echo "  start       Start PostgreSQL container"
  echo "  stop        Stop PostgreSQL container"
  echo "  restart     Restart PostgreSQL container"
  echo "  reset       Reset database (WARNING: destroys all data)"
  echo "  logs        Show PostgreSQL logs"
  echo "  shell       Open PostgreSQL shell"
  echo "  backup      Backup database"
  echo "  restore     Restore database from backup"
  echo "  status      Show container status"
  echo "  pgadmin     Start pgAdmin (database UI)"
  echo ""
}

function start_db() {
  echo -e "${GREEN}Starting PostgreSQL...${NC}"
  docker-compose up -d postgres
  echo -e "${GREEN}Waiting for database to be ready...${NC}"
  sleep 3
  docker-compose exec -T postgres pg_isready -U $POSTGRES_USER -d $POSTGRES_DB
  echo -e "${GREEN}PostgreSQL is ready!${NC}"
  echo -e "Connection string: postgresql://$POSTGRES_USER:$POSTGRES_PASSWORD@localhost:5432/$POSTGRES_DB"
}

function stop_db() {
  echo -e "${YELLOW}Stopping PostgreSQL...${NC}"
  docker-compose down
  echo -e "${GREEN}PostgreSQL stopped.${NC}"
}

function restart_db() {
  stop_db
  start_db
}

function reset_db() {
  echo -e "${RED}WARNING: This will destroy all data in the database!${NC}"
  read -p "Are you sure? (y/N): " -n 1 -r
  echo
  if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}Resetting database...${NC}"
    docker-compose down -v
    start_db
    echo -e "${GREEN}Database reset complete.${NC}"
  else
    echo "Reset cancelled."
  fi
}

function show_logs() {
  docker-compose logs -f postgres
}

function db_shell() {
  echo -e "${GREEN}Opening PostgreSQL shell...${NC}"
  docker-compose exec postgres psql -U $POSTGRES_USER -d $POSTGRES_DB
}

function backup_db() {
  BACKUP_FILE="backup_$(date +%Y%m%d_%H%M%S).sql"
  echo -e "${GREEN}Creating backup: $BACKUP_FILE${NC}"
  docker-compose exec -T postgres pg_dump -U $POSTGRES_USER -d $POSTGRES_DB > $BACKUP_FILE
  echo -e "${GREEN}Backup created: $BACKUP_FILE${NC}"
}

function restore_db() {
  if [ -z "$2" ]; then
    echo -e "${RED}Please specify backup file${NC}"
    echo "Usage: $0 restore <backup_file>"
    exit 1
  fi
  
  BACKUP_FILE=$2
  if [ ! -f "$BACKUP_FILE" ]; then
    echo -e "${RED}Backup file not found: $BACKUP_FILE${NC}"
    exit 1
  fi
  
  echo -e "${YELLOW}Restoring from: $BACKUP_FILE${NC}"
  docker-compose exec -T postgres psql -U $POSTGRES_USER -d $POSTGRES_DB < $BACKUP_FILE
  echo -e "${GREEN}Restore complete.${NC}"
}

function show_status() {
  echo -e "${GREEN}Database Status:${NC}"
  docker-compose ps postgres
  echo ""
  echo -e "${GREEN}Connection Info:${NC}"
  echo "Host: localhost"
  echo "Port: 5432"
  echo "Database: $POSTGRES_DB"
  echo "User: $POSTGRES_USER"
  echo "URL: postgresql://$POSTGRES_USER:****@localhost:5432/$POSTGRES_DB"
}

function start_pgadmin() {
  echo -e "${GREEN}Starting pgAdmin...${NC}"
  docker-compose --profile tools up -d pgadmin
  echo -e "${GREEN}pgAdmin started!${NC}"
  echo "Access at: http://localhost:5050"
  echo "Email: ${PGADMIN_EMAIL:-admin@example.com}"
  echo "Password: ${PGADMIN_PASSWORD:-admin}"
}

# Main command handler
case "$1" in
  start)
    start_db
    ;;
  stop)
    stop_db
    ;;
  restart)
    restart_db
    ;;
  reset)
    reset_db
    ;;
  logs)
    show_logs
    ;;
  shell)
    db_shell
    ;;
  backup)
    backup_db
    ;;
  restore)
    restore_db "$@"
    ;;
  status)
    show_status
    ;;
  pgadmin)
    start_pgadmin
    ;;
  *)
    print_help
    ;;
esac