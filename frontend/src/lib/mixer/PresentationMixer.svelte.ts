import type { MixPresentation } from "src/@types/MixPresentation";
import type { MixerInterface } from "./MixerInterface";

export class PresentationMixer extends EventTarget implements MixerInterface {
  private static instance: PresentationMixer | null = null;
  private audioContext: AudioContext = new AudioContext();
  private elemGainNodes: Map<string, GainNode> = new Map();
  // Maps an audio element ID to its MediaElementAudioSourceNode
  private mediaElementSources: Map<string, MediaElementAudioSourceNode> =
    new Map();
  private mixGainNode: GainNode = null as any;
  private activeMixPres: string = "";

  public static getInstance(): PresentationMixer {
    if (this.instance === null) {
      this.instance = new PresentationMixer();
    }
    return this.instance;
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

  public setActive(mixPresentation: MixPresentation) {
    if (this.activeMixPres !== mixPresentation.id) {
      this.activeMixPres = mixPresentation.id;
      this.reconfigureMixer(mixPresentation);
    }
  }

  public setGain(gain: number, elementID?: string): void {
    if (elementID && this.elemGainNodes.has(elementID)) {
      this.elemGainNodes
        .get(elementID)
        ?.gain.setValueAtTime(gain, this.audioContext.currentTime);
    } else {
      this.mixGainNode.gain.setValueAtTime(gain, this.audioContext.currentTime);
    }
  }

  /**
   * @brief Full initialization of the object is left to the children. We simply
   * create the context here, the mix gain node, and connect the mgn to the output.
   */
  private constructor() {
    super();
    this.audioContext = new AudioContext();

    this.mixGainNode = this.audioContext.createGain();
    this.mixGainNode.connect(this.audioContext.destination);
  }

  /**
   * @brief Initializes the mixer for playback of a new or modified mix presentation.
   *
   */
  private reconfigureMixer(mixPresentation: MixPresentation) {
    // Let the children know that the mixer is being reconfigured.
    this.dispatchEvent(new Event("allElementsFinished"));
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
        audioDOMElem.addEventListener("ended", () => {
          this.onEnded();
        });
        track = this.audioContext.createMediaElementSource(audioDOMElem);
        this.mediaElementSources.set(audioElement.id, track);
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
  private resetAudioSources() {
    this.mediaElementSources.forEach((source, id) => {
      const audioElem = document.getElementById(id) as HTMLMediaElement;
      if (audioElem) {
        audioElem.pause();
        audioElem.currentTime = 0;
      }
    });
  }

  private onEnded() {
    let allAudioEnded = true;
    this.mediaElementSources.forEach((source, id) => {
      const audioElem = document.getElementById(id) as HTMLMediaElement;
      if (audioElem && !audioElem.ended) {
        allAudioEnded = false;
      }
    });

    if (allAudioEnded) {
      this.dispatchEvent(new Event("allElementsFinished"));
    }
  }
}
