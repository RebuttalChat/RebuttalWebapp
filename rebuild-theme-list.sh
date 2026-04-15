#!/bin/sh

# Delete previous contents
rm dist/themelist.json
# Concat objects
cat src/img/*/theme.json > dist/themelist.json.tmp
# Merge into list
jq -s . dist/themelist.json.tmp > dist/themelist.json
# Clean up
rm dist/themelist.json.tmp