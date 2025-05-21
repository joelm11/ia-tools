import { AudioChFormat } from "src/@types/AudioFormats";
import { ElementMixNode } from "./ElementMixNode";
import { InputGainController } from "./input-gain-controller";

interface SourceGainPair {
  source: MediaElementAudioSourceNode;
  sourceGain: InputGainController;
  mixNode: ElementMixNode;
}

export class AudioElementManager {
  private audioElementNodes: Map<string, SourceGainPair>;
  private context: AudioContext;
  private playbackLayout: AudioChFormat = AudioChFormat.NONE;

  constructor(context: AudioContext) {
    this.audioElementNodes = new Map();
    this.context = context;
  }

  public registerAudioElement(
    uuid: string,
    element: HTMLMediaElement,
    inputLayout: AudioChFormat = AudioChFormat.STEREO
  ): void {
    const gainController = new InputGainController(this.context);
    if (!this.audioElementNodes.get(uuid)) {
      const source = this.context.createMediaElementSource(element);
      const mixNode = new ElementMixNode(
        this.context,
        inputLayout,
        this.playbackLayout
      );
      source.connect(mixNode);
      mixNode.connect(gainController.getGainNode());
      this.audioElementNodes.set(uuid, {
        source: source,
        sourceGain: gainController,
        mixNode: mixNode,
      });
    }
  }

  public setPlaybackLayout(layout: AudioChFormat) {
    this.playbackLayout = layout;
  }

  public getInputGainController(uuid: string): InputGainController | undefined {
    return this.audioElementNodes.get(uuid)?.sourceGain;
  }

  public getMixNode(uuid: string): ElementMixNode | undefined {
    return this.audioElementNodes.get(uuid)?.mixNode;
  }

  public getAllSourceNodes(): MediaElementAudioSourceNode[] {
    return Array.from(this.audioElementNodes.values()).map(
      (elem) => elem.source
    );
  }
}
