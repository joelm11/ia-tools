<script lang="ts">
  import { onDestroy, onMount } from "svelte";
  import { AudioMixer } from "src/@lib/iamf_renderer/audio-mixer";
  import MixControls from "./MixControls.svelte";
  import WaveViz from "./WaveViz.svelte";
  import PBAEContainer from "./PBAEContainer.svelte";
  import {
    getChannelCountRaw,
    getSpeakerLabels,
  } from "src/@common/AudioFormatsTools";
  import type { MixPresentation } from "src/@types/MixPresentation";

  let {
    mixPresentation,
    isActive,
    activeMix = $bindable(),
  }: {
    mixPresentation: MixPresentation;
    isActive: boolean;
    activeMix: string;
  } = $props();
  let currentLoudnessValues: number[] = $state([-60, -60]);
  let isPlaying = $state(false);
  let mixer: AudioMixer;
  let intervalId: number;

  async function updateLoudness() {
    mixer = await AudioMixer.getInstance();
    if (mixer.getActiveMixPresentation() === mixPresentation.id) {
      currentLoudnessValues = mixer.getLoudnessValues();
    } else {
      currentLoudnessValues = Array(
        getChannelCountRaw(mixPresentation.playbackFormat)
      ).fill(-60);
    }
  }

  onMount(async () => {
    mixer = await AudioMixer.getInstance();
    const handleMixFinished = () => {
      isPlaying = false; // Reset play/pause button state
    };
    window.addEventListener("mixFinished", handleMixFinished); // Listen for custom event
    intervalId = window.setInterval(updateLoudness, 1000 / 60);
  });

  onDestroy(() => {
    const handleMixFinished = () => {
      isPlaying = false; // Reset play/pause button state
    };
    window.removeEventListener("mixFinished", handleMixFinished); // Cleanup listener
    window.clearInterval(intervalId);
  });

  async function handlePlayPause() {
    mixer = await AudioMixer.getInstance();
    mixer.setMixPresentation(mixPresentation);
    if (mixer.playbackActive()) mixer.pause();
    else mixer.play();
    isPlaying = mixer.playbackActive();
    activeMix = mixPresentation.id;
  }

  async function setMasterGain(val: number) {
    mixPresentation.mixGain = val;
    mixer = await AudioMixer.getInstance();
    mixer.setMixGain(mixPresentation.mixGain, mixPresentation.id);
  }

  async function setAEGain(aeId: string, val: number) {
    mixer = await AudioMixer.getInstance();
    const audioElement = mixPresentation.audioElements.find(
      (ae) => ae.id === aeId
    );
    if (audioElement) {
      audioElement.gain = val;
      mixer.setAEGain(val, aeId);
    }
  }
</script>

<div
  class="grid grid-cols-2 bg-app border border-ae-card-background rounded-md gap-2 p-2 h-full"
>
  <div
    class="col-span-1 rounded-md bg-ae-card-background border border-card-s-text px-1 h-36 flex flex-col"
    id="wave-vis-mix-controls"
  >
    <div class="flex-[2]">
      <WaveViz
        {currentLoudnessValues}
        speakerLabels={getSpeakerLabels(mixPresentation.playbackFormat)}
      />
    </div>
    <hr class="w-11/12 mx-auto border-t border-card-p-text/50" />
    <div class="flex-[1]">
      <MixControls {handlePlayPause} {setMasterGain} {isPlaying} {isActive} />
    </div>
  </div>
  <div class="col-span-1 flex-grow">
    <PBAEContainer {mixPresentation} {setAEGain} />
  </div>
</div>
