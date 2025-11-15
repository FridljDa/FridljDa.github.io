FROM langflowai/langflow:1.6.7

# Switch to root to install curl
USER root

# Install curl for making HTTP requests
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

# Switch back to the original user (if the base image uses a non-root user)
# Note: docker-compose.yml sets user: root, so this may not be necessary

# Copy the entrypoint script into the container
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

# Set the entrypoint script
ENTRYPOINT ["/entrypoint.sh"]

