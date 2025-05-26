<script lang="ts">
  import MPModal from "./MPForm.svelte";
  import MPElem from "./MPContainerElem.svelte";
  import PBContainer from "./PBContainer/PBContainer.svelte";
  import type { MixPresentation } from "src/@types/MixPresentation";
  import type { AudioElement } from "src/@types/AudioElement";
  import {
    createMixPresentation,
    deleteMixPresentation,
    getMixPresentations,
  } from "src/@lib/state/MixPresentationState.svelte";
  import { getAudioElements } from "src/@lib/state/AudioElementState.svelte";

  let mixPresentations: MixPresentation[] = $derived(getMixPresentations());
  let audioElements: AudioElement[] = $derived(getAudioElements());

  let isModalOpen = $state(false);
</script>

<div
  class="col-span-1 h-full flex flex-col text-left gap-1 bg-card-background border border-ae-card-background rounded-2xl p-4 overflow-y-auto max-h-full"
>
  <div class="text-card-p-text mb-1 text-2xl">Mix Presentations</div>
  <div class="border-b border-ae-card-background mb-2"></div>
  <div id="mix-presentation-container" class="flex flex-col gap-3">
    {#each mixPresentations as mixPresentation}
      <MPElem
        {mixPresentation}
        onDelete={() => deleteMixPresentation(mixPresentation.id)}
      />
    {/each}
    {#if audioElements.length > 0}
      <button
        id="add-mix-presentation"
        onclick={() => (isModalOpen = true)}
        class="bg-slate-500 hover:bg-slate-600 text-white rounded-full w-8 h-8 flex items-center justify-center mx-auto mt-1 mb-2"
        aria-label="Add Mix Presentation Button"
      >
        <i class="fas fa-plus text-xl"></i>
      </button>
    {/if}
  </div>
</div>

<PBContainer {mixPresentations}></PBContainer>

<MPModal
  isOpen={isModalOpen}
  onClose={() => (isModalOpen = false)}
  {createMixPresentation}
  {audioElements}
/>
