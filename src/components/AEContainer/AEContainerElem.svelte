<script>
  let { audioElement, onDelete } = $props();
  let audioUrl = $state("");

  $effect(() => {
    audioUrl = URL.createObjectURL(audioElement.audioFile);
    return () => URL.revokeObjectURL(audioUrl);
  });
</script>

<div id="aecontainer-elem" class="p-2 bg-ae-card-background rounded-lg">
  <div class="flex items-center justify-between">
    <div class="text-card-p-text flex-1 text-center">{audioElement.name}</div>
    <button
      class="text-card-s-text hover:text-red-700 ml-2"
      aria-label="Delete Audio Element Button"
      onclick={onDelete}
    >
      <i class="fas fa-times"></i>
    </button>
  </div>
</div>

<!-- Leaving this here as it's useful for debugging. -->
<!-- <p class="text-card-p-text">{audioElement.name}</p>
    <button
      class="text-red-500 hover:text-red-700"
      aria-label="Delete Audio Element Button"
      onclick={onDelete}
    >
      <i class="fas fa-times"></i>
    </button>
  </div>
  <audio id={audioElement.id} src={audioUrl} controls class="w-full"></audio> -->
<!-- This is closer to how the final should look. -->
