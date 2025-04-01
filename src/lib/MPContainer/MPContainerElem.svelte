<script lang="ts">
  let { mixPresentation, onDelete } = $props();
</script>

<div class="flex justify-between items-center p-4 bg-gray-200">
  <div>
    <h3 class="text-xl">{mixPresentation.name}</h3>
    <p class="text-gray-600 mb-2">{mixPresentation.description}</p>
    <div class="flex flex-wrap gap-2">
      {#each mixPresentation.audioElements as audioElement}
        <div class="px-2 py-1 bg-gray-100 rounded-md text-sm">
          {audioElement.name}
        </div>
      {/each}
    </div>
  </div>
  <button
    onclick={() => onDelete()}
    class="text-red-500 hover:text-red-700"
    aria-label="Delete mix presentation"
  >
    <i class="fas fa-trash"></i>
  </button>
</div>
