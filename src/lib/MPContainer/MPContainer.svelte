<script>
  import MPModal from "./MPModal.svelte";
  import MPElem from "./MPElem.svelte";

  let isModalOpen = false;
  let mixPresentations = [];

  function handleAddMP(data) {
    mixPresentations = [...mixPresentations, data];
  }

  function deleteMP(index) {
    mixPresentations = mixPresentations.filter((_, i) => i !== index);
  }
</script>

<div class="m-2 col-span-3">
  <h2 class="text-2xl">Mix Presentations</h2>
  <div
    id="mix-presentation-container"
    class="flex flex-col gap-2 p-2 text-left border-2 border-gray-300 rounded-lg"
  >
    {#each mixPresentations as mp, index}
      <MPElem
        title={mp.title}
        description={mp.description}
        onDelete={() => deleteMP(index)}
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
  onSubmit={handleAddMP}
/>
