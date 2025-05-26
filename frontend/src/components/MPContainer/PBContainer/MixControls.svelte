<script lang="ts">
  import VolumeSlider from "./VolumeSlider.svelte";
  let { handlePlayPause, setMasterGain, isPlaying, isActive } = $props();
</script>

<div id="play-and-volume" class="flex items-center justify-center p-2 gap-24">
  <button
    id="play-pause"
    class="flex items-center justify-center bg-mp-card-t-background rounded-full w-12 aspect-square hover:bg-mp-card-t-background-dark shadow-lg"
    onclick={handlePlayPause}
    aria-label="Play/Pause Mix Presentation"
  >
    {#if isPlaying && isActive}
      <i class="fas fa-pause"></i>
    {:else}
      <i class="fas fa-play"></i>
    {/if}
  </button>
  <div class="flex items-center">
    <VolumeSlider setGain={setMasterGain} />
  </div>
</div>
