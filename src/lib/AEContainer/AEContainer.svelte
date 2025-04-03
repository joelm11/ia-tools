<script lang="ts">
  import AeContainerElem from "./AEContainerElem.svelte";
  let { audioElements, createAudioElement, deleteAudioElement } = $props();

  function openFileDialog() {
    document.getElementById("file-input").click();
  }

  function handleFileSelect(event) {
    const files = event.target.files;
    if (files.length > 0) {
      const file = files[0];
      createAudioElement(file.name);

      // Reset the input so the same file can be selected again
      event.target.value = "";
    }
  }
</script>

<div class="mt-2 col-span-1 h-full">
  <div
    id="audio-element-container"
    class="flex flex-col text-left border-2 border-gray-300 bg-gray-300 gap-1 p-1"
  >
    {#each audioElements as audioElement}
      <AeContainerElem
        aeFilename={audioElement.name}
        onDelete={() => deleteAudioElement(audioElement.id)}
      />
    {/each}
    <button
      id="add-audio-element"
      class="bg-slate-500 hover:bg-slate-600 text-white rounded-full w-8 h-8 flex items-center justify-center mx-auto mt-4 mb-2"
      aria-label="Add Audio Element Button"
      onclick={openFileDialog}
    >
      <i class="fas fa-plus text-xl"></i>
    </button>
    <input
      class="hidden"
      id="file-input"
      type="file"
      accept=".wav"
      onchange={handleFileSelect}
    />
  </div>
</div>
