<script lang="ts">
  const min = -80;
  const max = 0;

  let { setGain } = $props();
  let rangePercent = $state(0);
  let value = $state(-40);

  $effect(() => {
    rangePercent = ((value - min) / (max - min)) * 100;
    setGain(rangePercent * 0.01);
  });
</script>

<input
  type="range"
  bind:value
  {min}
  {max}
  step="1"
  style={`--range-percent: ${rangePercent}%`}
  class="w-full appearance-none range-thumb"
/>
