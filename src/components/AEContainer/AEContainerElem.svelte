<script>
  let { aeFilename = "Audio Element", onDelete } = $props();
</script>

<div
  id="aecontainer-elem"
  class="flex items-center justify-between p-2 bg-gray-100"
>
  <p class="text-gray-700">{aeFilename}</p>
  <button
    class="text-red-500 hover:text-red-700"
    aria-label="Delete Audio Element Button"
    onclick={() => onDelete(aeFilename)}
  >
    <i class="fas fa-times"></i>
  </button>
</div>
