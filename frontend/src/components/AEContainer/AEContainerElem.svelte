<script lang="ts">
  import {
    audioFormatsFromChannels,
    getChannelCountRaw,
  } from "src/@common/AudioFormatsTools";

  let { audioElement, onDelete } = $props();
  let audioUrl = $state("");
  let selectedFormat = $state(audioElement.audioChFormat);

  $effect(() => {
    audioUrl = URL.createObjectURL(audioElement.audioFile);
    return () => URL.revokeObjectURL(audioUrl);
  });
</script>

<div id="aecontainer-elem" class="p-2 bg-ae-card-background rounded-lg">
  <div class="flex items-center justify-start gap-1">
    <div class="text-card-p-text text-left flex-grow overflow-hidden truncate">
      {audioElement.name}
    </div>
    {#if audioFormatsFromChannels(getChannelCountRaw(audioElement.audioChFormat)).length > 1}
      <select
        class="bg-ae-card-background text-center text-xs border border-card-s-text rounded-lg p-1 text-card-s-text focus:outline-none"
        aria-label="Audio Element Format"
        bind:value={selectedFormat}
        onchange={() => {
          audioElement.audioChFormat = selectedFormat;
        }}
      >
        {#each audioFormatsFromChannels(getChannelCountRaw(audioElement.audioChFormat)) as possibleLayout}
          <option value={possibleLayout}> {possibleLayout}</option>
        {/each}
      </select>
    {:else}
      <span
        class="bg-ae-card-background text-center text-xs border border-card-s-text rounded-lg p-1 text-card-s-text focus:outline-none"
        >{audioElement.audioChFormat}</span
      >
    {/if}
    <button
      class="text-card-s-text hover:text-red-800 ml-2 shrink-0"
      aria-label="Delete Audio Element Button"
      onclick={onDelete}
    >
      <i class="fas fa-times"></i>
    </button>
    <audio
      id={audioElement.id}
      class="hidden"
      controls
      src={audioUrl}
      aria-label="Audio Element Player"
    ></audio>
  </div>
</div>
