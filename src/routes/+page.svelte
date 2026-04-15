<script lang="ts">
  import type { PageProps } from './$types';
  import SunIcon from '@lucide/svelte/icons/sun';
  import MoonIcon from '@lucide/svelte/icons/moon';
  import PlusIcon from '@lucide/svelte/icons/plus';
  import Trash2Icon from '@lucide/svelte/icons/trash-2';
  import PencilIcon from '@lucide/svelte/icons/pencil';
  import EllipsisIcon from '@lucide/svelte/icons/ellipsis';
  import { toggleMode } from 'mode-watcher';
  import * as Avatar from '$lib/components/ui/avatar';
  import { Button } from '$lib/components/ui/button';
  import * as Table from '$lib/components/ui/table';
  import * as Popover from '$lib/components/ui/popover';
  import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
  import { format } from 'date-fns';

  let { data }: PageProps = $props();
</script>

<div class="p-4 flex items-center justify-between">
  <div class="flex items-center gap-3 mx-2">
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
    <Popover.Root>
      <Popover.Trigger class="sm:pointer-events-none cursor-pointer">
        <Avatar.Root class="rounded-full h-10 w-10">
          <Avatar.Image src={data.user?.picture} alt={`@${data.user?.preferred_username}`} />
          <Avatar.Fallback>{data.user?.preferred_username.slice(0, 1).toUpperCase()}</Avatar.Fallback>
        </Avatar.Root>
      </Popover.Trigger>
      <Popover.Content class="mx-4 my-2 w-fit p-3">
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
</div>

<main class="container p-6 mx-auto">
  <div class="flex items-center justify-between mb-4">
    <div class="flex gap-2">
      <h2 class="font-bold">ICカード一覧</h2>
      <p>{data.cards.length}件</p>
    </div>
    <Button class="flex items-center cursor-pointer"><PlusIcon />カードを追加</Button>
  </div>
  {#if data.cards.length}
    <Table.Root>
      <Table.Header>
        <Table.Row>
          <Table.Head>カード名</Table.Head>
          <Table.Head>idm</Table.Head>
          <Table.Head>登録日</Table.Head>
          <Table.Head class="w-0"></Table.Head>
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {#each data.cards as card}
          <Table.Row>
            <Table.Cell>{card.label}</Table.Cell>
            <Table.Cell>{card.idm_raw}</Table.Cell>
            <Table.Cell>{format(card.created_at, 'yyyy-MM-dd')}</Table.Cell>
            <Table.Cell class="sticky right-0">
              <div class="rounded-md p-1 bg-background">
                <DropdownMenu.Root>
                  <DropdownMenu.Trigger>
                    {#snippet child({ props })}
                      <Button {...props} variant="secondary" class="cursor-pointer sm:hidden" aria-label="操作"><EllipsisIcon /></Button>
                    {/snippet}
                  </DropdownMenu.Trigger>
                  <DropdownMenu.Content class="mx-4 my-2 w-fit" align="start">
                    <DropdownMenu.Item class="text-sm/3 p-3 cursor-pointer">
                      <PencilIcon />名前を変更
                    </DropdownMenu.Item>
                    <DropdownMenu.Item variant="destructive" class="text-sm/3 p-3 cursor-pointer">
                      <Trash2Icon />削除
                    </DropdownMenu.Item>
                  </DropdownMenu.Content>
                </DropdownMenu.Root>
                <Button variant="secondary" class="cursor-pointer hidden sm:inline" aria-label="名前を変更"><PencilIcon /></Button>
                <Button variant="destructive" class="cursor-pointer hidden sm:inline" aria-label="削除"><Trash2Icon /></Button>
              </div>
            </Table.Cell>
          </Table.Row>
        {/each}
      </Table.Body>
    </Table.Root>
  {:else}
    <div class="bg-secondary rounded-md px-4 py-8 text-center">
      カードが登録されていません
    </div>
  {/if}
</main>
