<script lang="ts">
  import { PresentationMixer } from "src/@lib/mixer/PresentationMixer.svelte";

  let { audioElement } = $props();
  let gain = $state(audioElement.gain);

  function updateAEMixGain(event: Event) {
    const mixer = PresentationMixer.getInstance();
    const target = event.target as HTMLInputElement;
    const newGain = parseFloat(target.value);
    gain = newGain;
    audioElement.gain = gain;
    mixer.setGain(newGain, audioElement.id);
  }

  /**
   * Takes in the audio element and the ID of the mix presentation it is a part of.
   * On input, sets the gain of the audio element to the value of the slider.
   */
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
    oninput={updateAEMixGain}
  />
</div>
