import type { MixPresentation } from "src/@types/MixPresentation";
import { AudioElementManager } from "./audio-element-manager";

export class PlaybackController {
  private audioElementManager: AudioElementManager;

  constructor(audioElementManager: AudioElementManager) {
    this.audioElementManager = audioElementManager;
  }

  playAll(): void {
    const allElements = this.audioElementManager.getAllSourceNodes();
    for (const element of allElements) {
      element.mediaElement.play();
    }
  }

  playMix(presentation: MixPresentation) {
    const elementIds = Array.from(
      presentation.audioElements.map((element) => element.id)
    );
    for (const id of elementIds) {
      const sourceNode = this.audioElementManager.getSourceNode(id);
      if (sourceNode) {
        sourceNode.mediaElement.play();
      }
    }
  }

  pauseMix(presentation: MixPresentation) {
    const elementIds = Array.from(
      presentation.audioElements.map((element) => element.id)
    );
    for (const id of elementIds) {
      const sourceNode = this.audioElementManager.getSourceNode(id);
      if (sourceNode) {
        sourceNode.mediaElement.pause();
      }
    }
  }

  pauseAll(): void {
    const allElements = this.audioElementManager.getAllSourceNodes();
    for (const element of allElements) {
      element.mediaElement.pause();
    }
  }
}
