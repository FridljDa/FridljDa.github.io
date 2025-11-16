FROM langflowai/langflow:1.6.7

# Switch to root to install curl
USER root

# Install curl for making HTTP requests
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

# Create directory for content files
RUN mkdir -p /app/content

# Copy the entrypoint script into the container
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

# Copy content files (created by render.yaml buildCommand)
# The buildCommand ensures the content directory exists before Docker build
# If content/ doesn't exist, the buildCommand should create at least an empty directory
COPY content/ /app/content/

# Set the entrypoint script
ENTRYPOINT ["/entrypoint.sh"]

