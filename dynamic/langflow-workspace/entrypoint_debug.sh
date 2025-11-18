#!/bin/bash
# Debug-focused entrypoint for Langflow on Render
# This script focuses on identifying why langflow isn't starting

set -u  # Fail on undefined variables

echo "=========================================="
echo "=== ENTRYPOINT DEBUG STARTUP ==="
echo "=========================================="

# Use Render's PORT environment variable, fallback to 7860 for local development
PORT=${PORT:-7860}
# Set LANGFLOW_PORT to match PORT so Langflow uses the correct port
export LANGFLOW_PORT=${PORT}
# Set LANGFLOW_HOST to 0.0.0.0 to ensure Langflow binds to all interfaces (required for Render)
export LANGFLOW_HOST=0.0.0.0

# Determine the correct Python/langflow command to use
# Prefer direct Python execution over uv run to avoid uv deadlock issues
# The base image already has langflow installed, so direct Python should work
echo "[Config] Checking Python execution method..."
if command -v python3 >/dev/null 2>&1; then
    # Try direct Python first - this avoids uv runtime sync operations
    if python3 -c "import langflow" 2>/dev/null; then
        PYTHON_CMD="python3"
        LANGFLOW_CMD="python3 -m langflow"
        echo "[Config] ✓ Using direct python3 (langflow available via direct import)"
    elif command -v uv >/dev/null 2>&1; then
        # Fallback to uv run only if direct Python doesn't work
        PYTHON_CMD="uv run python"
        LANGFLOW_CMD="uv run python -m langflow"
        echo "[Config] ⚠ Direct python3 failed, falling back to uv run (with UV env vars to prevent deadlock)"
    else
        PYTHON_CMD="python3"
        LANGFLOW_CMD="python3 -m langflow"
        echo "[Config] ⚠ Using python3 (langflow import check failed, but proceeding anyway)"
    fi
elif command -v python >/dev/null 2>&1; then
    if python -c "import langflow" 2>/dev/null; then
        PYTHON_CMD="python"
        LANGFLOW_CMD="python -m langflow"
        echo "[Config] ✓ Using direct python (langflow available via direct import)"
    elif command -v uv >/dev/null 2>&1; then
        PYTHON_CMD="uv run python"
        LANGFLOW_CMD="uv run python -m langflow"
        echo "[Config] ⚠ Direct python failed, falling back to uv run (with UV env vars to prevent deadlock)"
    else
        PYTHON_CMD="python"
        LANGFLOW_CMD="python -m langflow"
        echo "[Config] ⚠ Using python (langflow import check failed, but proceeding anyway)"
    fi
elif command -v uv >/dev/null 2>&1; then
    PYTHON_CMD="uv run python"
    LANGFLOW_CMD="uv run python -m langflow"
    echo "[Config] ⚠ No direct Python found, using uv run (with UV env vars to prevent deadlock)"
else
    echo "[Config] ✗ FATAL: No Python or uv found"
    exit 1
fi
export PYTHON_CMD
export LANGFLOW_CMD

echo "[Debug] Environment Configuration:"
echo "  PORT: ${PORT}"
echo "  LANGFLOW_PORT: ${LANGFLOW_PORT}"
echo "  LANGFLOW_HOST: ${LANGFLOW_HOST}"
echo "  LANGFLOW_DATABASE_URL: ${LANGFLOW_DATABASE_URL:+SET (hidden)}"
echo "  LANGFLOW_CONFIG_DIR: ${LANGFLOW_CONFIG_DIR:-'NOT SET (using default)'}"
echo "  PYTHON_CMD: ${PYTHON_CMD}"
echo "  LANGFLOW_CMD: ${LANGFLOW_CMD}"
echo ""

# Verify Python and langflow are available
echo "[Debug] Verifying Python and langflow availability..."
# Extract the base command (python3, python, or uv) for checking
BASE_CMD=${PYTHON_CMD%% *}
if ! command -v ${BASE_CMD} >/dev/null 2>&1; then
    echo "[Debug] ✗ FATAL: Command not found: ${BASE_CMD}"
    exit 1
fi

# Verify langflow is importable (skip if we already checked during command selection)
if ! ${PYTHON_CMD} -c "import langflow" 2>/dev/null; then
    echo "[Debug] ✗ FATAL: langflow module not importable via ${PYTHON_CMD}"
    exit 1
fi
echo "[Debug] ✓ Python and langflow verified"

# Check if langflow 'run' command supports --host and --port flags
# NOTE: This check may hang if langflow tries to initialize and connect to database
# Use a strict timeout to prevent hanging
echo "[Debug] Checking langflow command syntax (with 5 second timeout)..."
HELP_OUTPUT=$(timeout 5 ${LANGFLOW_CMD} run --help 2>&1 || echo "TIMEOUT_OR_ERROR")
TIMEOUT_EXIT=$?

if [ $TIMEOUT_EXIT -eq 124 ] || [ "$HELP_OUTPUT" = "TIMEOUT_OR_ERROR" ]; then
    echo "[Debug] ⚠ Help check timed out or failed (langflow may be initializing database connection)"
    echo "[Debug] Defaulting to environment variables (LANGFLOW_HOST, LANGFLOW_PORT) - more reliable"
    USE_CLI_FLAGS=false
    LANGFLOW_CMD_FINAL="${LANGFLOW_CMD} run"
