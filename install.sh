#!/usr/bin/env bash
set -e

PACKAGE="easecloud-mageperf"
VERSION="${MAGEPERF_VERSION:-latest}"

echo "Installing mageperf by EaseCloud..."
echo ""

# Detect preferred installation method
if command -v pip3 &>/dev/null; then
    echo "Installing via pip3..."
    pip3 install "$PACKAGE"
elif command -v pip &>/dev/null; then
    echo "Installing via pip..."
    pip install "$PACKAGE"
else
    echo "Python/pip not found. Attempting binary install..."
    OS=$(uname -s | tr '[:upper:]' '[:lower:]')
    ARCH=$(uname -m)
    case "$ARCH" in
        x86_64) ARCH="amd64" ;;
        arm64|aarch64) ARCH="arm64" ;;
        *) echo "Unsupported architecture: $ARCH"; exit 1 ;;
    esac

    BINARY_NAME="mageperf-${OS}-${ARCH}"
    DOWNLOAD_URL="https://github.com/easecloud/mageperf/releases/latest/download/${BINARY_NAME}"
    INSTALL_DIR="/usr/local/bin"

    echo "Downloading from GitHub Releases..."
    if command -v curl &>/dev/null; then
        curl -fsSL "$DOWNLOAD_URL" -o "/tmp/mageperf"
    elif command -v wget &>/dev/null; then
        wget -q "$DOWNLOAD_URL" -O "/tmp/mageperf"
    else
        echo "Error: curl or wget required for binary install"
        exit 1
    fi

    chmod +x /tmp/mageperf
    mv /tmp/mageperf "${INSTALL_DIR}/mageperf"
    echo "Installed to ${INSTALL_DIR}/mageperf"
fi

echo ""
echo "✓ mageperf installed successfully!"
echo ""
echo "Get started:"
echo "  mageperf analyze https://your-store.com"
echo "  mageperf --help"
