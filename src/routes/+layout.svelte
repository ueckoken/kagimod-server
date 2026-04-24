<script lang="ts">
  import './layout.css';
  import { ModeWatcher, toggleMode } from 'mode-watcher';
  import favicon from '$lib/assets/favicon.svg';
  import type { PageProps } from './$types';
  import * as Avatar from '$lib/components/ui/avatar';
  import { Button } from '$lib/components/ui/button';
  import * as Popover from '$lib/components/ui/popover';
  import SunIcon from '@lucide/svelte/icons/sun';
  import MoonIcon from '@lucide/svelte/icons/moon';

  let { children, data }: PageProps = $props();
</script>

<svelte:head>
  <link rel="icon" href={favicon} />
  <title>Kagimod</title>
</svelte:head>
<ModeWatcher />

<div class="flex flex-col min-h-dvh! min-h-screen">
  <div class="grow">
    <header class="p-4 flex items-center justify-between sticky top-0 bg-background z-10">
      <div class="flex items-center gap-3 mx-2">
        <h1 class="text-xl font-bold"><a href="/">Kagimod</a></h1>
        <Button onclick={toggleMode} variant="outline" size="icon">
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
        <Popover.Root>
          <Popover.Trigger class="sm:pointer-events-none">
            <Avatar.Root class="rounded-full h-10 w-10">
              <Avatar.Image src={data.user?.picture} alt={`@${data.user?.preferred_username}`} />
              <Avatar.Fallback>{data.user?.preferred_username.slice(0, 1).toUpperCase()}</Avatar.Fallback>
            </Avatar.Root>
          </Popover.Trigger>
          <Popover.Content class="mx-4 my-2 w-fit p-3 sm:hidden">
            <div>
              <p class="font-bold">{data.user?.name}</p>
              <p class="text-sm">@{data.user?.preferred_username}</p>
            </div>
          </Popover.Content>
        </Popover.Root>
        <div class="sm:block hidden">
          <p class="text-base/5 font-bold">{data.user?.name}</p>
          <p class="text-sm/5">@{data.user?.preferred_username}</p>
        </div>
      </div>
    </header>
    {@render children()}
  </div>
  <footer class="p-4 text-sm text-center">
    &copy; 2026 <a href="https://ueckoken.club" target="_blank" class="hover:underline">工学研究部</a>
  </footer>
</div>
