<script lang="ts">
  import PBContainerElem from "./PBContainerElem.svelte";

  let { mixPresentation, setAEGain } = $props();
</script>

<div id="mp-audio-elements" class="col-span-1 h-24 items-center m-2 gap-2">
  {#if mixPresentation.audioElements.length < 4}
    <div class="grid grid-cols-1 gap-2">
      {#each mixPresentation.audioElements as audioElement}
        <PBContainerElem {audioElement} {setAEGain} />
      {/each}
    </div>
  {:else}
    <div class="grid grid-cols-2 gap-2">
      {#each mixPresentation.audioElements as audioElement}
        <PBContainerElem {audioElement} {setAEGain} />
      {/each}
    </div>
  {/if}
</div>
