<script lang="ts">
  import type { AudioElement } from "src/@types/AudioElement";
  import AeContainerElem from "./AEContainerElem.svelte";
  import {
    getAudioElements,
    createAudioElement,
    deleteAudioElement,
  } from "src/@lib/state/AudioElementState.svelte";

  let audioElements: AudioElement[] = $derived(getAudioElements());

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

<div
  id="audio-element-container"
  class="col-span-1 h-full flex flex-col text-left gap-1 border border-ae-card-background bg-card-background rounded-2xl p-4 overflow-y-auto max-h-full"
>
  <div class="text-card-p-text mb-1 text-2xl">Audio Elements</div>
  <div class="border-b border-ae-card-background mb-2"></div>
  <div class="flex flex-col gap-3">
    {#each audioElements as audioElement}
      <AeContainerElem
        {audioElement}
        onDelete={() => deleteAudioElement(audioElement.id)}
      />
    {/each}
  </div>
  <button
    id="add-audio-element"
    class="bg-slate-500 hover:bg-slate-600 text-white rounded-full w-8 h-8 flex items-center justify-center mx-auto mt-1 mb-2"
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
