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

<div class="m-2 col-span-2">
  <h2 class="text-2xl">Audio Elements</h2>
  <div
    id="audio-element-container"
    class="flex flex-col gap-2 p-2 text-left border-2 border-gray-300 rounded-lg"
  >
    {#each audioElements as audioElement}
      <AeContainerElem
        aeFilename={audioElement.name}
        onDelete={() => deleteAudioElement(audioElement.id)}
      />
    {/each}
    <button
      id="add-audio-element"
      class="bg-blue-500 hover:bg-blue-600 text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mt-4"
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
