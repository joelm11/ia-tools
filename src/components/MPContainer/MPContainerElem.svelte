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
  class="flex justify-between items-center p-2 bg-mp-card-background border-card-s-text"
>
  <div class="flex-1 min-w-0">
    <h3 class="text-xl truncate">{mixPresentation.name}</h3>
    <p class="text-gray-600 mb-2 line-clamp-2">{mixPresentation.description}</p>
    <div class="flex flex-wrap gap-2">
      {#each mixPresentation.audioElements as audioElement}
        <div
          class="px-2 py-1 bg-gray-100 rounded-md text-sm truncate flex items-center gap-2"
        >
          <span>{audioElement.name}</span>
          <button
            onclick={() => removeAudioElement(audioElement.id)}
            class="text-gray-500 hover:text-red-600"
            aria-label="Remove audio element"
          >
            <i class="fas fa-times text-xs"></i>
          </button>
        </div>
      {/each}
    </div>
  </div>
  <button
    onclick={() => onDelete()}
    class="text-red-500 hover:text-red-700 p-2"
    aria-label="Delete mix presentation"
  >
    <i class="fas fa-trash"></i>
  </button>
</div>
