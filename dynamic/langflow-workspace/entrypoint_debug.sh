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
if command -v uv >/dev/null 2>&1; then
    PYTHON_CMD="uv run python"
    LANGFLOW_CMD="uv run python -m langflow"
    echo "[Config] Using uv environment for Python/langflow"
else
    PYTHON_CMD="python3"
    LANGFLOW_CMD="python3 -m langflow"
    echo "[Config] Using system python3 for langflow (uv not found)"
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
if ! command -v ${PYTHON_CMD%% *} >/dev/null 2>&1; then
    echo "[Debug] ✗ FATAL: Python command not found: ${PYTHON_CMD}"
    exit 1
fi

if ! ${PYTHON_CMD} -c "import langflow" 2>/dev/null; then
    echo "[Debug] ✗ FATAL: langflow module not importable"
    exit 1
fi
echo "[Debug] ✓ Python and langflow verified"

# Check if langflow 'run' command supports --host and --port flags
echo "[Debug] Checking langflow command syntax..."
HELP_OUTPUT=$(${LANGFLOW_CMD} run --help 2>&1 || echo "")
if echo "${HELP_OUTPUT}" | grep -qE "(--host|--port)"; then
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

# Test command syntax with a timeout (non-blocking test)
echo "[Debug] Testing command syntax (5 second timeout)..."
TIMEOUT_CMD="timeout 5 ${LANGFLOW_CMD_FINAL} 2>&1 || true"
TIMEOUT_OUTPUT=$(eval ${TIMEOUT_CMD})
TIMEOUT_EXIT=$?

if [ $TIMEOUT_EXIT -eq 124 ]; then
    echo "[Debug] ✓ Command started successfully (timeout expected)"
elif [ $TIMEOUT_EXIT -eq 0 ]; then
    echo "[Debug] ⚠ Command exited immediately (exit code: 0)"
    echo "[Debug] Output: ${TIMEOUT_OUTPUT}"
elif echo "${TIMEOUT_OUTPUT}" | grep -qiE "error|failed|exception|invalid|unrecognized"; then
    echo "[Debug] ⚠ Command test showed errors (may be expected):"
    echo "${TIMEOUT_OUTPUT}" | head -5 | sed 's/^/    /'
else
    echo "[Debug] ✓ Command syntax appears valid"
fi
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

# Verify we can actually execute the command (syntax check)
echo "[Debug] Performing final syntax check..."
if ! eval "${LANGFLOW_CMD_FINAL} --help >/dev/null 2>&1" && ! eval "${LANGFLOW_CMD_FINAL} run --help >/dev/null 2>&1"; then
    echo "[Debug] ⚠ Command syntax check inconclusive (may be normal)"
else
    echo "[Debug] ✓ Command syntax check passed"
fi
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

