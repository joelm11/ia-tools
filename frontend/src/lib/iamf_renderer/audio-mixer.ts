import { AudioChFormat } from "src/@types/AudioFormats";
import { AudioElementManager } from "./audio-element-manager";
import { MasterGainController } from "./master-gain-controller";
import { PlaybackController } from "./playback-controller";
import type { MixPresentation } from "src/@types/MixPresentation";
import { LoudnessRenderer } from "./mix-loudness-node";

export class AudioMixer {
  private static instance: AudioMixer | null = null;
  private audioElementManager: AudioElementManager;
  private masterGainController: MasterGainController;
  private loudnessRenderer: LoudnessRenderer;
  private playbackController: PlaybackController;
  private playbackLayout: AudioChFormat = AudioChFormat.NONE;
  private activePresentation: MixPresentation | null = null;
  private isPlaying: boolean = false;
  private audioContext: AudioContext;

  public static async getInstance(): Promise<AudioMixer> {
    if (this.instance === null) {
      const ctx = new AudioContext();
      await ctx.audioWorklet.addModule("src/lib/mixer/MixerWorklet.js");
      await ctx.audioWorklet.addModule(
        "src/lib/iamf_renderer/loudness-renderer.js"
      );
      this.instance = new AudioMixer(ctx);
    }
    return this.instance;
  }

  constructor(audioContext: AudioContext) {
    this.audioContext = audioContext;
    this.audioElementManager = new AudioElementManager(audioContext);
    this.masterGainController = new MasterGainController(audioContext);
    this.loudnessRenderer = new LoudnessRenderer(
      audioContext,
      AudioChFormat.MONO
    );
    this.playbackController = new PlaybackController(this.audioElementManager);
    // Connect master gain node to audio context destination
    // Connect loudness monitor node from master gain to audio context dest
    this.masterGainController
      .getMasterGainNode()
      .connect(this.audioContext.destination);
  }

  getLoudnessValues(): number[] {
    return this.loudnessRenderer.currentLoudnessValues;
  }

  /**
   * Set a new MixPresentation, resetting the audio graph and storing playback layout.
   */
  setMixPresentation(presentation: MixPresentation): void {
    if (
      this.activePresentation &&
      this.activePresentation.id === presentation.id
    ) {
      return;
    }

    // Pause the current mix presentation if playing and reset source timestamps.
    if (this.activePresentation && this.activePresentation.audioElements) {
      this.pause();
      for (const elem of this.activePresentation.audioElements) {
        const sourceNode = this.audioElementManager.getSourceNode(elem.id);
        if (sourceNode) sourceNode.mediaElement.currentTime = 0;
      }
    }

    // Record the new active presentation
    this.activePresentation = presentation;
    this.playbackLayout = presentation.playbackFormat;
    this.audioElementManager.setPlaybackLayout(presentation.playbackFormat);

    // Reset audio graph: disconnect master gain and loudness renderer
    // and reconnect
    this.masterGainController.getMasterGainNode().disconnect();
    this.loudnessRenderer.disconnect();
    this.loudnessRenderer = new LoudnessRenderer(
      this.audioContext,
      presentation.playbackFormat
    );
    this.masterGainController
      .getMasterGainNode()
      .connect(this.loudnessRenderer);
    this.loudnessRenderer.connect(this.audioContext.destination);

    // Set master gain to that of the new active mix.
    this.masterGainController.setMasterGain(this.activePresentation.mixGain);

    // Disconnect element gain nodes from master as part of graph cleanup
    for (const elem of presentation.audioElements) {
      this.disconnectInputToMaster(elem.id);
    }

    // Re-register all audio elements from the new presentation
    for (const elem of presentation.audioElements) {
      const mediaElem = document.getElementById(elem.id) as HTMLMediaElement;
      if (!mediaElem) {
        console.log("Audio Element:", elem.id, "source not found.");
      } else {
        this.registerElement(elem.id, mediaElem, elem.audioChFormat);
        this.connectInputToMaster(elem.id);
        // Set gains for the element from the mix presentation.
        this.setAEGain(elem.gain, elem.id);
      }
    }

    // Set the output channels for the final gain node.
    // This is the output from the mixer before it hits the browser/user-provided
    // destination node.
    this.masterGainController.setOutputChannels(this.playbackLayout);
  }

  getActiveMixPresentation(): string | undefined {
    return this.activePresentation?.id;
  }

  /**
   * Register an audio element (HTMLMediaElement or AudioBuffer) by UUID.
   * Proxies to AudioElementManager.
   */
  registerElement(
    uuid: string,
    element: HTMLMediaElement,
    format: AudioChFormat
  ): void {
    this.audioElementManager.registerAudioElement(uuid, element, format);
  }

  /**
   * Connect an input's gain node to the master gain node.
   */
  connectInputToMaster(uuid: string): void {
    const inputGainController =
      this.audioElementManager.getInputGainController(uuid);
    if (!inputGainController) {
      throw new Error(`No InputGainController found for UUID: ${uuid}`);
    }
    inputGainController
      .getGainNode()
      .connect(this.masterGainController.getMasterGainNode());
  }

  /**
   * Disconnect all inputs from the master gain node.
   */
  disconnectInputToMaster(uuid: string): void {
    const inputGainController =
      this.audioElementManager.getInputGainController(uuid);
    if (inputGainController) {
      inputGainController
        .getGainNode()
        .disconnect(this.masterGainController.getMasterGainNode());
    }
  }

  /**
   * Play HTMLMediaElement sources that are part of the active mix presentation.
   */
  play(): void {
    this.playbackController.playMix(this.activePresentation!);
    this.isPlaying = true;
  }

  /**
   * Pause HTMLMediaElement sources that are part of the active mix presentation.
   */
  pause(): void {
    this.playbackController.pauseMix(this.activePresentation!);
    this.isPlaying = false;
  }

  playbackActive(): boolean {
    return this.isPlaying;
  }

  setMixGain(val: number, id: string) {
    if (this.activePresentation && this.activePresentation.id === id) {
      this.masterGainController.setMasterGain(val);
    }
  }

  setAEGain(val: number, id: string) {
    if (!this.activePresentation) {
      return;
    }
    const inputGainController =
      this.audioElementManager.getInputGainController(id);
    if (inputGainController) {
      inputGainController.setGain(val);
    } else {
      console.warn(`No InputGainController found for ID: ${id}`);
    }
  }

  // Optionally, expose the managers for testing/inspection
  getAudioElementManager(): AudioElementManager {
    return this.audioElementManager;
  }
  getMasterGainController(): MasterGainController {
    return this.masterGainController;
  }
}
