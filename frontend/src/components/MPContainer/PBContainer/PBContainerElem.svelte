<script lang="ts">
  import { PresentationMixer } from "src/@lib/mixer/PresentationMixer.svelte";
  import VolumeSlider from "./VolumeSlider.svelte";

  let { audioElement, setAEGain } = $props();

  function setGain(val: number) {
    setAEGain(audioElement.id, val);
  }
</script>

<div class="p-2 bg-ae-card-background rounded-md gap-2">
  <span class="text-xs text-card-p-text truncate">{audioElement.name}</span>
  <VolumeSlider {setGain} />
</div>
