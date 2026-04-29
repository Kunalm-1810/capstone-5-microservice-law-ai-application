#!/bin/bash

echo "=== Starting Cleanup ==="

# remove stopped containers
docker container prune -f

# remove unused images
docker image prune -a -f

# remove unused volumes
docker volume prune -f

# remove unused networks
docker network prune -f

# clean jenkins workspaces older than 7 days
find /var/lib/jenkins/workspace -maxdepth 1 -mindepth 1 -type d -mtime +7 -exec rm -rf {} \;

# clean jenkins build logs older than 30 days
find /var/lib/jenkins/jobs -name "*.log" -mtime +30 -delete

echo "=== Cleanup Done ==="
df -h /
