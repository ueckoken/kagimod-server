<script lang="ts">
  import './layout.css';
  import { ModeWatcher } from 'mode-watcher';
  import favicon from '$lib/assets/favicon.svg';

  let { children } = $props();
</script>

<svelte:head>
  <link rel="icon" href={favicon} />
  <title>Kagimod</title>
</svelte:head>
<ModeWatcher />

<div class="flex flex-col min-h-dvh! min-h-screen">
  <div class="grow">
    {@render children()}
  </div>
  <footer class="p-4 text-sm text-center">
    &copy; 2026 <a href="https://ueckoken.club" target="_blank" class="hover:underline">工学研究部</a>
  </footer>
</div>
