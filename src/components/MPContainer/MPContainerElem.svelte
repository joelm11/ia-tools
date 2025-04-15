<script lang="ts">
  import type { AudioElement } from "../../types/AudioElement";

  let { mixPresentation, onDelete } = $props();

  function removeAudioElement(id: string) {
    mixPresentation.audioElements = mixPresentation.audioElements.filter(
      (element: AudioElement) => element.id !== id
    );
  }
</script>

<div
  class="flex justify-between items-center p-3 bg-mp-card-background border border-ae-card-background rounded-md"
>
  <div class="flex-1 min-w-0">
    <div
      class="text-xl truncate text-card-p-text text-center bg-mp-card-t-background rounded-md py-2"
    >
      {mixPresentation.name}
    </div>
    <p class="text-gray-600 mb-2 line-clamp-2">{mixPresentation.description}</p>
    <div class="flex flex-wrap gap-2">
      {#each mixPresentation.audioElements as audioElement}
        <div
          class="px-2 py-1rounded-md text-md text-card-p-text truncate flex items-center gap-2 bg-ae-card-background rounded-sm"
        >
          <span>{audioElement.name}</span>
          <button
            onclick={() => removeAudioElement(audioElement.id)}
            class="text-card-s-text hover:text-red-800"
            aria-label="Remove audio element"
          >
            <i class="fas fa-times text-xs"></i>
          </button>
        </div>
      {/each}
    </div>
  </div>
  <!-- <button
    onclick={() => onDelete()}
    class="text-red-500 hover:text-red-700 p-2"
    aria-label="Delete mix presentation"
  >
    <i class="fas fa-trash"></i>
  </button> -->
</div>
