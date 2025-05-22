<script lang="ts">
  let value = -40;
  const min = -80;
  const max = 0;

  $: rangePercent = ((value - min) / (max - min)) * 100;
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
