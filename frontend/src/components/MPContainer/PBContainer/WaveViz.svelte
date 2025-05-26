<script>
  import LoudnessBars from "./loudness/LoudnessBars.svelte";
  let { currentLoudnessValues, speakerLabels } = $props();
</script>

<div
  class="h-full w-11/12 mx-auto overflow-hidden flex items-center justify-center"
>
  <LoudnessBars {currentLoudnessValues} {speakerLabels}></LoudnessBars>
</div>
