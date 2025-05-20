import { InputGainController } from "./input-gain-controller";

export class AudioElementManager {
  private audioElements: Map<string, InputGainController>;
  private context: AudioContext;

  constructor(context: AudioContext) {
    this.audioElements = new Map();
    this.context = context;
  }

  public registerAudioElement(uuid: string, element: HTMLMediaElement): void {
    const gainController = new InputGainController(this.context);
    const source = this.context.createMediaElementSource(element);
    source.connect(gainController.getGainNode());
    this.audioElements.set(uuid, gainController);
  }

  public getInputGainController(uuid: string): InputGainController | undefined {
    const val = this.audioElements.get(uuid);
    return val instanceof InputGainController ? val : undefined;
  }

  public clear(): void {
    // Disconnect all gain nodes from the audio graph
    for (const gainController of this.audioElements.values()) {
      const gainNode = gainController.getGainNode();
      try {
        gainNode.disconnect();
      } catch (e) {
        // Ignore errors if already disconnected
      }
    }
    // Clear the map
    this.audioElements.clear();
  }
}
