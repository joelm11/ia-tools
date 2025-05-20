class MasterGainController {
  private gainNode: GainNode;

  constructor(context: AudioContext) {
    this.gainNode = context.createGain();
  }
}

export default MasterGainController;
