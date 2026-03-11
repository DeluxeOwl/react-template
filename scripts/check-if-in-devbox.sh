#!/usr/bin/env bash


# set -euo
cd "$(dirname "$0")"
source colored-logs.sh

main() {
	if [[ "${DEVBOX_SHELL_ENABLED:-0}" != "1" && "${OPENCODE:-0}" != "1" ]]; then
		log_error "You're not in a devbox shell. Please enter a devbox shell."
		exit 1
	fi
	exit 0
}

main "$@"