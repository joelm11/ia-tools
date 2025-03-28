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
    // Create the new Mix Presentation.
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
</script>

{#if isOpen}
  <div
    class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"
  >
    <div class="bg-white p-6 rounded-lg w-96">
      <h3 class="text-xl mb-4">Add Mix Presentation</h3>
      <form onsubmit={handleFormSubmit}>
        <div class="mb-4">
          <label for="name" class="block mb-2">Title</label>
          <input
            type="text"
            id="name"
            bind:value={name}
            class="w-full p-2 border rounded"
            required
          />
        </div>
        <div class="mb-4">
          <label for="description" class="block mb-2">Description</label>
          <textarea
            id="description"
            bind:value={desc}
            class="w-full p-2 border rounded"
            rows="3"
          ></textarea>
        </div>
        <!-- <div class="mb-4">
          <label for="audioElements" class="block mb-2">Audio Elements</label>
          <select
            id="audioElements"
            bind:value={selectedAudio}
            class="w-full p-2 border rounded"
            multiple
          >
            {#each audioElements as audio}
              <option value={audio}>{audio.name || audio.title}</option>
            {/each}
          </select>
        </div> -->
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
