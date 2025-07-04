#!/usr/bin/env bash
# Simple helper script to execute all Jest tests using the configuration in /tests
# Pass any additional Jest CLI flags after the script name, e.g.:
#   ./scripts/run_tests.sh --watch

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR" || exit 1

# Run Jest with explicit config path
npx jest --config tests/jest.config.ts "$@" 