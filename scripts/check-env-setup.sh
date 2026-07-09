#!/usr/bin/env bash

# Move to the script's directory first so relative paths work
cd "$(dirname "$0")"

# Source with relative path
if [[ -f "./colored-logs.sh" ]]; then
    source ./colored-logs.sh
else
    echo "Error: colored-logs.sh not found in $(pwd)"
    exit 1
fi

main() {
    # Check environment variables
    if [[ "${DEVBOX_SHELL_ENABLED:-0}" != "1" ]]; then
        log_error "Not in a devbox shell. Please run 'devbox shell' first."
        exit 1
    fi

    # Skip host-tool checks in CI (GitHub Actions sets CI=true). The devbox
    # environment already provides everything the CI gate needs; docker,
    # direnv and dns-sd are local-dev conveniences only.
    if [[ -n "${CI:-}" ]]; then
        log_info "CI detected, skipping host tool checks."
        exit 0
    fi

    # Define tool requirements
    local tools=("docker" "direnv" "dns-sd")
    
    # Store URLs in a way bash can reference them
    declare -A urls
    urls[docker]="https://docs.docker.com/get-started/get-docker/"
    # Turn down direnv verbosity: https://github.com/direnv/direnv/issues/68#issuecomment-2812015043
    urls[direnv]="https://direnv.net/docs/installation.html"
    urls[dns-sd]="it should be already installed on mac, windows and linux need something else"

    local missing=0

    for bin in "${tools[@]}"; do
        if ! command -v "$bin" >/dev/null 2>&1; then
            log_error "Missing binary: $bin"
            log_info "Install $bin from: ${urls[$bin]}"
            missing=1
        fi
    done

    if [[ "$missing" -eq 1 ]]; then
        exit 1
    fi

    log_info "Environment check passed."
    exit 0
}

main "$@"