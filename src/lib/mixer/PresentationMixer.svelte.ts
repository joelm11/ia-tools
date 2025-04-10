import type { MixPresentation } from "src/@types/MixPresentation";

export class PresentationMixer {
  private audioContext: AudioContext = new AudioContext();
  private elemGainNodes: Map<string, GainNode> = new Map();
  private mixGainNode: GainNode = null as any;
  private activeMixPres: string = "";

  /**
   * @brief Full initialization of the object is left to the children. We simply
   * create the context here, the mix gain node, and connect the mgn to the output.
   */
  public constructor() {
    this.audioContext = new AudioContext();

    this.mixGainNode = this.audioContext.createGain();
    this.mixGainNode.connect(this.audioContext.destination);
  }

  /**
   * @brief Initializes the mixer for playback of a new or modified mix presentation.
   *
   */
  public reconfigureMixer(mixPresentation: MixPresentation) {
    this.activeMixPres = mixPresentation.id;
    this.initAudioSources(mixPresentation);
    // Connect audio sources and gain nodes to output mixer node.
    this.elemGainNodes.forEach((gainNode) => {
      gainNode.connect(this.mixGainNode);
    });
  }

  /**
   *
   * @param mixPresentation
   * @brief Creates source nodes in the graph and attaches gain nodes to each source.
   */
  private initAudioSources(mixPresentation: MixPresentation) {
    this.elemGainNodes.clear();

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

  public getActive(): string {
    return this.activeMixPres;
  }

  public setActive(mixPresentation: MixPresentation) {
    this.reconfigureMixer(mixPresentation);
  }

  public playpause() {
    if (this.audioContext.state === "suspended") {
      this.audioContext.resume();
    }

    this.elemGainNodes.forEach((_, id) => {
      const audioElem = document.getElementById(id) as HTMLMediaElement;
      if (audioElem) {
        if (audioElem.paused) {
          audioElem.play();
        } else {
          audioElem.pause();
        }
      }
    });
  }
}
