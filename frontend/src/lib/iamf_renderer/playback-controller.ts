import { AudioElementManager } from "./audio-element-manager";

export class PlaybackController {
  private audioElementManager: AudioElementManager;

  constructor(audioElementManager: AudioElementManager) {
    this.audioElementManager = audioElementManager;
  }

  playAll(): void {
    const allElements = this.audioElementManager.getAllSourceNodes();
    console.log(allElements);
    for (const element of allElements) {
      element.mediaElement.play();
    }
  }

  pauseAll(): void {
    const allElements = this.audioElementManager.getAllSourceNodes();
    for (const element of allElements) {
      element.mediaElement.pause();
    }
  }
}
