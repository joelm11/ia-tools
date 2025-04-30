import { audioFormatFromChannels } from "src/@common/AudioFormatsTools";
import { AudioChFormat } from "src/@types/AudioFormats";
import { WaveFile } from "wavefile";

export async function audioFormatFromFile(file: File): Promise<AudioChFormat> {
  const characteristics = await getWavCharacteristics(file);
  if (characteristics) {
    const { numChannels, channelMask } = characteristics;
    return audioFormatFromChannels(numChannels, channelMask);
  }
  return AudioChFormat.NONE;
}

export async function getWavCharacteristics(file: File): Promise<{
  numChannels: number;
  sampleRate: number;
  bitDepth: number;
  channelMask?: number;
} | null> {
  try {
    const arrayBuffer = await readFileAsArrayBuffer(file);
    if (arrayBuffer) {
      let data: Uint8Array | ArrayBuffer = arrayBuffer;
      // Check if conversion is needed
      if (!(data instanceof Uint8Array)) {
        data = new Uint8Array(arrayBuffer);
      }
      const waveFile = new WaveFile(data as Uint8Array);
      return {
        numChannels: (waveFile.fmt as any).numChannels,
        sampleRate: (waveFile.fmt as any).sampleRate,
        bitDepth: (waveFile.fmt as any).bitsPerSample,
        channelMask: (waveFile.fmt as any).dwChannelMask,
      };
    }
    return null;
  } catch (error) {
    // Log the error to the console for debugging, but return null
    console.error("Error getting WAV characteristics:", error);
    return null;
  }
}

export async function readFileAsArrayBuffer(
  file: File
): Promise<ArrayBuffer | null> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => {
      resolve(reader.result instanceof ArrayBuffer ? reader.result : null);
    };
    reader.onerror = () => {
      console.error("Error reading the file:", reader.error);
      resolve(null);
    };
    reader.readAsArrayBuffer(file);
  });
}
