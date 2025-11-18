FROM langflowai/langflow:1.6.7

# Switch to root to install curl
USER root

# Install curl and create content directory in one layer (better caching)
# This layer will be cached unless apt packages or directory structure changes
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/* && \
    mkdir -p /app/content

# Copy the entrypoint scripts and make them executable in one layer
# This layer will be cached unless entrypoint scripts change
COPY entrypoint.sh /entrypoint.sh
COPY entrypoint_debug.sh /entrypoint_debug.sh
RUN chmod +x /entrypoint.sh /entrypoint_debug.sh

# Copy examples first (changes less frequently than content)
# This layer will be cached unless examples/ changes
COPY examples/DocumentQA.json /app/examples/DocumentQA.json

# Copy content files last (changes most frequently)
# The buildCommand ensures the content directory exists before Docker build
# This layer will be rebuilt when content changes
COPY content/ /app/content/

# Copy flow JSON to content directory (combines with content layer for better caching)
RUN cp /app/examples/DocumentQA.json /app/content/document-qa-flow.json 2>/dev/null || echo "WARNING: DocumentQA.json not found in examples/"

# Switch back to non-root user for security (best practice)
# Check if langflow user exists in base image, if not create one
# Use the same UID/GID as the base image's user if it exists
RUN if id -u langflow >/dev/null 2>&1; then \
        echo "Using existing langflow user"; \
    else \
        echo "Creating langflow user"; \
        useradd -m -u 1000 -s /bin/bash langflow || \
        useradd -m -s /bin/bash langflow; \
    fi && \
    chown -R langflow:langflow /app /entrypoint.sh /entrypoint_debug.sh

# Switch to non-root user
USER langflow

# Set the entrypoint script (using debug version to identify startup issues)
ENTRYPOINT ["/entrypoint_debug.sh"]

