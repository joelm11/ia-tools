import type { MixPresentation } from "src/@types/MixPresentation";

export class PresentationMixer {
  private audioContext: AudioContext;
  private elemGainNodes: Map<string, GainNode>;
  private mixGainNode: GainNode;

  constructor(mixPresentation: MixPresentation) {
    this.audioContext = new AudioContext();
    this.elemGainNodes = new Map();
    this.initAudioSources(mixPresentation);
    // Connect audio sources and gain nodes to mixer node.
    this.mixGainNode = this.audioContext.createGain();
    this.elemGainNodes.forEach((gainNode) => {
      gainNode.connect(this.mixGainNode);
    });
    // Connect the mixer node to the output.
    this.mixGainNode.connect(this.audioContext.destination);
  }

  /**
   *
   * @param mixPresentation
   * @brief Creates source nodes in the graph and attaches gain nodes to each source.
   */
  private initAudioSources(mixPresentation: MixPresentation) {
    for (const audioElement of mixPresentation.audioElements) {
      // Get each audio source from the DOM.
      const audioDOMElem = document.getElementById(
        audioElement.id
      ) as HTMLMediaElement;
      if (!audioDOMElem) {
        console.error(`Audio element with id "${audioElement.id}" not found`);
        continue;
      }
      // Make a source node in the audio context.
      const track = this.audioContext.createMediaElementSource(audioDOMElem);
      // Connect gain nodes to each source node.
      const elemGainNode = this.audioContext.createGain();
      this.elemGainNodes.set(audioElement.id, elemGainNode);
      track.connect(elemGainNode);
    }
  }
}
