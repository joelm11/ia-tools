<script>
  let { aeFilename, onDelete, audioFile } = $props();
  let audioUrl = $state("");

  $effect(() => {
    audioUrl = URL.createObjectURL(audioFile);
    return () => URL.revokeObjectURL(audioUrl);
  });
</script>

<div id="aecontainer-elem" class="flex flex-col gap-2 p-2 bg-gray-100">
  <div class="flex items-center justify-between">
    <p class="text-gray-700">{aeFilename}</p>
    <button
      class="text-red-500 hover:text-red-700"
      aria-label="Delete Audio Element Button"
      onclick={onDelete}
    >
      <i class="fas fa-times"></i>
    </button>
  </div>
  <audio src={audioUrl} controls class="w-full"></audio>
</div>
