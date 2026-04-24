<script lang="ts">
  import { page } from '$app/state';
  import { Button } from '$lib/components/ui/button';
</script>

<main class="pt-40 text-center">
  <h1 class="text-6xl font-bold">{page.status}</h1>
  <p class="text-2xl font-bold">{page.error.message}</p>
  <a href="/"><Button size="lg" class="mt-4">トップページ</Button></a>
</main>
