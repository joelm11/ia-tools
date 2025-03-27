<script>
  let selectedFiles = [];

  function openFileDialog() {
    document.getElementById("file-input").click();
  }

  function handleFileSelect(event) {
    const files = event.target.files;
    if (files.length > 0) {
      selectedFiles = [...selectedFiles, ...Array.from(files)];
      // Reset the input so the same file can be selected again
      event.target.value = "";
    }
  }
</script>

<div class="m-2 col-span-2">
  <h2 class="text-2xl">Audio Elements</h2>
  <div
    id="audio-element-container"
    class="flex flex-col gap-2 p-2 text-left border-2 border-gray-300 rounded-lg"
  >
    <button
      id="add-audio-element"
      class="bg-blue-500 hover:bg-blue-600 text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mt-4"
      aria-label="Add Audio Element Button"
      onclick={openFileDialog}
    >
      <i class="fas fa-plus text-xl"></i>
    </button>
    <input
      class="hidden"
      id="file-input"
      type="file"
      accept=".wav"
      onchange={handleFileSelect}
    />
    {#each selectedFiles as file}
      <div class="flex items-center justify-between p-2 bg-gray-100 rounded">
        <p class="text-gray-700">{file.name}</p>
        <button
          class="text-red-500 hover:text-red-700"
          aria-label="Delete Audio Element Button"
          onclick={() => {
            selectedFiles = selectedFiles.filter((f) => f !== file);
          }}
        >
          <i class="fas fa-times"></i>
        </button>
      </div>
    {/each}
  </div>
</div>
