#!/bin/bash
# Don't use set -e here, as we want to continue even if upload fails
set -u  # Only fail on undefined variables

# Use Render's PORT environment variable, fallback to 7860 for local development
PORT=${PORT:-7860}
# Set LANGFLOW_PORT to match PORT so Langflow uses the correct port
export LANGFLOW_PORT=${PORT}

# Function to check if Langflow API is ready
wait_for_langflow() {
    echo "Waiting for Langflow API to be ready..."
    local max_attempts=60
    local attempt=0
    
    while [ $attempt -lt $max_attempts ]; do
        if curl --output /dev/null --silent --head --fail http://localhost:${PORT}; then
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
# Always uploads, overwriting if file already exists (repo is source of truth)
upload_single_document() {
    local file_path="$1"
    local display_name="${2:-$(basename "$file_path")}"
    
    if [ ! -f "$file_path" ]; then
        echo "WARNING: File $file_path not found. Skipping upload."
        return 1
    fi
    
    echo "Uploading $display_name to Langflow (will overwrite if exists)..."
    
    local response=$(curl -X POST "http://localhost:${PORT}/api/v2/files/" \
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

# Function to check if a flow with the given name already exists
# Returns flow ID (UUID) to stdout if found, nothing otherwise
check_flow_exists() {
    local flow_name="$1"
    
    # Log to stderr so it doesn't interfere with stdout (flow ID output)
    echo "Checking if flow '$flow_name' already exists..." >&2
    
    # Try v2 API first, then fallback to v1
    # Use --compressed to handle gzip responses
    local response=$(curl -X GET "http://localhost:${PORT}/api/v2/flows/?get_all=true" \
        -H "accept: application/json" \
        -H "Accept-Encoding: gzip" \
        --compressed \
        -w "\n%{http_code}" \
        -s 2>/dev/null)
    
    local http_code=$(echo "$response" | tail -n1)
    local body=$(echo "$response" | sed '$d')
    
    # If v2 fails, try v1
    if [ "$http_code" -ne 200 ]; then
        response=$(curl -X GET "http://localhost:${PORT}/api/v1/flows/?get_all=true" \
            -H "accept: application/json" \
            -H "Accept-Encoding: gzip" \
            --compressed \
            -w "\n%{http_code}" \
            -s 2>/dev/null)
        http_code=$(echo "$response" | tail -n1)
        body=$(echo "$response" | sed '$d')
    fi
    
    if [ "$http_code" -eq 200 ]; then
        # Use python for reliable JSON parsing - output ONLY the flow ID to stdout
        local flow_id=$(echo "$body" | python3 -c "
import sys, json
try:
    data = json.load(sys.stdin)
    flows = data if isinstance(data, list) else data.get('flows', [])
    for flow in flows:
        if flow.get('name') == '$flow_name':
            flow_id = flow.get('id', '')
            # Only output if it's a valid UUID
            if flow_id and len(flow_id) == 36:
                print(flow_id)
                sys.exit(0)
except Exception as e:
    pass
sys.exit(1)
" 2>/dev/null)
        
        # If python succeeded and returned a valid UUID, return it
        if [ -n "$flow_id" ] && [ ${#flow_id} -eq 36 ] && echo "$flow_id" | grep -qE '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'; then
            echo "$flow_id"
            return 0
        fi
    fi
    
    return 1
}

# Function to import a flow from JSON file
# Idempotent: only imports if flow doesn't already exist (does not overwrite)
import_flow() {
    local flow_file="$1"
    local flow_name="$2"
    
    if [ ! -f "$flow_file" ]; then
        echo "WARNING: Flow file $flow_file not found. Skipping import."
        return 1
    fi
    
    # Check if flow already exists (idempotent - don't overwrite)
    # Redirect stderr to /dev/null to suppress the "Checking..." message
    local existing_flow_id=$(check_flow_exists "$flow_name" 2>/dev/null)
    
    # Validate that we got a proper UUID (36 chars with dashes)
    if [ -n "$existing_flow_id" ] && [ ${#existing_flow_id} -eq 36 ] && echo "$existing_flow_id" | grep -qE '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'; then
        echo "Flow '$flow_name' already exists with ID: $existing_flow_id (skipping import)"
        echo "$existing_flow_id" > /app/content/flow-id.txt
        return 0
    fi
    
    echo "Flow '$flow_name' not found. Importing from $flow_file..."
    
    # Try v2 API first, then fallback to v1
    local response=$(curl -X POST "http://localhost:${PORT}/api/v2/flows/upload/" \
        -H "accept: application/json" \
        -H "Content-Type: multipart/form-data" \
        -F "file=@$flow_file;type=application/json" \
        -w "\n%{http_code}" \
        -s 2>/dev/null)
    
    local http_code=$(echo "$response" | tail -n1)
    local body=$(echo "$response" | sed '$d')
    
    # If v2 fails, try v1
    if [ "$http_code" -ne 200 ] && [ "$http_code" -ne 201 ]; then
        echo "v2 API failed, trying v1..."
        response=$(curl -X POST "http://localhost:${PORT}/api/v1/flows/upload/" \
            -H "accept: application/json" \
            -H "Content-Type: multipart/form-data" \
            -F "file=@$flow_file;type=application/json" \
            -w "\n%{http_code}" \
            -s 2>/dev/null)
        http_code=$(echo "$response" | tail -n1)
        body=$(echo "$response" | sed '$d')
    fi
    
    if [ "$http_code" -eq 200 ] || [ "$http_code" -eq 201 ]; then
        # Extract flow ID from response (response is an array, get first element's id)
        local flow_id=$(echo "$body" | grep -o '"id":\s*"[^"]*"' | head -1 | sed 's/.*"id":\s*"\([^"]*\)".*/\1/')
        if [ -n "$flow_id" ]; then
            echo "Flow '$flow_name' imported successfully with ID: $flow_id"
            echo "$flow_id" > /app/content/flow-id.txt
            return 0
        else
            echo "WARNING: Flow imported but could not extract flow ID from response"
            echo "Response: $body"
            return 1
        fi
    else
        echo "WARNING: Flow import returned HTTP $http_code"
        echo "Response: $body"
        return 1
    fi
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
    langflow run --host 0.0.0.0 --port ${PORT} &
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
    
    # Import Document Q&A flow (don't fail container if import fails)
    import_flow "/app/content/document-qa-flow.json" "Document Q&A" || echo "WARNING: Flow import failed, but continuing..."
else
    echo "ERROR: Failed to wait for Langflow. Container will continue but files may not be uploaded."
fi

# Wait for the Langflow process to keep container running
wait $LANGFLOW_PID

