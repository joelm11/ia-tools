import { InputGainController } from "./input-gain-controller";

export class AudioElementManager {
  private audioElementNodes: Map<
    string,
    { source: MediaElementAudioSourceNode; sourceGain: InputGainController }
  >;
  private context: AudioContext;

  constructor(context: AudioContext) {
    this.audioElementNodes = new Map();
    this.context = context;
  }

  public registerAudioElement(uuid: string, element: HTMLMediaElement): void {
    const gainController = new InputGainController(this.context);
    const source = this.context.createMediaElementSource(element);
    source.connect(gainController.getGainNode());
    this.audioElementNodes.set(uuid, {
      source: source,
      sourceGain: gainController,
    });
  }

  public getInputGainController(uuid: string): InputGainController | undefined {
    return this.audioElementNodes.get(uuid)?.sourceGain;
  }

  public getAllSourceNodes(): MediaElementAudioSourceNode[] {
    return Array.from(this.audioElementNodes.values()).map(
      (elem) => elem.source
    );
  }

  public clear(): void {
    // Disconnect all gain nodes from the audio graph
    for (const elemNode of this.audioElementNodes.values()) {
      const gainNode = elemNode.sourceGain.getGainNode();
      try {
        gainNode.disconnect();
      } catch (e) {
        // Ignore errors if already disconnected
      }
    }
    // Clear the map
    this.audioElementNodes.clear();
  }
}
