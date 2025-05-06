import type { MixPresentation } from "src/@types/MixPresentation";
import type { MixerInterface } from "./MixerInterface";
import { getMixMatrix } from "./GetMixMatrix";
import { getChannelCountRaw } from "src/@common/AudioFormatsTools";

export class PresentationMixer extends EventTarget implements MixerInterface {
  private static instance: PresentationMixer | null = null;
  private audioContext: AudioContext = new AudioContext();
  private elemGainNodes: Map<string, AudioWorkletNode> = new Map();
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
      // this.elemGainNodes
      //   .get(elementID)
      //   ?.parameters.get("gain")
      //   .setValueAtTime(gain, this.audioContext.currentTime);
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
  private async reconfigureMixer(mixPresentation: MixPresentation) {
    // Let the children know that the mixer is being reconfigured.
    this.dispatchEvent(new Event("allElementsFinished"));
    this.resetAudioSources();
    this.clearGraph();
    this.initAudioSources(mixPresentation);
    // Load the worklet module.
    const workletURL = new URL("MixerWorklet.js", import.meta.url).href;
    try {
      await this.audioContext.audioWorklet.addModule(workletURL);
    } catch (error) {
      console.error("Error loading audio worklet module:", error);
    }
    // Get the gain matrix for each AELayout -> MPLayout and instantiate mixers.
    for (const elem of mixPresentation.audioElements) {
      const gainMat = getMixMatrix(
        elem.audioChFormat,
        mixPresentation.playbackFormat
      );
      try {
        const workletNode = new AudioWorkletNode(
          this.audioContext,
          "matrix-gain-processor", // This name must match the registerProcessor call
          {
            processorOptions: {
              matrix: gainMat, // Passing the matrix to the processor's constructor
            },
            // I/O for node.
            numberOfInputs: 1,
            numberOfOutputs: 1,
            channelCountMode: "max",
            outputChannelCount: [gainMat.length],
          }
        );

        const audioElementSource = this.mediaElementSources.get(elem.id);
        if (audioElementSource) {
          // Connect the source to the worklet node
          audioElementSource.connect(workletNode);
          // Connect the worklet node's outputs to the next node (e.g., a main gain node)
          workletNode.connect(this.mixGainNode);
          // Store the worklet node if needed
          this.elemGainNodes.set(elem.id, workletNode);
        } else {
          console.warn(`Audio element source not found for element ${elem.id}`);
        }
      } catch (e) {
        console.error(
          `Error instantiating or connecting worklet for element ${elem.id}:`,
          e
        );
      }
    }
    // Configure the final mixer correctly.
    this.mixGainNode.channelCountMode = "max";
    this.mixGainNode.channelCount = getChannelCountRaw(
      mixPresentation.playbackFormat
    );
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
    }
  }

  /**
   * @brief Clears old audio sources and gain nodes before reconstructing graph.
   */
  private clearGraph() {
    this.elemGainNodes.forEach((workletNode) => {
      workletNode.disconnect();
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
