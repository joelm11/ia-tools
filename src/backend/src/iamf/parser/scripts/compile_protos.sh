#!/bin/bash

# Script to compile all .proto files in a specified directory using protoc and ts-proto

# Check if the proto directory path is provided as the first argument
if [ -z "$1" ]; then
  echo "Usage: $0 <path_to_proto_directory> <path_to_node_modules>"
  exit 1
fi

# Check if the node_modules path is provided as the second argument
if [ -z "$2" ]; then
  echo "Usage: $0 <path_to_proto_directory> <path_to_node_modules>"
  exit 1
fi

PROTO_DIR="$1"
NODE_MODULES_PATH="$2"
PLUGIN_PATH="$NODE_MODULES_PATH/node_modules/.bin/protoc-gen-ts_proto"

# Check if the specified proto directory exists
if [ ! -d "$PROTO_DIR" ]; then
  echo "Error: Proto directory '$PROTO_DIR' not found."
  exit 1
fi

# Check if the specified node_modules directory exists
if [ ! -d "$NODE_MODULES_PATH/node_modules/.bin" ]; then
  echo "Error: node_modules path '$NODE_MODULES_PATH' is invalid or does not contain .bin directory."
  exit 1
fi

# Check if the ts-proto plugin exists
if [ ! -f "$PLUGIN_PATH" ]; then
  echo "Error: ts-proto plugin not found at '$PLUGIN_PATH'."
  exit 1
fi

# Find all .proto files in the specified directory
find "$PROTO_DIR" -type f -name "*.proto" -print0 | while IFS= read -r -d $'\0' proto_file; do
  echo "Processing: $proto_file"
  protoc \
    --plugin=protoc-gen-ts_proto="$PLUGIN_PATH" \
    --ts_proto_out=. \
    -I="$PROTO_DIR" \
    "$proto_file"
done

echo "Compilation of .proto files complete."