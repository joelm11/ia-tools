<script lang="ts">
  import {
    audioFormatsFromChannels,
    getChannelCountRaw,
  } from "src/@common/AudioFormatsTools";

  let { audioElement, onDelete } = $props();
  let audioUrl = $state("");

  $effect(() => {
    audioUrl = URL.createObjectURL(audioElement.audioFile);
    return () => URL.revokeObjectURL(audioUrl);
  });
</script>

<div id="aecontainer-elem" class="p-2 bg-ae-card-background rounded-lg">
  <div class="flex items-center justify-start gap-1">
    <div class="text-card-p-text text-center">{audioElement.name}</div>

    <select
      class="flex-1 bg-ae-card-background text-center text-xs border border-card-s-text rounded-lg p-1 text-card-s-text focus:outline-none"
      aria-label="Audio Element Format"
    >
      {#each audioFormatsFromChannels(getChannelCountRaw(audioElement.audioChFormat)) as possibleLayout}
        <option value={possibleLayout}> {possibleLayout}</option>
      {/each}
    </select>
    <button
      class="text-card-s-text hover:text-red-800 ml-2"
      aria-label="Delete Audio Element Button"
      onclick={onDelete}
    >
      <i class="fas fa-times"></i>
    </button>
  </div>
</div>
