#!/bin/bash

# URL of the directory on GitHub
url="https://github.com/AOMediaCodec/iamf-tools/tree/main/iamf/cli/proto"

# Use curl to fetch the HTML content of the page and grep to find lines containing .proto files
curl -s "$url" | grep -oE '/AOMediaCodec/iamf-tools/blob/main/iamf/cli/proto/[^"]+\.proto"' | \
# Extract just the filenames
sed 's#/AOMediaCodec/iamf-tools/blob/main/iamf/cli/proto/\([^"]+\.proto"\)#\1#g' | \
# Remove the trailing quote
sed 's/"//g' | \
# Loop through the filenames and download each one
while IFS= read -r filename; do
  echo "Downloading $filename..."
  download_url="https://raw.githubusercontent.com/AOMediaCodec/iamf-tools/main/iamf/cli/proto/$filename"
  curl -sLO "$download_url"
done

echo "Finished downloading .proto files."