import { getChannelCountRaw } from "src/@common/AudioFormatsTools";
import { AudioChFormat } from "src/@types/AudioFormats";

export class MasterGainController {
  private gainNode: GainNode;

  constructor(context: AudioContext) {
    this.gainNode = context.createGain();
  }

  public getMasterGainNode(): GainNode {
    return this.gainNode;
  }

  public setMasterGain(value: number): void {
    this.gainNode.gain.value = value;
  }

  public setOutputChannels(chFormat: AudioChFormat): void {
    const channels = getChannelCountRaw(chFormat);
    this.gainNode.channelCount = channels;
    this.gainNode.channelCountMode = "explicit";
  }
}
