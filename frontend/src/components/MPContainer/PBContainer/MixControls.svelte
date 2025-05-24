<script lang="ts">
  import VolumeSlider from "./VolumeSlider.svelte";
  let { handlePlayPause, setMasterGain, isPlaying } = $props();
</script>

<div id="play-and-volume" class="grid grid-cols-5 p-2 gap-1">
  <button
    id="play-pause"
    class="col-span-2 flex items-center justify-center bg-mp-card-t-background rounded-full w-16 aspect-square hover:bg-mp-card-t-background-dark shadow-lg"
    onclick={handlePlayPause}
    aria-label="Play/Pause Mix Presentation"
  >
    {#if isPlaying}
      <i class="fas fa-pause"></i>
    {:else}
      <i class="fas fa-play"></i>
    {/if}
  </button>
  <div class="col-span-3 flex align-middle">
    <VolumeSlider setGain={setMasterGain} />
  </div>
</div>
