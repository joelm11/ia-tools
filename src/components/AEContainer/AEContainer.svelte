<script lang="ts">
  import AeContainerElem from "./AEContainerElem.svelte";
  let { audioElements, createAudioElement, deleteAudioElement } = $props();

  function openFileDialog() {
    const fileInput = document.getElementById("file-input");
    if (fileInput) {
      fileInput.click();
    }
  }

  function handleFileSelect(event: Event) {
    if (event.target) {
      const files = (event.target as HTMLInputElement).files;
      if (files && files.length) {
        const file = files[0];
        createAudioElement(file);

        // Reset the input so the same file can be selected again
        (event.target as HTMLInputElement).value = "";
      }
    }
  }
</script>

<div class="col-span-1 h-full bg-gray-300">
  <div id="audio-element-container" class="flex flex-col text-left gap-1 p-2">
    {#each audioElements as audioElement}
      <AeContainerElem
        aeFilename={audioElement.name}
        audioFile={audioElement.audioFile}
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
