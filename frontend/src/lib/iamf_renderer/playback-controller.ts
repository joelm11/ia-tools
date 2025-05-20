import { AudioElementManager } from "./audio-element-manager";

export class PlaybackController {
  private audioElementManager: AudioElementManager;

  constructor(audioElementManager: AudioElementManager) {
    this.audioElementManager = audioElementManager;
  }

  playAll(): void {
    // Assuming AudioElementManager has a getAllElements() method that returns a Map of all registered elements/controllers
    const allElements = this.audioElementManager.getAllElements?.() || [];
    for (const element of allElements.values?.() || []) {
      element.play();
    }
  }

  pauseAll(): void {
    const allElements = this.audioElementManager.getAllElements?.() || [];
    for (const element of allElements.values?.() || []) {
      if (element instanceof HTMLMediaElement) {
        element.pause();
      } else if (element?.mediaElement instanceof HTMLMediaElement) {
        element.mediaElement.pause();
      }
    }
  }
}
