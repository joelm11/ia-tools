<script lang="ts">
  import PBContainerElem from "./PBContainerElem.svelte";

  let { mixPresentation, setAEGain } = $props();
  let shrink = $state(false);
</script>

<div
  id="mp-audio-elements"
  class="col-span-1 h-full flex items-center justify-center max-w-full overflow-hidden"
>
  <div
    class="grid grid-cols-2 gap-2 auto-rows-[minmax(50px,_1fr)] sm:auto-rows-[minmax(40px,_1fr)] w-full h-full"
  >
    {#each mixPresentation.audioElements as audioElement, i}
      <div class="h-full max-w-full overflow-hidden">
        <PBContainerElem {audioElement} {setAEGain} />
      </div>
    {/each}
  </div>
</div>
