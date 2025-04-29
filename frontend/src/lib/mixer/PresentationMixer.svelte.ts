import type { MixPresentation } from "src/@types/MixPresentation";

export class PresentationMixer {
  private static instance: PresentationMixer | null = null;
  private audioContext: AudioContext = new AudioContext();
  private elemGainNodes: Map<string, GainNode> = new Map();
  private mediaElementSources: Map<string, MediaElementAudioSourceNode> =
    new Map();
  private mixGainNode: GainNode = null as any;
  private activeMixPres: string = "";

  /**
   * @brief Singleton pattern to ensure only one instance of the mixer exists.
   * @returns The singleton instance of the PresentationMixer.
   */
  public static getInstance(): PresentationMixer {
    if (this.instance === null) {
      this.instance = new PresentationMixer();
    }
    return this.instance;
  }

  /**
   * @brief Full initialization of the object is left to the children. We simply
   * create the context here, the mix gain node, and connect the mgn to the output.
   */
  private constructor() {
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
    this.resetAudioSources();
    this.clearGraph();
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
    for (const audioElement of mixPresentation.audioElements) {
      // Get each audio source from the DOM.
      const audioDOMElem = document.getElementById(
        audioElement.id
      ) as HTMLMediaElement;
      if (!audioDOMElem) {
        console.error(`Audio element with id "${audioElement.id}" not found`);
        continue;
      }

      // Reuse existing source or create new one
      let track = this.mediaElementSources.get(audioElement.id);
      if (!track) {
        track = this.audioContext.createMediaElementSource(audioDOMElem);
        this.mediaElementSources.set(audioElement.id, track);
      } else {
      }

      // Connect gain nodes to each source node.
      const elemGainNode = this.audioContext.createGain();
      this.elemGainNodes.set(audioElement.id, elemGainNode);
      track.connect(elemGainNode);
    }
  }

  /**
   * @brief Clears old audio sources and gain nodes before reconstructing graph.
   */
  private clearGraph() {
    this.elemGainNodes.forEach((gainNode) => {
      gainNode.disconnect();
    });
    this.elemGainNodes.clear();
  }

  /**
   * @brief Pauses all audio elements and resets their current time to 0.
   */
  public resetAudioSources() {
    this.mediaElementSources.forEach((source, id) => {
      const audioElem = document.getElementById(id) as HTMLMediaElement;
      if (audioElem) {
        audioElem.pause();
        audioElem.currentTime = 0;
      }
    });
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

  public resetTrack(elementId: string) {
    const audioElem = document.getElementById(elementId) as HTMLMediaElement;
    if (audioElem && this.mediaElementSources.has(elementId)) {
      audioElem.pause();
      audioElem.currentTime = 0;
    }
  }

  public resetAllTracks() {
    this.mediaElementSources.forEach((_, id) => this.resetTrack(id));
  }
}
