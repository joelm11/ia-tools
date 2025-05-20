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
}
