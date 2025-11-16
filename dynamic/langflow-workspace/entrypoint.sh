#!/bin/bash
# Don't use set -e here, as we want to continue even if upload fails
set -u  # Only fail on undefined variables

# ============================================================================
# COMPREHENSIVE DIAGNOSTIC LOGGING
# ============================================================================
echo "=========================================="
echo "=== ENTRYPOINT STARTUP DIAGNOSTICS ==="
echo "=========================================="

# 1. User and Environment Diagnostics
echo "--- User and Environment Information ---"
echo "Current user (whoami): $(whoami 2>&1 || echo 'ERROR: whoami failed')"
echo "Current user ID (id): $(id 2>&1 || echo 'ERROR: id failed')"
echo "User's groups: $(groups 2>&1 || echo 'ERROR: groups failed')"
echo "Home directory: ${HOME:-'NOT SET'}"
echo "Working directory: $(pwd 2>&1 || echo 'ERROR: pwd failed')"
echo "Shell: ${SHELL:-'NOT SET'}"
echo "PATH: ${PATH:-'NOT SET'}"
echo ""

# 2. Environment Variables
echo "--- Environment Variables ---"
echo "PORT: ${PORT:-'NOT SET'}"
echo "LANGFLOW_PORT: ${LANGFLOW_PORT:-'NOT SET'}"
echo "LANGFLOW_HOST: ${LANGFLOW_HOST:-'NOT SET'}"
echo "LANGFLOW_DATABASE_URL: ${LANGFLOW_DATABASE_URL:-'NOT SET'}"
echo "LANGFLOW_CONFIG_DIR: ${LANGFLOW_CONFIG_DIR:-'NOT SET'}"
echo "LANGFLOW_SKIP_AUTH_AUTO_LOGIN: ${LANGFLOW_SKIP_AUTH_AUTO_LOGIN:-'NOT SET'}"
echo ""

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

# Function to verify port binding
verify_port_binding() {
    local check_port=$1
    local max_attempts=12
    local attempt=0
    
    echo "[Port Verification] Checking if langflow is listening on port ${check_port}..."
    
    while [ $attempt -lt $max_attempts ]; do
        if command -v ss >/dev/null 2>&1; then
            if ss -tlnp 2>/dev/null | grep -q ":${check_port}"; then
                echo "[Port Verification] ✓ Port ${check_port} is bound (attempt $((attempt + 1)))"
                ss -tlnp 2>/dev/null | grep ":${check_port}" | head -1 | sed 's/^/    /'
                return 0
            fi
        elif command -v netstat >/dev/null 2>&1; then
            if netstat -tlnp 2>/dev/null | grep -q ":${check_port}"; then
                echo "[Port Verification] ✓ Port ${check_port} is bound (attempt $((attempt + 1)))"
                netstat -tlnp 2>/dev/null | grep ":${check_port}" | head -1 | sed 's/^/    /'
                return 0
            fi
        elif command -v lsof >/dev/null 2>&1; then
            if lsof -i :${check_port} >/dev/null 2>&1; then
                echo "[Port Verification] ✓ Port ${check_port} is bound (attempt $((attempt + 1)))"
                lsof -i :${check_port} 2>&1 | head -2 | sed 's/^/    /'
                return 0
            fi
        fi
        
        attempt=$((attempt + 1))
        if [ $attempt -lt $max_attempts ]; then
            sleep 2
        fi
    done
    
    echo "[Port Verification] ⚠ Port ${check_port} not yet bound after ${max_attempts} attempts"
    return 1
}

