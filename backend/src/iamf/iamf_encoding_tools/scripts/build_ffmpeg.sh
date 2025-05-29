#!/bin/bash

# Determine the directory where this script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"

# --- Configuration ---
# FFmpeg source directory is expected to be a sibling to the 'scripts' directory
FFMPEG_SOURCE_DIR="${SCRIPT_DIR}/../ffmpeg"

# Installation directory within the FFmpeg source directory
INSTALL_DIR="${FFMPEG_SOURCE_DIR}/ffmpeg_custom_backend_build"

NUM_JOBS=$(nproc 2>/dev/null || echo 1) # Defaults to 1 if nproc fails

# --- Script Logic ---
echo "Starting FFmpeg custom build script..."
echo "Script Location:     ${SCRIPT_DIR}"
echo "FFmpeg Source Dir:   ${FFMPEG_SOURCE_DIR}"
echo "Installation Dir:    ${INSTALL_DIR}"
echo "Parallel Jobs:       ${NUM_JOBS}"

# Verify that the FFmpeg source directory exists
if [ ! -d "${FFMPEG_SOURCE_DIR}" ]; then
    echo "Error: FFmpeg source directory not found at '${FFMPEG_SOURCE_DIR}'"
    echo "Please ensure the 'ffmpeg' directory is a sibling to the directory containing this script."
    exit 1
fi

# Verify that the configure script exists in the FFmpeg source directory
if [ ! -f "${FFMPEG_SOURCE_DIR}/configure" ]; then
    echo "Error: 'configure' script not found in '${FFMPEG_SOURCE_DIR}'."
    echo "Please ensure '${FFMPEG_SOURCE_DIR}' is the correct FFmpeg source directory."
    exit 1
fi
echo "--------------------------------------"

# Exit immediately if a command exits with a non-zero status.
set -e

# Navigate to the FFmpeg source directory for all build operations
cd "${FFMPEG_SOURCE_DIR}"

echo "Cleaning previous build (if any)..."
# make distclean should be run from the FFmpeg source root
if [ -f Makefile ]; then
    make distclean || echo "Warning: 'make distclean' encountered issues, but continuing."
fi
# Remove and recreate the specific installation directory (INSTALL_DIR is an absolute path)
rm -rf "${INSTALL_DIR}"
mkdir -p "${INSTALL_DIR}"

echo "Configuring FFmpeg..."

PCM_CODECS_ENABLE=""
# Common PCM formats for WAV (signed/unsigned, various bit depths, little-endian)
for depth in s8 u8 s16 s24 s32 s64; do # Common integer depths
    PCM_CODECS_ENABLE="${PCM_CODECS_ENABLE} --enable-decoder=pcm_${depth}le --enable-encoder=pcm_${depth}le"
done
for depth in f32 f64; do # Common float depths
    PCM_CODECS_ENABLE="${PCM_CODECS_ENABLE} --enable-decoder=pcm_${depth}le --enable-encoder=pcm_${depth}le"
done

# The ./configure command is run from the FFMPEG_SOURCE_DIR (which is the current directory now)
# --prefix uses the absolute path defined in INSTALL_DIR
./configure \
    --prefix="${INSTALL_DIR}" \
    --disable-everything \
    \
    --enable-ffmpeg \
    --disable-programs \
    --enable-ffmpeg \
    \
    --disable-doc \
    --disable-htmlpages \
    --disable-manpages \
    --disable-podpages \
    --disable-txtpages \
    \
    --disable-network \
    --enable-protocol=file \
    \
    --disable-avdevice \
    \
    --disable-gpl \
    --disable-nonfree \
    \
    --enable-small \
    --enable-stripping \
    \
    --enable-avformat \
    --enable-avcodec \
    --enable-avfilter \
    --enable-swresample \
    \
    `# WAV format support` \
    --enable-demuxer=wav \
    --enable-muxer=wav \
    \
    `# PCM codecs for bit depth (Little Endian)` \
    ${PCM_CODECS_ENABLE} \
    \
    `# Resampling support` \
    --enable-filter=aresample \
    \
    `# Padding support` \
    --enable-filter=apad \
    --enable-filter=adelay \
    --enable-filter=anullsrc \
    \
    `# Other useful audio filters` \
    --enable-filter=aformat \
    --enable-filter=volume \
    --enable-filter=atrim \
    --enable-filter=asetnsamples

echo "Configuration complete."
echo "Starting build with 'make -j${NUM_JOBS}' (this may take a while)..."
make -j${NUM_JOBS}

echo "Build complete. Installing to '${INSTALL_DIR}'..."
make install

echo "--------------------------------------"
echo "FFmpeg build and installation finished!"
echo "The FFmpeg executable is located at: ${INSTALL_DIR}/bin/ffmpeg"
echo ""
echo "To verify, you can run: ${INSTALL_DIR}/bin/ffmpeg -version"
echo "Consider adding ${INSTALL_DIR}/bin to your PATH if you want to run 'ffmpeg' directly."
echo "--------------------------------------"