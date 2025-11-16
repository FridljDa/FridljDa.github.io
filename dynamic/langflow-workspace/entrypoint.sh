#!/bin/bash
# Don't use set -e here, as we want to continue even if upload fails
set -u  # Only fail on undefined variables

# Use Render's PORT environment variable, fallback to 7860 for local development
PORT=${PORT:-7860}
# Set LANGFLOW_PORT to match PORT so Langflow uses the correct port
export LANGFLOW_PORT=${PORT}
# Set LANGFLOW_HOST to 0.0.0.0 to ensure Langflow binds to all interfaces (required for Render)
export LANGFLOW_HOST=0.0.0.0

# Logging: Environment variable configuration
echo "=== Langflow Startup Configuration ==="
echo "PORT environment variable: ${PORT}"
echo "LANGFLOW_PORT environment variable: ${LANGFLOW_PORT}"
echo "LANGFLOW_HOST environment variable: ${LANGFLOW_HOST}"
if [ "${PORT}" = "10000" ]; then
    echo "Detected Render environment (PORT=10000)"
elif [ "${PORT}" = "7860" ]; then
    echo "Using local development port (PORT=7860)"
else
    echo "Using custom port: ${PORT}"
fi
echo "======================================"

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

# Background helper function to handle document uploads and flow imports
# This runs in the background while Langflow starts in the foreground
background_setup() {
    echo "[Background Setup] Starting background setup process..."
    
    # Wait for Langflow API to be ready
    if wait_for_langflow; then
        echo "[Background Setup] Langflow API is ready, starting document uploads..."
        
        # Upload all documents (don't fail container if upload fails)
        upload_documents || echo "[Background Setup] WARNING: Some document uploads failed, but continuing..."
        
        # Import Document Q&A flow (don't fail container if import fails)
        import_flow "/app/content/document-qa-flow.json" "Document Q&A" || echo "[Background Setup] WARNING: Flow import failed, but continuing..."
        
        echo "[Background Setup] Background setup completed successfully."
    else
        echo "[Background Setup] ERROR: Failed to wait for Langflow API. Files may not be uploaded."
    fi
}

# Start background setup process (document uploads and flow imports)
# This will run in parallel with Langflow startup
background_setup &
BACKGROUND_PID=$!
echo "[Main] Started background setup process with PID: ${BACKGROUND_PID}"

# Start Langflow in the FOREGROUND (required for Render port detection)
# Render needs to see the main process binding to the port
# Always explicitly run langflow with --host 0.0.0.0 --port ${PORT} to ensure
# Render can detect the port binding (Render requires binding to 0.0.0.0 on PORT)
echo "=== Starting Langflow (Foreground) ==="
echo "Command: langflow run --host 0.0.0.0 --port ${PORT}"
echo "Host: 0.0.0.0 (required for Render port detection)"
echo "Port: ${PORT} (from PORT environment variable)"
echo "LANGFLOW_HOST: ${LANGFLOW_HOST}"
echo "LANGFLOW_PORT: ${LANGFLOW_PORT}"
echo "======================================"

# Verify port binding tools are available (for debugging)
if command -v ss >/dev/null 2>&1 || command -v netstat >/dev/null 2>&1; then
    echo "[Main] Port verification tools available - will check binding after startup"
else
    echo "[Main] WARNING: Neither 'ss' nor 'netstat' available for port verification"
fi

# Always run langflow with explicit host and port (override base image CMD)
# This ensures Render's PORT environment variable is always respected
# Run in FOREGROUND so Render can detect the process and port binding
# This will block here, which is what we want - Render will see this as the main process
exec langflow run --host 0.0.0.0 --port ${PORT}

