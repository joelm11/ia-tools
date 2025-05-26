<script lang="ts">
  export let currentLoudnessValues: number[];
  export let speakerLabels: string[];
  export let maxLoudness: number = 1.0;
  export let minLoudness: number = 0.0;
  export let barColorClass: string = "bg-lime-500";
  export let barWidthClass: string = "w-4";
  export let barSpacingClass: string = "mr-2";
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

<div class="flex {containerHeightClass} overflow-hidden pt-0.5">
  {#each currentLoudnessValues as loudnessValue, i (i)}
    <div class="flex flex-col items-center {barSpacingClass} {barWidthClass}">
      <div class="flex-grow flex items-end w-full bg-card-background">
        <div
          class="flex-shrink-0 transition-all duration-100 ease-linear {barColorClass} w-full"
          style="height: {calculateBarHeight(loudnessValue)}%;"
        ></div>
      </div>
      <span class="text-xs text-card-s-text mt-1">{speakerLabels[i]}</span>
    </div>
  {/each}
</div>
