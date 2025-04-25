<script lang="ts">
  import PbElemAe from "./PBElemAE.svelte";

  let { mixPresentation, presentationMixer } = $props();

  function handlePlayPause() {
    if (presentationMixer.getActive() != mixPresentation.id) {
      console.log("Reconfiguring");
      presentationMixer.reconfigureMixer(mixPresentation);
    }
    presentationMixer.playpause();
  }
</script>

<div
  class="grid grid-cols-6 bg-app border border-ae-card-background rounded-md gap-2 p-2"
>
  <!-- Mix Play and Mix Volume -->
  <div id="play-and-volume" class="col-span-1 h-24 flex items-center pl-3">
    <button
      onclick={handlePlayPause}
      class="p-2 bg-mp-card-t-background hover:bg-mp-card-t-background-dark rounded-full w-12 h-12 flex items-center justify-center"
      aria-label="Play Mix Presentation"
    >
      <i class="fas fa-play text-2xl"></i>
    </button>
  </div>

  <!-- Placeholder for waveform -->
  <div
    class="col-span-5 h-24 bg-card-s-text text-center flex items-center justify-center"
  >
    Placeholder for Waveform
  </div>

  <!-- Render Audio Elements -->
  <div class="col-span-3 flex flex-col gap-2">
    {#each mixPresentation.audioElements as audioElement}
      <PbElemAe {audioElement}></PbElemAe>
    {/each}
  </div>
</div>
