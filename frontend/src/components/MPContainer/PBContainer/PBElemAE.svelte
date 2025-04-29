<script lang="ts">
  let { audioElement } = $props();
  let gain = $state(audioElement.gain);
</script>

<div class="p-2 bg-ae-card-background rounded-md gap-2">
  <span class="text-xs text-card-p-text truncate">{audioElement.name}</span>
  <input
    class="flex justify-center items-center"
    type="range"
    id="volume"
    name="volume"
    min="0"
    max="100"
    bind:value={gain}
  />
</div>
