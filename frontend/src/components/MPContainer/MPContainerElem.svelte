<script lang="ts">
  import type { AudioElement } from "src/@types/AudioElement";

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
      class="text-xl truncate text-card-p-text text-center bg-mp-card-t-background rounded-md py-2 mb-2"
    >
      {mixPresentation.name}
      <hr class="w-4/5 mx-auto border-t border-card-p-text/50 my-2" />
      <div
        class="text-sm text-card-p-text text-center font-bold bg-mp-card-t-background rounded-md"
      >
        {mixPresentation.playbackFormat}
      </div>
    </div>
    <div class="flex flex-wrap gap-2">
      {#each mixPresentation.audioElements as audioElement}
        <div
          class="px-2 pr-0 py-1 text-md text-card-p-text truncate gap-2 bg-ae-card-background rounded-lg flex items-center w-full"
        >
          <span
            class="flex-grow flex-shrink min-w-0 whitespace-nowrap overflow-hidden text-ellipsis"
            >{audioElement.name}</span
          >
          <button
            onclick={() => removeAudioElement(audioElement.id)}
            class="text-card-s-text hover:text-red-800 flex-shrink-0 px-3 py-1"
            aria-label="Remove audio element"
          >
            <i class="fas fa-times text-s"></i>
          </button>
        </div>
      {/each}
    </div>
  </div>
</div>
