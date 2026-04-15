#!/bin/sh

# Delete previous contents
rm src/themelist.json
# Concat objects
cat src/img/*/theme.json > src/themelist.json.tmp
# Merge into list
jq -s . src/themelist.json.tmp > src/themelist.json
# Clean up
rm src/themelist.json.tmp