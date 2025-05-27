<script lang="ts">
  import { sendMixPresentations } from "src/@lib/state/MixPresentationState.svelte";
  import { fade } from "svelte/transition";
  import type { JobState } from "bullmq";

  // Props - control visibility from parent
  let { show, closeModal } = $props();

  // Internal state for the form
  let filename = $state("My_Awesome_Mix");
  let downloading = $state(true);
  let downloadURL = $state("");
  let errorMessage = $state(""); // State to store error messages
  let isProcessing = $state(false); // Separate state to track processing status

  // svelte-ignore non_reactive_update
  let modalElement: HTMLDivElement;

  async function handleExport(event: { preventDefault: () => void }) {
    event.preventDefault(); // Prevent default form submission

    isProcessing = true; // Show spinner
    downloading = true;
    errorMessage = ""; // Reset error message

    try {
      const jobId = await sendMixPresentations();
      console.log("Job created with ID:", jobId);

      let jobState: { state: JobState; result: any };
      do {
        const response = await fetch(
          `http://localhost:3000/job-status/${jobId}`,
          {
            method: "GET",
          }
        );
        jobState = JSON.parse(await response.text());
        if (jobState.state !== "completed") {
          await new Promise((resolve) => setTimeout(resolve, 1000));
        }
      } while (jobState.state !== "completed" && jobState.state !== "failed");

      if (jobState.state === "failed") {
        throw new Error("Job failed on the backend.");
      }

      // Download file
      const dlResponse = await fetch(
        `http://localhost:3000/job-download/${jobId}`,
        {
          method: "GET",
        }
      );
      if (dlResponse.ok) {
        const blob = await dlResponse.blob();
        downloadURL = window.URL.createObjectURL(blob);
        downloading = false;
      } else {
        throw new Error("Failed to download the file.");
      }
    } catch (error) {
      downloading = false;
      errorMessage = (error as any).message || "An unexpected error occurred.";
      console.error(error);
    } finally {
      isProcessing = false; // Hide spinner
    }
  }

  function downloadFile() {
    const a = document.createElement("a");
    a.href = downloadURL;
    a.download = `${filename}.iamf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(downloadURL);
    closeModal();
  }

  // Effect to handle Escape key press for closing the modal
  $effect(() => {
    const handleKeydown = (event: { key: string }) => {
      if (event.key === "Escape" && show) {
        closeModal();
        console.log("Escape key pressed, closing modal");
      }
    };

    if (show && typeof window !== "undefined") {
      window.addEventListener("keydown", handleKeydown);
    } else if (typeof window !== "undefined") {
      window.removeEventListener("keydown", handleKeydown);
    }

    // Cleanup function for the effect
    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("keydown", handleKeydown);
      }
    };
  });

  function handleBackdropClick(event: any) {
    // Check if the click is not directly on the backdrop (modalElement)
    if (event.target === modalElement) {
      closeModal();
    }
  }
</script>

{#if show}
  <div
    bind:this={modalElement}
    transition:fade={{ duration: 100 }}
    onclick={handleBackdropClick}
    onkeydown={handleBackdropClick}
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 transition-opacity duration-300 ease-in-out"
    role="dialog"
    aria-modal="true"
    aria-labelledby="modal-title"
    tabindex="-1"
  >
    <div
      onclick={(e) => e.stopPropagation()}
      role="presentation"
      class="bg-slate-800 w-full max-w-lg rounded-lg shadow-xl border border-slate-600"
      aria-labelledby="modal-title"
    >
      <div
        class="flex justify-between items-center border-b border-slate-600 p-4 sm:p-6"
      >
        <h2 id="modal-title" class="text-xl font-semibold text-slate-200">
          Export File
        </h2>
        <button
          onclick={closeModal}
          class="text-slate-400 hover:text-slate-200 text-2xl leading-none focus:outline-none focus:ring-2 focus:ring-cyan-500 rounded-sm"
          aria-label="Close modal"
        >
          &times;
        </button>
      </div>

      <form onsubmit={handleExport} class="p-4 sm:p-6">
        <div class="mb-4">
          <label
            for="filename"
            class="block text-sm font-medium text-slate-400 mb-1"
            >Filename</label
          >
          <input
            type="text"
            id="filename"
            name="filename"
            bind:value={filename}
            class="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition"
          />
        </div>

        {#if errorMessage}
          <div class="text-red-500 text-sm mb-4">{errorMessage}</div>
        {/if}

        <div
          class="flex justify-end space-x-3 border-t border-slate-600 pt-4 mt-4"
        >
          <button
            type="button"
            onclick={closeModal}
            class="px-4 py-2 bg-slate-600 hover:bg-slate-500 text-slate-200 font-medium rounded-md shadow transition focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 focus:ring-offset-slate-800"
          >
            Cancel
          </button>
          {#if isProcessing}
            <button
              type="submit"
              class="px-4 py-2 bg-cyan-600 text-white font-bold rounded-md shadow transition focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 focus:ring-offset-slate-800 flex items-center justify-center"
              disabled
            >
              <svg
                class="animate-spin h-5 w-5 mr-2 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  class="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  stroke-width="4"
                ></circle>
                <path
                  class="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v8H4z"
                ></path>
              </svg>
              Processing...
            </button>
          {:else if downloading}
            <button
              type="submit"
              class="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-md shadow transition focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 focus:ring-offset-slate-800"
            >
              Export
            </button>
          {:else}
            <button
              type="button"
              onclick={downloadFile}
              class="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-md shadow transition focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 focus:ring-offset-slate-800"
            >
              Download
            </button>
          {/if}
        </div>
      </form>
    </div>
  </div>
{/if}
