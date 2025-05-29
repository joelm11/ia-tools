### IAMF Encoding Tools

Some amount of preprocessing is required on input WAV files to the IAMF encoder.
Files must have the same sample rate, bit depth, and must all be the same length.

### IAMF Encoding Tools Implementation

Various WAV JS libraries do not work for various reasons. We will use FFmpeg via child process call.