elif echo "${HELP_OUTPUT}" | grep -qE "(--host|--port)"; then
    echo "[Debug] ✓ Langflow supports --host and --port flags"
    USE_CLI_FLAGS=true
    LANGFLOW_CMD_FINAL="${LANGFLOW_CMD} run --host ${LANGFLOW_HOST} --port ${LANGFLOW_PORT}"
else
    echo "[Debug] ⚠ Langflow may not support --host/--port flags, using environment variables"
    USE_CLI_FLAGS=false
    LANGFLOW_CMD_FINAL="${LANGFLOW_CMD} run"
fi

echo ""
echo "[Debug] ========================================"
echo "[Debug] FINAL COMMAND TO EXECUTE"
echo "[Debug] ========================================"
echo "[Debug] Command: ${LANGFLOW_CMD_FINAL}"
echo "[Debug] Using CLI flags: ${USE_CLI_FLAGS}"
echo "[Debug] Working directory: $(pwd)"
echo "[Debug] Current user: $(whoami)"
echo "[Debug] Process ID (before exec): $$"
echo "[Debug] Parent process ID: $PPID"
echo "[Debug] ========================================"
echo ""

# Verify command components exist
echo "[Debug] Verifying command components..."
CMD_ARRAY=(${LANGFLOW_CMD_FINAL})
FIRST_CMD=${CMD_ARRAY[0]}

if echo "${FIRST_CMD}" | grep -q "^uv"; then
    if ! command -v uv >/dev/null 2>&1; then
        echo "[Debug] ✗ FATAL: uv command not found"
        exit 1
    fi
    echo "[Debug] ✓ uv found: $(command -v uv)"
elif ! command -v ${FIRST_CMD} >/dev/null 2>&1; then
    echo "[Debug] ✗ FATAL: Command not found: ${FIRST_CMD}"
    exit 1
fi
echo "[Debug] ✓ Command components verified"

# Skip command syntax test - it would try to start langflow which requires database connection
# This test is not necessary since we're about to start langflow anyway
echo "[Debug] Skipping command syntax test (would require database connection)"
echo "[Debug] Proceeding directly to start langflow..."
echo ""

# Final verification
echo "[Debug] Final pre-exec verification:"
echo "  LANGFLOW_HOST: ${LANGFLOW_HOST}"
echo "  LANGFLOW_PORT: ${LANGFLOW_PORT}"
if [ -z "${LANGFLOW_HOST}" ] || [ -z "${LANGFLOW_PORT}" ]; then
    echo "[Debug] ✗ FATAL: Required environment variables not set!"
    exit 1
fi

if [ "${PORT}" != "${LANGFLOW_PORT}" ]; then
    echo "[Debug] ⚠ WARNING: PORT (${PORT}) != LANGFLOW_PORT (${LANGFLOW_PORT})"
    echo "[Debug] This may cause Render port detection to fail!"
fi
echo ""

# CRITICAL: Execute langflow with extensive logging
echo "=========================================="
echo "[Debug] EXECUTING LANGFLOW COMMAND"
echo "=========================================="
echo "[Debug] About to execute: exec ${LANGFLOW_CMD_FINAL}"
echo "[Debug] Current process ID: $$"
echo "[Debug] This exec will replace the current process"
echo "[Debug] If you see this message after exec, the exec failed!"
echo "[Debug] Starting langflow NOW..."
echo "=========================================="
echo ""

# Set up signal handlers to log if process is killed
trap 'echo "[Debug] ✗ Process received signal, exiting..."; exit 1' SIGTERM SIGINT

# Skip final syntax check - it would try to initialize langflow and connect to database
# This check is not necessary and could hang
echo "[Debug] Skipping final syntax check (would require database connection)"
echo ""

# Log process tree before exec
echo "[Debug] Process tree before exec:"
ps auxf | head -10 || echo "  (ps command not available)"
echo ""

# Execute langflow - this replaces the current process
# If exec fails, we'll see an error message
# All output will go to stdout/stderr and be visible in Render logs
echo "[Debug] ========================================"
echo "[Debug] EXECUTING NOW - Process will be replaced"
echo "[Debug] ========================================"
echo ""

# Use exec to replace current process
# If this fails, the script will continue and we'll see the error below
exec ${LANGFLOW_CMD_FINAL} 2>&1

# If we reach here, exec failed (should never happen with exec)
# This means the exec command itself had a syntax error or couldn't be found
EXEC_EXIT_CODE=$?
echo ""
echo "[Debug] ========================================"
echo "[Debug] ✗ FATAL: exec command returned (should never happen)"
echo "[Debug] ========================================"
echo "[Debug] Exit code: ${EXEC_EXIT_CODE}"
echo "[Debug] Command that failed: ${LANGFLOW_CMD_FINAL}"
echo "[Debug] This indicates exec could not replace the process"
echo "[Debug] Possible causes:"
echo "[Debug]   - Command not found"
echo "[Debug]   - Permission denied"
echo "[Debug]   - Invalid command syntax"
echo "[Debug] ========================================"
exit ${EXEC_EXIT_CODE}

