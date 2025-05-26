#!/bin/bash

# Scholar AI Frontend Docker Management Script
# Usage: ./docker.sh [command]

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
COMPOSE_FILE="docker/docker-compose.yml"
SERVICE_NAME="scholar-ai-frontend"
IMAGE_NAME="scholar-ai-frontend"

# Helper functions
print_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Docker is running
check_docker() {
    if ! docker info > /dev/null 2>&1; then
        print_error "Docker is not running. Please start Docker and try again."
        exit 1
    fi
}

# Build the Docker image
build() {
    print_info "Building Scholar AI Frontend Docker image..."
    check_docker
    
    docker-compose -f $COMPOSE_FILE build --no-cache
    
    if [ $? -eq 0 ]; then
        print_success "Docker image built successfully!"
    else
        print_error "Failed to build Docker image"
        exit 1
    fi
}

# Start the application
start() {
    print_info "Starting Scholar AI Frontend..."
    check_docker
    
    docker-compose -f $COMPOSE_FILE up -d
    
    if [ $? -eq 0 ]; then
        print_success "Scholar AI Frontend started successfully!"
        print_info "Application is running at: http://localhost:3000"
        print_info "Use './docker.sh logs' to view logs"
        print_info "Use './docker.sh stop' to stop the application"
    else
        print_error "Failed to start Scholar AI Frontend"
        exit 1
    fi
}

# Stop the application
stop() {
    print_info "Stopping Scholar AI Frontend..."
    check_docker
    
    docker-compose -f $COMPOSE_FILE down
    
    if [ $? -eq 0 ]; then
        print_success "Scholar AI Frontend stopped successfully!"
    else
        print_error "Failed to stop Scholar AI Frontend"
        exit 1
    fi
}

# Restart the application
restart() {
    print_info "Restarting Scholar AI Frontend..."
    stop
    start
}

# View logs
logs() {
    print_info "Showing logs for Scholar AI Frontend..."
    check_docker
    
    docker-compose -f $COMPOSE_FILE logs -f $SERVICE_NAME
}

# Show status
status() {
    print_info "Checking Scholar AI Frontend status..."
    check_docker
    
    docker-compose -f $COMPOSE_FILE ps
}

# Clean up (remove containers and images)
clean() {
    print_warning "This will remove all containers and images for Scholar AI Frontend"
    read -p "Are you sure? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        print_info "Cleaning up..."
        
        # Stop and remove containers
        docker-compose -f $COMPOSE_FILE down --rmi all --volumes --remove-orphans
        
        # Remove dangling images
        docker image prune -f
        
        print_success "Cleanup completed!"
    else
        print_info "Cleanup cancelled"
    fi
}

# Build and start in one command
up() {
    print_info "Building and starting Scholar AI Frontend..."
    build
    start
}

# Show help
help() {
    echo "Scholar AI Frontend Docker Management Script"
    echo ""
    echo "Usage: ./docker.sh [command]"
    echo ""
    echo "Commands:"
    echo "  build     Build the Docker image"
    echo "  start     Start the application"
    echo "  stop      Stop the application"
    echo "  restart   Restart the application"
    echo "  up        Build and start the application"
    echo "  logs      Show application logs"
    echo "  status    Show container status"
    echo "  clean     Remove containers and images"
    echo "  help      Show this help message"
    echo ""
    echo "Examples:"
    echo "  ./docker.sh build"
    echo "  ./docker.sh start"
    echo "  ./docker.sh logs"
    echo "  ./docker.sh stop"
}

# Main script logic
case "${1:-help}" in
    build)
        build
        ;;
    start)
        start
        ;;
    stop)
        stop
        ;;
    restart)
        restart
        ;;
    up)
        up
        ;;
    logs)
        logs
        ;;
    status)
        status
        ;;
    clean)
        clean
        ;;
    help|--help|-h)
        help
        ;;
    *)
        print_error "Unknown command: $1"
        echo ""
        help
        exit 1
        ;;
esac 