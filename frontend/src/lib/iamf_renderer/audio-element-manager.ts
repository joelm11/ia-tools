import { InputGainController } from "./input-gain-controller";

interface SourceGainPair {
  source: MediaElementAudioSourceNode;
  sourceGain: InputGainController;
}

export class AudioElementManager {
  private audioElementNodes: Map<string, SourceGainPair>;
  private context: AudioContext;

  constructor(context: AudioContext) {
    this.audioElementNodes = new Map();
    this.context = context;
  }

  public registerAudioElement(uuid: string, element: HTMLMediaElement): void {
    const gainController = new InputGainController(this.context);
    if (!this.audioElementNodes.get(uuid)) {
      console.log("Creating source media element");
      const source = this.context.createMediaElementSource(element);
      source.connect(gainController.getGainNode());
      this.audioElementNodes.set(uuid, {
        source: source,
        sourceGain: gainController,
      });
    }
    console.log("Element already registered");
  }

  public getInputGainController(uuid: string): InputGainController | undefined {
    return this.audioElementNodes.get(uuid)?.sourceGain;
  }

  public getAllSourceNodes(): MediaElementAudioSourceNode[] {
    return Array.from(this.audioElementNodes.values()).map(
      (elem) => elem.source
    );
  }
}
