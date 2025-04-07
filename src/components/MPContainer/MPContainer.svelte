<script lang="ts">
  import MPModal from "./MPForm.svelte";
  import MPElem from "./MPContainerElem.svelte";
  import PBContainer from "./PBContainer/PBContainer.svelte";
  import type { MixPresentation } from "../../types/MixPresentation";

  let {
    audioElements,
    mixPresentations,
    createMixPresentation,
    deleteMixPresentation,
    removeAEFromMixPresentation,
  } = $props();

  let isModalOpen = $state(false);

  function handleAddMP(data: MixPresentation) {
    mixPresentations = [...mixPresentations, data];
  }
</script>

<div class="col-span-1 bg-gray-300 h-full">
  <div
    id="mix-presentation-container"
    class="flex flex-col gap-2 p-2 text-left"
  >
    {#each mixPresentations as mixPresentation}
      <MPElem
        {mixPresentation}
        onDelete={() => deleteMixPresentation(mixPresentation.id)}
      />
    {/each}
    <button
      id="add-mix-presentation"
      onclick={() => (isModalOpen = true)}
      class="bg-slate-500 hover:bg-slate-600 text-white rounded-full w-8 h-8 flex items-center justify-center mx-auto mt-4 mb-2"
      aria-label="Add Mix Presentation Button"
    >
      <i class="fas fa-plus text-xl"></i>
    </button>
  </div>
</div>

<PBContainer {mixPresentations}></PBContainer>

<MPModal
  isOpen={isModalOpen}
  onClose={() => (isModalOpen = false)}
  {createMixPresentation}
  {audioElements}
/>
