<script lang="ts">
  import PbElem from "./PBElem.svelte";
  import type { MixPresentation } from "src/@types/MixPresentation";
  import { PresentationMixer } from "src/@lib/mixer/PresentationMixer.svelte";

  const { mixPresentations } = $props<{
    mixPresentations: MixPresentation[];
  }>();

  const presentationMixer = $state<PresentationMixer>(new PresentationMixer());
</script>

<div
  class="col-span-3 h-full flex flex-col text-left gap-1 bg-card-background rounded-2xl p-4 border border-ae-card-background"
>
  <div id="pb-container-header" class="flex justify-between">
    <div class="text-card-p-text mb-1 text-2xl w-32">Playback</div>
    <!-- Use fontawesome icon for download button. -->
    {#if mixPresentations.length > 0}
      <button
        id="add-mix-presentation"
        class="bg-slate-500 hover:bg-slate-600 text-white rounded-full w-8 h-8 flex items-center justify-center"
        aria-label="Export mix presentations as IAMF file button"
      >
        <i class="fas fa-download text-xl"></i>
      </button>
    {/if}
  </div>
  <div class="border-b border-ae-card-background mb-2"></div>
  <div class="flex flex-col gap-2">
    {#each mixPresentations as mixPresentation}
      <PbElem {mixPresentation} {presentationMixer}></PbElem>
    {/each}
  </div>
</div>
