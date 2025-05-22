<script lang="ts">
  export let currentLoudnessValues: number[];
  export let maxLoudness: number = 1.0;
  export let minLoudness: number = 0.0;
  export let barColorClass: string = "bg-lime-500";
  export let barWidthClass: string = "w-2";
  export let barSpacingClass: string = "mr-1";
  export let containerHeightClass: string = "h-full";

  // Function to calculate bar height as a percentage (0-100)
  function calculateBarHeight(value: number): number {
    // Normalize value between 0 and 1
    const normalizedValue = Math.max(
      0,
      (value - minLoudness) / (maxLoudness - minLoudness)
    );
    return normalizedValue * 100; // Return as percentage for CSS height
  }
</script>

<div
  class="flex items-end {containerHeightClass} overflow-hidden pl-2 pr-2 pt-0.5 pb-0.5"
>
  {#each currentLoudnessValues as loudnessValue, i (i)}
    <div
      class="flex-shrink-0 min-w-px transition-all duration-100 ease-linear {barColorClass} {barWidthClass} {barSpacingClass}"
      style="height: {calculateBarHeight(loudnessValue)}%;"
    ></div>
  {/each}
</div>
