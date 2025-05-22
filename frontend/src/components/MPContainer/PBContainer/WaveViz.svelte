<script>
  import LoudnessBars from "./loudness/LoudnessBars.svelte";
  let { currentLoudnessValues } = $props();
</script>

<div class="h-12">
  <LoudnessBars {currentLoudnessValues}></LoudnessBars>
</div>
