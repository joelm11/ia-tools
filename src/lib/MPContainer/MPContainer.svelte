<script lang="ts">
  import MPModal from "./MPModalForm.svelte";
  import MPElem from "./MPContainerElem.svelte";

  let {
    audioElements,
    mixPresentations,
    createMixPresentation,
    deleteMixPresentation,
    removeAEFromMixPresentation,
  } = $props();

  let isModalOpen = $state(false);

  function handleAddMP(data) {
    mixPresentations = [...mixPresentations, data];
  }
</script>

<div class="m-2 col-span-3">
  <h2 class="text-2xl">Mix Presentations</h2>
  <div
    id="mix-presentation-container"
    class="flex flex-col gap-2 p-2 text-left border-2 border-gray-300 rounded-lg"
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
      class="bg-blue-500 hover:bg-blue-600 text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mt-4"
      aria-label="Add Mix Presentation Button"
    >
      <i class="fas fa-plus text-xl"></i>
    </button>
  </div>
</div>

<MPModal
  isOpen={isModalOpen}
  onClose={() => (isModalOpen = false)}
  {createMixPresentation}
  {audioElements}
/>
