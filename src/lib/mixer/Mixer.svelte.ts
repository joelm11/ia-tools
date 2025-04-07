/*
The mixer takes audio elements through a mix presentation, applies their gains, then mixes and applies the final gain.
*/

interface MixTrack {
  audio: HTMLAudioElement;
  gain: number;
}

interface MixConfig {
  tracks: MixTrack[];
  masterGain: number;
}

export class AudioMixer {
  private context: AudioContext;
  private masterGain: GainNode;
  private tracks: Map<HTMLAudioElement, GainNode>;

  constructor() {
    this.context = new AudioContext();
    this.masterGain = this.context.createGain();
    this.masterGain.connect(this.context.destination);
    this.tracks = new Map();
  }

  setMasterGain(gain: number) {
    this.masterGain.gain.value = Math.max(0, Math.min(1, gain));
  }

  addTrack(track: MixTrack) {
    const source = this.context.createMediaElementSource(track.audio);
    const gainNode = this.context.createGain();
    gainNode.gain.value = track.gain;

    source.connect(gainNode);
    gainNode.connect(this.masterGain);
    this.tracks.set(track.audio, gainNode);
  }

  updateTrackGain(audio: HTMLAudioElement, gain: number) {
    const gainNode = this.tracks.get(audio);
    if (gainNode) {
      gainNode.gain.value = Math.max(0, Math.min(1, gain));
    }
  }

  removeTrack(audio: HTMLAudioElement) {
    const gainNode = this.tracks.get(audio);
    if (gainNode) {
      gainNode.disconnect();
      this.tracks.delete(audio);
    }
  }

  disconnect() {
    this.tracks.forEach((gainNode) => gainNode.disconnect());
    this.masterGain.disconnect();
    this.tracks.clear();
  }
}