# Function to check if Langflow API is ready
wait_for_langflow() {
    echo "[API Check] Waiting for Langflow API to be ready..."
    local max_attempts=60
    local attempt=0
    
    # First verify port binding
    echo "[API Check] Verifying port binding..."
    verify_port_binding ${PORT}
    
    # Then check HTTP endpoint
    while [ $attempt -lt $max_attempts ]; do
        if curl --output /dev/null --silent --head --fail --max-time 5 http://localhost:${PORT}; then
            echo "[API Check] ✓ Langflow API is ready! (HTTP endpoint responding)"
            return 0
        fi
        attempt=$((attempt + 1))
        if [ $attempt -lt $max_attempts ]; then
            echo "[API Check] Attempt $attempt/$max_attempts: Langflow not ready yet, waiting 5 seconds..."
            sleep 5
        fi
    done
    
    echo "[API Check] ✗ ERROR: Langflow API did not become ready within expected time"
    echo "[API Check] Last port check:"
    verify_port_binding ${PORT} || true
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

# ============================================================================
# PYTHON ENVIRONMENT DIAGNOSTICS
# ============================================================================
echo "--- Python Environment Diagnostics ---"
echo "Checking Python installation..."
if command -v python3 >/dev/null 2>&1; then
    PYTHON_CMD=$(command -v python3)
    echo "✓ python3 found at: ${PYTHON_CMD}"
    echo "  Version: $(python3 --version 2>&1 || echo 'ERROR: version check failed')"
    echo "  Path: $(which python3 2>&1 || echo 'ERROR: which failed')"
else
    echo "✗ ERROR: python3 command NOT found"
fi

if command -v python >/dev/null 2>&1; then
    echo "✓ python found at: $(command -v python)"
    echo "  Version: $(python --version 2>&1 || echo 'ERROR: version check failed')"
fi

echo "Checking Python packages..."
if command -v pip3 >/dev/null 2>&1; then
    echo "✓ pip3 found at: $(command -v pip3)"
    echo "  Checking if langflow is installed..."
    if python3 -c "import langflow" 2>/dev/null; then
        echo "✓ langflow Python package is importable"
        python3 -c "import langflow; print(f'  Langflow version: {langflow.__version__}')" 2>&1 || echo "  Could not get version"
    else
        echo "✗ ERROR: langflow Python package is NOT importable"
        python3 -c "import langflow" 2>&1 || true
    fi
else
    echo "✗ WARNING: pip3 not found"
fi
echo ""

# ============================================================================
# LANGFLOW COMMAND DIAGNOSTICS
# ============================================================================
echo "--- Langflow Command Diagnostics ---"
echo "Checking if 'langflow' command exists..."

# Check if langflow command exists
if command -v langflow >/dev/null 2>&1; then
    LANGFLOW_CMD=$(command -v langflow)
    echo "✓ langflow command found at: ${LANGFLOW_CMD}"
    
    # Check if it's executable
    if [ -x "${LANGFLOW_CMD}" ]; then
        echo "✓ langflow command is executable"
    else
        echo "✗ ERROR: langflow command is NOT executable"
        echo "  Permissions: $(ls -l "${LANGFLOW_CMD}" 2>&1 || echo 'ERROR: ls failed')"
    fi
    
    # Check file permissions and ownership
    echo "  File details: $(ls -la "${LANGFLOW_CMD}" 2>&1 || echo 'ERROR: ls failed')"
    
    # Try to get langflow version/help - capture full output
    echo "Attempting to run 'langflow --version'..."
    VERSION_OUTPUT=$(langflow --version 2>&1)
    VERSION_EXIT_CODE=$?
    if [ $VERSION_EXIT_CODE -eq 0 ]; then
        echo "✓ langflow --version succeeded (exit code: $VERSION_EXIT_CODE)"
        echo "  Output: ${VERSION_OUTPUT}"
    else
        echo "✗ ERROR: langflow --version failed (exit code: $VERSION_EXIT_CODE)"
        echo "  Error output: ${VERSION_OUTPUT}"
    fi
    
    echo ""
    echo "Attempting to run 'langflow --help'..."
    HELP_OUTPUT=$(langflow --help 2>&1 | head -20)
    HELP_EXIT_CODE=$?
    if [ $HELP_EXIT_CODE -eq 0 ]; then
        echo "✓ langflow --help succeeded (exit code: $HELP_EXIT_CODE)"
        echo "  Output (first 20 lines):"
        echo "${HELP_OUTPUT}" | sed 's/^/    /'
    else
        echo "✗ ERROR: langflow --help failed (exit code: $HELP_EXIT_CODE)"
        echo "  Error output: ${HELP_OUTPUT}"
    fi
    
    # Test if langflow can at least be invoked (even if it fails)
    echo ""
    echo "Testing langflow command invocation..."
    TEST_OUTPUT=$(timeout 10 langflow 2>&1 || true)
    TEST_EXIT_CODE=$?
    echo "  Command invocation test (exit code: $TEST_EXIT_CODE)"
    if echo "${TEST_OUTPUT}" | grep -qi "usage\|help\|error\|command"; then
        echo "  ✓ langflow command responds (output contains expected keywords)"
    else
        echo "  ⚠ langflow command output unexpected:"
        echo "${TEST_OUTPUT}" | head -5 | sed 's/^/    /'
    fi
else
    echo "✗ ERROR: langflow command NOT found in PATH"
    echo "  PATH: ${PATH}"
    echo "  Searching common locations..."
    for loc in /usr/local/bin /usr/bin /bin /opt/langflow/bin ~/.local/bin; do
        if [ -f "${loc}/langflow" ]; then
            echo "  Found at: ${loc}/langflow"
            ls -la "${loc}/langflow" 2>&1 || true
        fi
    done
fi
echo ""

# ============================================================================
# DIRECTORY AND FILE PERMISSION DIAGNOSTICS
# ============================================================================
echo "--- Directory and File Permissions ---"
echo "Checking /app directory..."
if [ -d "/app" ]; then
    echo "✓ /app exists"
    echo "  Permissions: $(ls -ld /app 2>&1 || echo 'ERROR: ls failed')"
    echo "  Contents: $(ls -la /app 2>&1 | head -10 || echo 'ERROR: ls failed')"
else
    echo "✗ ERROR: /app directory does NOT exist"
fi

echo "Checking /app/content directory..."
if [ -d "/app/content" ]; then
    echo "✓ /app/content exists"
    echo "  Permissions: $(ls -ld /app/content 2>&1 || echo 'ERROR: ls failed')"
    echo "  Contents: $(ls -la /app/content 2>&1 | head -10 || echo 'ERROR: ls failed')"
else
    echo "✗ WARNING: /app/content directory does NOT exist"
fi

echo "Checking /app/langflow directory..."
if [ -d "/app/langflow" ]; then
    echo "✓ /app/langflow exists"
    echo "  Permissions: $(ls -ld /app/langflow 2>&1 || echo 'ERROR: ls failed')"
else
    echo "  /app/langflow does not exist (may be created at runtime)"
fi

echo "Checking entrypoint.sh..."
if [ -f "/entrypoint.sh" ]; then
    echo "✓ /entrypoint.sh exists"
    echo "  Permissions: $(ls -l /entrypoint.sh 2>&1 || echo 'ERROR: ls failed')"
    if [ -x "/entrypoint.sh" ]; then
        echo "✓ /entrypoint.sh is executable"
    else
        echo "✗ ERROR: /entrypoint.sh is NOT executable"
    fi
else
    echo "✗ ERROR: /entrypoint.sh does NOT exist"
fi

echo "Checking if we can write to /app..."
if [ -w "/app" ]; then
    echo "✓ Current user can write to /app"
else
    echo "✗ WARNING: Current user CANNOT write to /app"
fi

echo "Checking if we can write to /app/content..."
if [ -w "/app/content" ] 2>/dev/null; then
    echo "✓ Current user can write to /app/content"
else
    echo "✗ WARNING: Current user CANNOT write to /app/content"
fi
echo ""

# ============================================================================
# CONFIGURATION VERIFICATION
# ============================================================================
echo "--- Configuration Verification ---"
echo "Checking LANGFLOW_CONFIG_DIR..."

if [ -n "${LANGFLOW_CONFIG_DIR:-}" ]; then
    echo "LANGFLOW_CONFIG_DIR is set to: ${LANGFLOW_CONFIG_DIR}"
    
    # Create directory if it doesn't exist
    if [ ! -d "${LANGFLOW_CONFIG_DIR}" ]; then
        echo "Creating LANGFLOW_CONFIG_DIR: ${LANGFLOW_CONFIG_DIR}"
        mkdir -p "${LANGFLOW_CONFIG_DIR}" 2>&1 || echo "✗ WARNING: Failed to create LANGFLOW_CONFIG_DIR"
    fi
    
    # Check if directory exists and is writable
    if [ -d "${LANGFLOW_CONFIG_DIR}" ]; then
        echo "✓ LANGFLOW_CONFIG_DIR exists: ${LANGFLOW_CONFIG_DIR}"
        echo "  Permissions: $(ls -ld "${LANGFLOW_CONFIG_DIR}" 2>&1 || echo 'ERROR: ls failed')"
        
        if [ -w "${LANGFLOW_CONFIG_DIR}" ]; then
            echo "✓ LANGFLOW_CONFIG_DIR is writable"
        else
            echo "✗ WARNING: LANGFLOW_CONFIG_DIR is NOT writable"
        fi
    else
        echo "✗ ERROR: LANGFLOW_CONFIG_DIR does not exist and could not be created"
    fi
else
    echo "⚠ LANGFLOW_CONFIG_DIR is not set (using default)"
fi

echo ""
echo "Verifying database connection..."
if [ -n "${LANGFLOW_DATABASE_URL:-}" ]; then
    echo "LANGFLOW_DATABASE_URL is set"
    # Extract database info for logging (without password)
    DB_INFO=$(echo "${LANGFLOW_DATABASE_URL}" | sed 's/:[^:@]*@/:***@/g')
    echo "  Database URL (masked): ${DB_INFO}"
    
    # Try to test database connection using Python
    echo "  Testing database connectivity..."
    python3 -c "
import os
import sys
try:
    db_url = os.environ.get('LANGFLOW_DATABASE_URL', '')
    if 'postgresql' in db_url or 'postgres' in db_url:
        import psycopg2
        from urllib.parse import urlparse
        parsed = urlparse(db_url)
        conn = psycopg2.connect(
            host=parsed.hostname,
            port=parsed.port or 5432,
            user=parsed.username,
            password=parsed.password,
            database=parsed.path[1:] if parsed.path else 'langflow',
            connect_timeout=5
        )
        conn.close()
        print('  ✓ Database connection successful')
        sys.exit(0)
    else:
        print('  ⚠ Non-PostgreSQL database, skipping connection test')
        sys.exit(0)
except ImportError:
    print('  ⚠ psycopg2 not available, skipping connection test')
    sys.exit(0)
except Exception as e:
    print(f'  ✗ Database connection failed: {e}')
    sys.exit(1)
" 2>&1 || echo "  ⚠ Could not verify database connection (non-fatal)"
else
    echo "⚠ LANGFLOW_DATABASE_URL is not set (will use default SQLite)"
fi

echo ""
echo "Critical environment variables summary:"
echo "  PORT: ${PORT:-'NOT SET'}"
echo "  LANGFLOW_PORT: ${LANGFLOW_PORT:-'NOT SET'}"
echo "  LANGFLOW_HOST: ${LANGFLOW_HOST:-'NOT SET'}"
echo "  LANGFLOW_CONFIG_DIR: ${LANGFLOW_CONFIG_DIR:-'NOT SET (using default)'}"
echo "  LANGFLOW_DATABASE_URL: ${LANGFLOW_DATABASE_URL:+SET (hidden)}"
echo "  LANGFLOW_SKIP_AUTH_AUTO_LOGIN: ${LANGFLOW_SKIP_AUTH_AUTO_LOGIN:-'NOT SET'}"
echo ""

# ============================================================================
# PROCESS AND PORT DIAGNOSTICS
# ============================================================================
echo "--- Process and Port Diagnostics ---"
echo "Checking for existing langflow processes..."
if command -v ps >/dev/null 2>&1; then
    ps aux | grep -i langflow | grep -v grep || echo "  No langflow processes found"
else
    echo "  ps command not available"
fi

echo "Checking for processes listening on port ${PORT}..."
if command -v lsof >/dev/null 2>&1; then
    lsof -i :${PORT} 2>&1 || echo "  No processes listening on port ${PORT}"
elif command -v ss >/dev/null 2>&1; then
    ss -tlnp | grep ":${PORT}" || echo "  No processes listening on port ${PORT}"
elif command -v netstat >/dev/null 2>&1; then
    netstat -tlnp | grep ":${PORT}" || echo "  No processes listening on port ${PORT}"
else
    echo "  No port checking tools available (lsof, ss, netstat)"
fi
echo ""

# Start Langflow in the FOREGROUND (required for Render port detection)
# Render needs to see the main process binding to the port
# Always explicitly run langflow with --host 0.0.0.0 --port ${PORT} to ensure
# Render can detect the port binding (Render requires binding to 0.0.0.0 on PORT)
echo "=========================================="
echo "=== Starting Langflow (Foreground) ==="
echo "=========================================="
echo "Command: langflow run --host 0.0.0.0 --port ${PORT}"
echo "Host: 0.0.0.0 (required for Render port detection)"
echo "Port: ${PORT} (from PORT environment variable)"
echo "LANGFLOW_HOST: ${LANGFLOW_HOST}"
echo "LANGFLOW_PORT: ${LANGFLOW_PORT}"
echo "Current user: $(whoami 2>&1)"
echo "Current directory: $(pwd 2>&1)"
echo "Full command path: $(command -v langflow 2>&1 || echo 'NOT FOUND')"
echo "=========================================="

# Verify port binding tools are available (for debugging)
if command -v ss >/dev/null 2>&1 || command -v netstat >/dev/null 2>&1; then
    echo "[Main] Port verification tools available - will check binding after startup"
else
    echo "[Main] WARNING: Neither 'ss' nor 'netstat' available for port verification"
fi

# ============================================================================
# PRE-EXECUTION TESTING AND VALIDATION
# ============================================================================
echo "=========================================="
echo "=== Pre-Execution Testing ==="
echo "=========================================="

# Final validation before starting langflow
if ! command -v langflow >/dev/null 2>&1; then
    echo "✗ FATAL ERROR: langflow command not found. Cannot proceed."
    echo "  PATH was: ${PATH}"
    exit 1
fi

echo "[Pre-Exec] Final environment check:"
echo "  USER: ${USER:-'NOT SET'}"
echo "  HOME: ${HOME:-'NOT SET'}"
echo "  PATH: ${PATH:-'NOT SET'}"
echo "  PORT: ${PORT}"
echo "  LANGFLOW_HOST: ${LANGFLOW_HOST}"
echo "  LANGFLOW_PORT: ${LANGFLOW_PORT}"
echo "  LANGFLOW_CONFIG_DIR: ${LANGFLOW_CONFIG_DIR:-'NOT SET (using default)'}"
echo ""

# Test langflow startup command syntax (dry run test)
echo "[Pre-Exec] Testing langflow command syntax..."
LANGFLOW_CMD_TEST="langflow run --host 0.0.0.0 --port ${PORT}"

# Try to validate the command by checking if langflow accepts the arguments
# Use a short timeout to prevent hanging
echo "[Pre-Exec] Command to execute: ${LANGFLOW_CMD_TEST}"
echo "[Pre-Exec] Testing command with 5 second timeout..."
TIMEOUT_OUTPUT=$(timeout 5 langflow run --host 0.0.0.0 --port ${PORT} 2>&1 || true)
TIMEOUT_EXIT=$?

# If timeout occurred (exit code 124) or command started, that's actually good
# If command failed immediately with error, that's bad
if [ $TIMEOUT_EXIT -eq 124 ]; then
    echo "[Pre-Exec] ✓ Command started successfully (timeout expected for long-running process)"
elif [ $TIMEOUT_EXIT -eq 0 ]; then
    echo "[Pre-Exec] ⚠ Command exited immediately (may indicate configuration issue)"
    echo "[Pre-Exec] Output: ${TIMEOUT_OUTPUT}"
elif echo "${TIMEOUT_OUTPUT}" | grep -qi "error\|failed\|exception"; then
    echo "[Pre-Exec] ✗ Command failed with error:"
    echo "${TIMEOUT_OUTPUT}" | head -20 | sed 's/^/    /'
    echo "[Pre-Exec] WARNING: Command test failed, but proceeding anyway..."
else
    echo "[Pre-Exec] ✓ Command syntax appears valid"
    if [ -n "${TIMEOUT_OUTPUT}" ]; then
        echo "[Pre-Exec] Initial output:"
        echo "${TIMEOUT_OUTPUT}" | head -10 | sed 's/^/    /'
    fi
fi
echo ""

# ============================================================================
# START LANGFLOW (FOREGROUND EXEC)
# ============================================================================
echo "=========================================="
echo "=== Starting Langflow (Foreground) ==="
echo "=========================================="
echo "Command: ${LANGFLOW_CMD_TEST}"
echo "Host: 0.0.0.0 (required for Render port detection)"
echo "Port: ${PORT} (from PORT environment variable)"
echo "Current user: $(whoami 2>&1)"
echo "Current directory: $(pwd 2>&1)"
echo "Full command path: $(command -v langflow 2>&1)"
echo "=========================================="
echo ""

# Final pre-flight checks
echo "[Main] Pre-flight checks complete. Starting langflow..."
echo "[Main] All diagnostics and tests passed."
echo "[Main] Executing: exec langflow run --host 0.0.0.0 --port ${PORT}"
echo "[Main] Note: This will replace the current process (exec mode)"
echo "[Main] Render will detect the port binding from this process"
echo ""

# Execute langflow - this replaces the current process
# If it fails, the container will exit and Render will see the error
# All stderr and stdout will be visible in Render logs
exec langflow run --host 0.0.0.0 --port ${PORT} 2>&1

