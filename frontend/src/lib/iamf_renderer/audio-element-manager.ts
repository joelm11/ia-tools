import InputGainController from "./input-gain-controller";

class AudioElementManager {
  private audioElements: Map<string, InputGainController | AudioBuffer>;
  private context: AudioContext;

  constructor(context: AudioContext) {
    this.audioElements = new Map();
    this.context = context;
  }

  public registerAudioElement(
    uuid: string,
    element: HTMLMediaElement | AudioBuffer
  ): void {
    if (element instanceof AudioBuffer) {
      this.audioElements.set(uuid, element);
    } else {
      const gainController = new InputGainController(this.context);
      const source = this.context.createMediaElementSource(element);
      source.connect(gainController.getGainNode());
      this.audioElements.set(uuid, gainController);
    }
  }

  public getInputGainController(uuid: string): InputGainController | undefined {
    const val = this.audioElements.get(uuid);
    return val instanceof InputGainController ? val : undefined;
  }
}

export default AudioElementManager;
