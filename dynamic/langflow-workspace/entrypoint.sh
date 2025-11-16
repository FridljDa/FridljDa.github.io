#!/bin/bash
# Don't use set -e here, as we want to continue even if upload fails
set -u  # Only fail on undefined variables

# Function to check if Langflow API is ready
wait_for_langflow() {
    echo "Waiting for Langflow API to be ready..."
    local max_attempts=60
    local attempt=0
    
    while [ $attempt -lt $max_attempts ]; do
        if curl --output /dev/null --silent --head --fail http://localhost:7860; then
            echo "Langflow API is ready!"
            return 0
        fi
        attempt=$((attempt + 1))
        echo "Attempt $attempt/$max_attempts: Langflow not ready yet, waiting 5 seconds..."
        sleep 5
    done
    
    echo "ERROR: Langflow API did not become ready within expected time"
    return 1
}

# Function to upload a single document
upload_single_document() {
    local file_path="$1"
    local display_name="${2:-$(basename "$file_path")}"
    
    if [ ! -f "$file_path" ]; then
        echo "WARNING: File $file_path not found. Skipping upload."
        return 1
    fi
    
    echo "Uploading $display_name to Langflow..."
    
    local response=$(curl -X POST "http://localhost:7860/api/v2/files/" \
        -H "accept: application/json" \
        -F "file=@$file_path" \
        -w "\n%{http_code}" \
        -s)
    
    local http_code=$(echo "$response" | tail -n1)
    local body=$(echo "$response" | sed '$d')
    
    if [ "$http_code" -eq 200 ] || [ "$http_code" -eq 201 ]; then
        echo "File $display_name uploaded successfully!"
        return 0
    else
        echo "WARNING: File $display_name upload returned HTTP $http_code"
        echo "Response: $body"
        return 1
    fi
}

# Function to upload all documents
upload_documents() {
    echo "Starting document upload process..."
    
    # Upload all important files
    upload_single_document "/app/content/repository-homepage.md" "repository-homepage.md" || true
    upload_single_document "/app/content/author-information.md" "author-information.md" || true
    upload_single_document "/app/content/resume.pdf" "resume.pdf" || true
    upload_single_document "/app/content/publication-preprint-cite.bib" "publication-preprint-cite.bib" || true
    upload_single_document "/app/content/publication-preprint.md" "publication-preprint.md" || true
    
    echo "Document upload process completed."
}

# Start Langflow in the background
# Try to use the original command from the base image, or fall back to langflow run
echo "Starting Langflow..."

# Check if we have arguments (original CMD), otherwise use default langflow command
if [ $# -gt 0 ]; then
    # Execute the provided command (original CMD from base image)
    "$@" &
    LANGFLOW_PID=$!
else
    # Fall back to langflow run if no command provided
    langflow run --host 0.0.0.0 --port 7860 &
    LANGFLOW_PID=$!
fi

# Give Langflow a moment to start and check if process is still running
sleep 2
if ! kill -0 $LANGFLOW_PID 2>/dev/null; then
    echo "ERROR: Langflow process failed to start"
    exit 1
fi

# Wait for Langflow to be ready
if wait_for_langflow; then
    # Upload all documents (don't fail container if upload fails)
    upload_documents || echo "WARNING: Some document uploads failed, but continuing..."
else
    echo "ERROR: Failed to wait for Langflow. Container will continue but files may not be uploaded."
fi

# Wait for the Langflow process to keep container running
wait $LANGFLOW_PID

