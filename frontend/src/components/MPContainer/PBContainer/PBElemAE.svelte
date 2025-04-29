<script lang="ts">
  import audioElementsStore from "src/@lib/stores/audioElementsStore";
  import { get } from "svelte/store";
  import { onMount } from "svelte";
  import type { AudioElement } from "src/@types/AudioElement";

  let { audioElement } = $props();
  let gain = $state(audioElement.gain);

  $effect(() => {
    if (audioElement) {
      const audioElements = get(audioElementsStore);
      const index = audioElements.findIndex(
        (element) => element.id === audioElement.id
      );

      if (index !== -1) {
        audioElementsStore.update((elements) => {
          elements[index] = { ...elements[index], gain: gain };
          return elements;
        });
      }
    }
  });
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
