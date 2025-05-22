<script lang="ts">
  import { onDestroy, onMount } from "svelte";
  import LoudnessMeters from "./loudness/LoudnessBars.svelte";
  import PbElemAe from "./PBElemAE.svelte";
  import { AudioMixer } from "src/@lib/iamf_renderer/audio-mixer";
  import VolumeSlider from "./VolumeSlider.svelte";
  import MixControls from "./MixControls.svelte";

  let { mixPresentation, isPlaying = $bindable() } = $props();
  let currentLoudnessValues = $state();
  let mixer: AudioMixer;
  let intervalId: number;

  async function updateLoudness() {
    mixer = await AudioMixer.getInstance();
    currentLoudnessValues = mixer.getLoudnessValues();
  }

  onMount(() => {
    intervalId = window.setInterval(updateLoudness, 1000 / 60);
  });

  onDestroy(() => {
    window.clearInterval(intervalId);
  });

  async function handlePlayPause() {
    mixer = await AudioMixer.getInstance();
    mixer.setMixPresentation(mixPresentation);
    if (isPlaying) mixer.pause();
    else mixer.play();
    isPlaying = !isPlaying;
  }
</script>

<div
  class="grid grid-cols-2 bg-app border border-ae-card-background rounded-md gap-2 p-2"
>
  <div
    class="cols-span-1 rounded-md bg-ae-card-background border
     border-card-s-text h-full"
    id="wave-vis-mix-controls"
  >
    <MixControls></MixControls>
  </div>
</div>

<!-- <div id="mp-audio-elements" class="col-span-1 h-24 items-center m-2 gap-2">
    {#if mixPresentation.audioElements.length < 4}
      <div class="grid grid-cols-1 gap-2">
        {#each mixPresentation.audioElements as audioElement}
          <PbElemAe {audioElement} />
        {/each}
      </div>
    {:else}
      <div class="grid grid-cols-2 gap-2">
        {#each mixPresentation.audioElements as audioElement}
          <PbElemAe {audioElement} />
        {/each}
      </div>
    {/if}
  </div> -->
