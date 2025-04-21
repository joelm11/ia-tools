#!/bin/bash

# URL of the directory on GitHub
url="https://github.com/AOMediaCodec/iamf-tools/tree/main/iamf/cli/proto"

# GitHub repository details
repo_owner="AOMediaCodec"
repo_name="iamf-tools"
branch="main"
repo_path="iamf/cli/proto"

# Use curl to fetch the HTML content of the page and grep for the filename within the link
curl -s "$url" | grep -oE '"/AOMediaCodec/iamf-tools/blob/main/iamf/cli/proto/([^"]+\.proto)"' | \
# Extract just the filename using awk
awk -F'/' '{print $(NF-0)}' | \
# Remove the leading double quote if present (though the grep shouldn't include it now)
sed 's/"//g' | \
# Loop through the filenames and download each one
while IFS= read -r filename; do
  echo "Downloading $filename..."
  download_url="https://raw.githubusercontent.com/$repo_owner/$repo_name/$branch/$repo_path/$filename"
  curl -sLO "$download_url"
done

echo "Finished downloading .proto files."