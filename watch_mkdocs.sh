#!/usr/bin/env bash
cd "$(dirname "$0")"

watchmedo shell-command \
  --patterns="*.md;*.yml;*.yaml;*.css;*.js" \
  --ignore-patterns="site/*;*.swp;*.tmp" \
  --recursive \
  --command='mkdocs build --clean -q && echo "Rebuilt at $(date)"' .
