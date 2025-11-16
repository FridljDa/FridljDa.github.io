FROM langflowai/langflow:1.6.7

# Switch to root to install curl
USER root

# Install curl and create content directory in one layer (better caching)
# This layer will be cached unless apt packages or directory structure changes
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/* && \
    mkdir -p /app/content

# Copy the entrypoint script and make it executable in one layer
# This layer will be cached unless entrypoint.sh changes
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

# Copy examples first (changes less frequently than content)
# This layer will be cached unless examples/ changes
COPY examples/ /app/examples/

# Copy content files last (changes most frequently)
# The buildCommand ensures the content directory exists before Docker build
# This layer will be rebuilt when content changes
COPY content/ /app/content/

# Copy flow JSON to content directory (combines with content layer for better caching)
RUN cp "/app/examples/Document Q&A.json" /app/content/document-qa-flow.json 2>/dev/null || echo "WARNING: Document Q&A.json not found in examples/"

# Set the entrypoint script
ENTRYPOINT ["/entrypoint.sh"]

