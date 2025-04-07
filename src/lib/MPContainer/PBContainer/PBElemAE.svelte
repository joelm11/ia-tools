<script lang="ts">
  let { audioElement } = $props();
</script>

<div class="flex p-2 bg-gray-100 justify-between gap-2">
  <span class="flex justify-center items-center flex-none">
    <input type="range" id="volume" name="volume" min="0" max="40" />
  </span>
  <span class="text-sm p-1">{audioElement.name}</span>
</div>
