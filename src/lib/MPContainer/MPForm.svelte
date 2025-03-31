<script lang="ts">
  let {
    isOpen = false,
    onClose,
    createMixPresentation,
    audioElements = [],
  } = $props();

  let name = $state("");
  let desc = $state("");
  let selectedAudioElements = $state([]);

  function handleSubmit() {
    createMixPresentation(name, desc, selectedAudioElements);
    // Reset form.
    name = "";
    desc = "";
    selectedAudioElements = [];
    onClose();
  }

  function handleFormSubmit(e: Event) {
    e.preventDefault();
    handleSubmit();
  }

  function handleCheckboxChange(audioElement: any, checked: boolean) {
    if (checked) {
      selectedAudioElements = [...selectedAudioElements, audioElement];
    } else {
      selectedAudioElements = selectedAudioElements.filter(
        (el) => el.id !== audioElement.id
      );
    }
  }
</script>

{#if isOpen}
  <div
    class="fixed inset-0 bg-gray-400 bg-opacity-50 flex items-center justify-center"
  >
    <div class="bg-white p-6 rounded-lg w-[32rem]">
      <h3 class="text-xl mb-6">Add Mix Presentation</h3>
      <form onsubmit={handleFormSubmit}>
        <div class="space-y-4">
          <div>
            <label for="name" class="block mb-2">Name</label>
            <input
              type="text"
              id="name"
              bind:value={name}
              class="w-full p-2 border rounded"
              placeholder="Mix Presentation Name"
              required
            />
          </div>
          <div>
            <label for="description" class="block mb-2">Description</label>
            <textarea
              id="description"
              bind:value={desc}
              class="w-full p-2 border rounded"
              placeholder="Description..."
            ></textarea>
          </div>
        </div>
        <div>
          <label for="form-audio-elements" class="block mb-2"
            >Audio Elements</label
          >
          <div
            id="form-audio-elements"
            class="mt-2 flex flex-wrap items-start justify-start gap-2 space-y-2 max-h-48 overflow-y-auto"
          >
            {#each audioElements as audioElement}
              <div
                class="flex cursor-pointer items-center space-x-3 rounded-lg border p-4 hover:bg-gray-100 gap-1"
              >
                <input
                  type="checkbox"
                  id={audioElement.id}
                  value={audioElement.name}
                  class="h-5 w-5"
                  onchange={(e) =>
                    handleCheckboxChange(audioElement, e.currentTarget.checked)}
                />
                <span class="font-medium text-gray-700">
                  <label for={audioElement.id}>{audioElement.name}</label>
                </span>
              </div>
            {/each}
          </div>
        </div>
        <div class="flex justify-end gap-2">
          <button
            type="button"
            onclick={onClose}
            class="px-4 py-2 border rounded"
          >
            Cancel
          </button>
          <button
            type="submit"
            class="px-4 py-2 bg-blue-500 text-white rounded"
          >
            Add
          </button>
        </div>
      </form>
    </div>
  </div>
{/if}
