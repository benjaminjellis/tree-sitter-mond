#!/usr/bin/env bash
set -euo pipefail

PARSER_DIR="${XDG_DATA_HOME:-$HOME/.local/share}/nvim/lazy/nvim-treesitter/parser"
QUERY_DIR="${XDG_CONFIG_HOME:-$HOME/.config}/nvim/queries/mond"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "Building mond parser..."
cc -o "$SCRIPT_DIR/mond.so" -shared "$SCRIPT_DIR/src/parser.c" -fPIC -I "$SCRIPT_DIR/src"

echo "Installing parser to $PARSER_DIR..."
mkdir -p "$PARSER_DIR"
cp "$SCRIPT_DIR/mond.so" "$PARSER_DIR/mond.so"

echo "Installing queries to $QUERY_DIR..."
mkdir -p "$QUERY_DIR"
cp "$SCRIPT_DIR/queries/highlights.scm" "$QUERY_DIR/highlights.scm"

rm "$SCRIPT_DIR/mond.so"

echo "Done! Add this to your Neovim config to enable filetype detection and highlighting:"
echo ""
echo '  vim.filetype.add({ extension = { mond = "mond" } })'
echo '  vim.api.nvim_create_autocmd("FileType", {'
echo '    pattern = "mond",'
echo '    callback = function(args) vim.treesitter.start(args.buf, "mond") end,'
echo '  })'
