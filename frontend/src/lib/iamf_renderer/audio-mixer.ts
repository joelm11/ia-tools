import { AudioElementManager } from "./audio-element-manager";
import { MasterGainController } from "./master-gain-controller";
import { PlaybackController } from "./playback-controller";

export class AudioMixer {
  private audioElementManager: AudioElementManager;
  private masterGainController: MasterGainController;
  private playbackController: PlaybackController;
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

  // ...future methods...
}
