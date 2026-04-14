<script lang="ts">
  import type { PageProps } from './$types';
  import SunIcon from '@lucide/svelte/icons/sun';
  import MoonIcon from '@lucide/svelte/icons/moon';
  import { toggleMode } from 'mode-watcher';
  import * as Avatar from '$lib/components/ui/avatar';
  import { Button } from '$lib/components/ui/button';

  let { data }: PageProps = $props();
</script>

<div class="px-6 py-4 flex items-center justify-between">
  <div class="flex items-center gap-3">
    <h1 class="text-xl font-bold">Kagimod</h1>
    <Button onclick={toggleMode} variant="outline" size="icon" class="cursor-pointer">
      <SunIcon
        class="h-[1.2rem] w-[1.2rem] scale-100 rotate-0 !transition-all dark:scale-0 dark:-rotate-90"
      />
      <MoonIcon
        class="absolute h-[1.2rem] w-[1.2rem] scale-0 rotate-90 !transition-all dark:scale-100 dark:rotate-0"
      />
      <span class="sr-only">Toggle theme</span>
    </Button>
  </div>
  <div class="flex items-center gap-3">
    <Avatar.Root class="rounded-full h-10 w-10">
      <Avatar.Image src={data.user?.picture} alt={`@${data.user?.preferred_username}`} />
      <Avatar.Fallback>{data.user?.preferred_username.slice(0, 1).toUpperCase()}</Avatar.Fallback>
    </Avatar.Root>
    <div>
      <p class="text-base/5 font-bold">{data.user?.name}</p>
      <p class="text-sm/5">@{data.user?.preferred_username}</p>
    </div>
  </div>
</div>
