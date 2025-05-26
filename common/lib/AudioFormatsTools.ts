import { AudioChFormat } from "../types/AudioFormats";

// Checks channel number and channel mask to determine the audio format
export function audioFormatFromChannels(
  numChannels: number,
  channelMask?: number
): AudioChFormat {
  switch (numChannels) {
    case 1:
      return AudioChFormat.MONO;
    case 2:
      return AudioChFormat.STEREO;
    case 6:
      if (channelMask === 0x3f) {
        return AudioChFormat.K5P1;
      } else {
        return AudioChFormat.K3P1P2;
      }
    case 8:
      if (channelMask === 0x503f) {
        return AudioChFormat.K5P1P2;
      } else {
        return AudioChFormat.K7P1;
      }
    case 10:
      if (channelMask === 0x2d03f) {
        return AudioChFormat.K5P1P4;
      } else {
        return AudioChFormat.K7P1P2;
      }
    case 12:
      return AudioChFormat.K7P1P4;
  }
  return AudioChFormat.NONE;
}

// Checks channel number and returns possible audio format candidates
export function audioFormatsFromChannels(
  numChannels: number,
  channelMask?: number
): AudioChFormat[] {
  switch (numChannels) {
    case 1:
      return [AudioChFormat.MONO];
    case 2:
      return [AudioChFormat.STEREO];
    case 6:
      return [AudioChFormat.K5P1, AudioChFormat.K3P1P2];
    case 8:
      return [AudioChFormat.K7P1, AudioChFormat.K5P1P2];
    case 10:
      return [AudioChFormat.K7P1P2, AudioChFormat.K5P1P4];
    case 12:
      return [AudioChFormat.K7P1P4];
  }
  return [AudioChFormat.NONE];
}

export function getChannelCountRaw(chFormat: AudioChFormat): number {
  switch (chFormat) {
    case AudioChFormat.MONO:
      return 1;
    case AudioChFormat.STEREO:
      return 2;
    case AudioChFormat.K3P1P2:
      return 6;
    case AudioChFormat.K5P1:
      return 6;
    case AudioChFormat.K5P1P2:
      return 8;
    case AudioChFormat.K5P1P4:
      return 10;
    case AudioChFormat.K7P1:
      return 8;
    case AudioChFormat.K7P1P2:
      return 10;
    case AudioChFormat.K7P1P4:
      return 12;
    default:
      throw new Error(
        `getChannelCountRaw(): Unknown channel format: ${chFormat}`
      );
  }
}

export function getSpeakerLabels(chFormat: AudioChFormat) {
  // Returns an array of speaker labels for a given format.
  switch (chFormat) {
    case AudioChFormat.MONO:
      return ["L"];
    case AudioChFormat.STEREO:
      return ["L", "R"];
    case AudioChFormat.K3P1P2:
      return ["L", "R", "C", "LFE", "Ls", "Rs"];
    case AudioChFormat.K5P1:
      return ["L", "R", "C", "LFE", "Ls", "Rs"];
    case AudioChFormat.K5P1P2:
      return ["L", "R", "C", "LFE", "Ls", "Rs", "Ltf", "Rtf"];
    case AudioChFormat.K5P1P4:
      return ["L", "R", "C", "LFE", "Ls", "Rs", "Ltf", "Rtf", "Ltb", "Rtb"];
    case AudioChFormat.K7P1:
      return ["L", "R", "C", "LFE", "Lss", "Rss", "Lrs", "Rrs"];
    case AudioChFormat.K7P1P2:
      return ["L", "R", "C", "LFE", "Lss", "Rss", "Lrs", "Rrs", "Ltf", "Rtf"];
    case AudioChFormat.K7P1P4:
      return [
        "L",
        "R",
        "C",
        "LFE",
        "Lss",
        "Rss",
        "Lrs",
        "Rrs",
        "Ltf",
        "Rtf",
        "Ltb",
        "Rtb",
      ];
    default:
      throw new Error(
        `getSpeakerLabels(): Unknown channel format: ${chFormat}`
      );
  }
}
