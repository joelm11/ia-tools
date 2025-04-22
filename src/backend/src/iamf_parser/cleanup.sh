#!/bin/bash

# Script to remove all occurrences of "iamf/cli/proto/" from files with extension .proto

# Define the string to be removed
string_to_remove="iamf/cli/proto/"

# Find all .proto files in the current directory
find ./proto -type f -name "*.proto" -print0 | while IFS= read -r -d $'\0' file; do
  echo "Processing file: $file"
  # Use sed to replace all occurrences of the string in-place
  sed -i '' "s#$string_to_remove##g" "$file"
done

echo "Finished processing all .proto files."