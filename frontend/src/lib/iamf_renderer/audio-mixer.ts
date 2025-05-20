import { AudioChFormat } from "src/@types/AudioFormats";
import { AudioElementManager } from "./audio-element-manager";
import { MasterGainController } from "./master-gain-controller";
import { PlaybackController } from "./playback-controller";
import type { MixPresentation } from "src/@types/MixPresentation";

export class AudioMixer {
  private audioElementManager: AudioElementManager;
  private masterGainController: MasterGainController;
  private playbackController: PlaybackController;
  private playbackLayout: AudioChFormat = AudioChFormat.NONE;
  private audioContext: AudioContext;

  constructor(audioContext: AudioContext) {
    this.audioContext = audioContext;
    this.audioElementManager = new AudioElementManager(audioContext);
    this.masterGainController = new MasterGainController(audioContext);
    this.playbackController = new PlaybackController(this.audioElementManager);
    // Connect master gain node to audio context destination
    this.masterGainController
      .getMasterGainNode()
      .connect(this.audioContext.destination);
  }

  /**
   * Set a new MixPresentation, resetting the audio graph and storing playback layout.
   */
  setMixPresentation(presentation: MixPresentation): void {
    // Store playback layout
    this.playbackLayout = presentation.playbackFormat;
    // Reset audio graph: disconnect master gain from destination, reconnect
    this.masterGainController.getMasterGainNode().disconnect();
    this.masterGainController
      .getMasterGainNode()
      .connect(this.audioContext.destination);

    // Clear all registered audio elements
    this.audioElementManager.clear();

    // Re-register all audio elements from the new presentation
    for (const elem of presentation.audioElements) {
      this.registerElement((elem as any).id, (elem as any).mediaElement);
    }

    // Set the output channels for the final gain node.
    // This is the output from the mixer before it hits the browser/user-provided
    // destination node.
    this.masterGainController.setOutputChannels(this.playbackLayout);
  }

  /**
   * Register an audio element (HTMLMediaElement or AudioBuffer) by UUID.
   * Proxies to AudioElementManager.
   */
  registerElement(uuid: string, element: HTMLMediaElement): void {
    this.audioElementManager.registerAudioElement(uuid, element);
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
   * Play all HTMLMediaElement sources via PlaybackController
   */
  play(): void {
    this.playbackController.playAll();
  }

  /**
   * Pause all HTMLMediaElement sources via PlaybackController
   */
  pause(): void {
    this.playbackController.pauseAll();
  }

  // Optionally, expose the managers for testing/inspection
  getAudioElementManager(): AudioElementManager {
    return this.audioElementManager;
  }
  getMasterGainController(): MasterGainController {
    return this.masterGainController;
  }
}
