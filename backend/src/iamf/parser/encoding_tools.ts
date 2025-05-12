interface WavFileDescriptor {
  numSamples: number;
  bitDepth: number;
  sampleRate: number;
}

/** @brief As the IAMF Encoder requires input audio files to be formatted exactly the same (input length?, bit depth, sample rate)
 * we provide this utility function to set these features.
 */
// export function formatWav(inputWavURL);
