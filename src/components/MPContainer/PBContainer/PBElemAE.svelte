<script lang="ts">
  let { audioElement } = $props();

  function updateGain(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    audioElement.gain = parseInt(value) / 10;
  }
</script>

<div class="flex p-2 bg-ae-card-background rounded-md justify-between gap-2">
  <span class="flex justify-center items-center flex-none">
    <input
      type="range"
      id="volume"
      name="volume"
      min="0"
      max="20"
      value={audioElement.gain * 10}
      oninput={updateGain}
    />
  </span>
  <span class="text-sm p-1 truncate">{audioElement.name}</span>
</div>
