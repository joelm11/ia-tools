<script lang="ts">
  import PbElemAe from "./PBElemAE.svelte";
  import { AudioMixer } from "src/@lib/iamf_renderer/audio-mixer";

  let { mixPresentation, isPlaying = $bindable() } = $props();
  let mixGain = $state(50);
  let mixer: AudioMixer;

  function handlePlayPause() {
    mixer = AudioMixer.getInstance();
    mixer.setMixPresentation(mixPresentation);
    if (isPlaying) mixer.pause();
    else mixer.play();
    isPlaying = !isPlaying;
  }
</script>

<div
  class="grid grid-cols-2 bg-app border border-ae-card-background rounded-md gap-2 p-2"
>
  <div id="play-and-volume" class="col-span-1 grid grid-cols-5 p-2">
    <div
      id="wave-viz col-span-5"
      class="col-span-5 h-20 mb-2 rounded-md bg-ae-card-background border border-card-s-text"
    ></div>
    <button
      id="play-pause"
      class="col-span-2 mt-2 flex items-center justify-center bg-mp-card-t-background rounded-full w-14 h-14 hover:bg-mp-card-t-background-dark"
      onclick={handlePlayPause}
      aria-label="Play/Pause Mix Presentation"
    >
      <i
        class="fas {isPlaying
          ? 'fa-pause'
          : 'fa-play'} text-2xl text-mp-card-t-text"
      >
      </i></button
    >
    <input
      id="volume-slider"
      type="range"
      min="0"
      max="100"
      class="col-span-3 mt-2 w-full h-2 bg-mp-card-t-background
      rounded-lg appearance-none cursor-pointer hover:bg-mp-card-t-background-dark accent-ae-card-background self-center"
      aria-label="Volume Slider"
      bind:value={mixGain}
      oninput={() => {
        mixPresentation.mixGain = mixGain / 100;
        mixer.getMasterGainController().setMasterGain(mixPresentation.mixGain);
      }}
    />
  </div>
  <div id="mp-audio-elements" class="col-span-1 h-24 items-center m-2 gap-2">
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
  </div>
</div>
