<script lang="ts">
  import VolumeSlider from "./VolumeSlider.svelte";

  let { audioElement, setAEGain } = $props();

  function setGain(val: number) {
    setAEGain(audioElement.id, val);
  }
</script>

<div class="p-2 bg-ae-card-background rounded-md max-w-full">
  <span class="text-s text-card-p-text overflow-ellipsis inline-block"
    >{audioElement.name}</span
  >
  <VolumeSlider {setGain} />
</div>
