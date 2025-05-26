export class InputGainController {
  private gainNode: GainNode;

  constructor(context: AudioContext) {
    this.gainNode = context.createGain();
  }

  public getGainNode(): GainNode {
    return this.gainNode;
  }

  public setGain(value: number): void {
    this.gainNode.gain.value = value;
  }
}
