<script>
  let { title, description, onDelete } = $props();
</script>

<div class="flex justify-between items-center p-4 border rounded-lg">
  <div>
    <h3 class="font-bold">{title}</h3>
    <p class="text-gray-600">{description}</p>
  </div>
  <button
    onclick={() => onDelete()}
    class="text-red-500 hover:text-red-700"
    aria-label="Delete mix presentation"
  >
    <i class="fas fa-trash"></i>
  </button>
</div>
