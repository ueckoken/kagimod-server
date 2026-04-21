<script lang="ts">
  import { onMount } from 'svelte';
  import { page } from '$app/state';
  import { goto } from '$app/navigation';
  import { enhance } from '$app/forms';
  import type { PageProps } from './$types';
  import SunIcon from '@lucide/svelte/icons/sun';
  import MoonIcon from '@lucide/svelte/icons/moon';
  import PlusIcon from '@lucide/svelte/icons/plus';
  import Trash2Icon from '@lucide/svelte/icons/trash-2';
  import PencilIcon from '@lucide/svelte/icons/pencil';
  import EllipsisIcon from '@lucide/svelte/icons/ellipsis';
  import { toggleMode } from 'mode-watcher';
  import * as Avatar from '$lib/components/ui/avatar';
  import { Button, buttonVariants } from '$lib/components/ui/button';
  import * as Table from '$lib/components/ui/table';
  import * as Popover from '$lib/components/ui/popover';
  import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
  import * as Dialog from '$lib/components/ui/dialog';
  import { Input } from '$lib/components/ui/input';
  import { Label } from '$lib/components/ui/label';
  import { format } from 'date-fns';

  let { data }: PageProps = $props();
  let newDialog = $state({
    open: false,
    label: '',
    idm: '',
  });
  let renameDialog = $state({
    open: false,
    id: 0,
    label: '',
    idm: '',
    oldLabel: '',
  });
  let deleteDialog = $state({
    open: false,
    id: 0,
    label: '',
    idm: '',
  });

  function openNewDialog() {
    newDialog.label = '';
    newDialog.idm = '';
    newDialog.open = true;
  }
  function openRenameDialog(id: number, label: string, idm: string) {
    renameDialog.id = id;
    renameDialog.label = label;
    renameDialog.idm = idm;
    renameDialog.oldLabel = label;
    renameDialog.open = true;
  }
  function openDeleteDialog(id: number, label: string, idm: string) {
    deleteDialog.id = id;
    deleteDialog.label = label;
    deleteDialog.idm = idm;
    deleteDialog.open = true;
  }

  onMount(() => {
    const param = page.url.pathname.slice(1);
    if (param) {
      page.url.pathname = '/';
      goto(page.url, { replaceState: true });
      newDialog.idm = param.toLowerCase();
      newDialog.open = true;
    }
  });
</script>

<header class="p-4 flex items-center justify-between sticky top-0 bg-background z-10">
  <div class="flex items-center gap-3 mx-2">
    <h1 class="text-xl font-bold">Kagimod</h1>
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

<main class="container p-6 mx-auto">
  <div class="flex items-center justify-between mb-4">
    <div class="flex gap-2">
      <h2 class="font-bold">ICカード一覧</h2>
      <p>{data.cards.length}件</p>
    </div>
    <Button onclick={openNewDialog} class="flex items-center"><PlusIcon />カードを追加</Button>
  </div>
  {#if data.cards.length}
    <Table.Root>
      <Table.Header>
        <Table.Row class="border-foreground/50">
          <Table.Head>カード名</Table.Head>
          <Table.Head>IDm</Table.Head>
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
              <div class="rounded-md p-1 bg-background flex gap-1">
                <DropdownMenu.Root>
                  <DropdownMenu.Trigger>
                    {#snippet child({ props })}
                      <Button {...props} variant="secondary" class="block sm:hidden" aria-label="操作"><EllipsisIcon /></Button>
                    {/snippet}
                  </DropdownMenu.Trigger>
                  <DropdownMenu.Content class="mx-4 my-2 w-fit" align="start">
                    <DropdownMenu.Item onSelect={() => openRenameDialog(card.id, card.label, card.idm_raw)} class="text-sm/3 p-3">
                      <PencilIcon />名前を変更
                    </DropdownMenu.Item>
                    <DropdownMenu.Item onSelect={() => openDeleteDialog(card.id, card.label, card.idm_raw)} variant="destructive" class="text-sm/3 p-3">
                      <Trash2Icon />削除
                    </DropdownMenu.Item>
                  </DropdownMenu.Content>
                </DropdownMenu.Root>
                <Button
                  variant="secondary"
                  onclick={() => openRenameDialog(card.id, card.label, card.idm_raw)}
                  class="hidden sm:block"
                  aria-label="名前を変更"><PencilIcon /></Button>
                <Button
                  variant="destructive"
                  onclick={() => openDeleteDialog(card.id, card.label, card.idm_raw)}
                  class="hidden sm:block"
                  aria-label="削除"><Trash2Icon /></Button>
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

<Dialog.Root bind:open={newDialog.open}>
  <Dialog.Content onOpenAutoFocus={(e) => e.preventDefault()}>
   <Dialog.Header>
      <Dialog.Title class="text-xl font-bold">カードを追加</Dialog.Title>
      <Dialog.Description>
        交通系ICカード(FeliCa)のIDmを登録します
      </Dialog.Description>
    </Dialog.Header>
    <form
      id="newForm" 
      action="?/new" 
      method="POST" 
      use:enhance={({ formElement, formData, action, cancel }) => {
        return async ({ result, update }) => {
          if (result.type == 'success') {
            newDialog.open = false;
            update();
          } else if (result.type == 'failure') {
            console.error(result.data);
            alert('エラーが発生しました:\n' + result.data);
          }
        };
      }}
      class="grid flex-1 gap-4">
      <div>
        <Label for="newLabel" class="mb-2">カードの名前</Label>
        <Input
          id="newLabel"
          name="label"
          placeholder="e.g. スマホのSuica"
          bind:value={newDialog.label}
        />
      </div>
      <div>
        <Label for="newIdm" class="mb-2">IDm (16進数 16文字)</Label>
        <Input
          id="newIdm"
          name="idm_raw"
          placeholder="0123456789abcdef"
          bind:value={newDialog.idm}
        />
      </div>
    </form>
    <Dialog.Footer class="sm:justify-end">
      <Dialog.Close class={buttonVariants({ variant: "secondary" })}
        >閉じる</Dialog.Close
      >
      <Button type="submit" form="newForm" disabled={!newDialog.label || !RegExp(/^[a-fA-F0-9]{16}$/).test(newDialog.idm)}>追加</Button>
    </Dialog.Footer>
  </Dialog.Content>
</Dialog.Root>

<Dialog.Root bind:open={renameDialog.open}>
  <Dialog.Content onOpenAutoFocus={(e) => e.preventDefault()}>
   <Dialog.Header>
      <Dialog.Title class="text-xl font-bold">カード名を変更</Dialog.Title>
      <Dialog.Description>
        IDm: {renameDialog.idm}
      </Dialog.Description>
    </Dialog.Header>
    <form
      id="renameForm"
      action="?/rename" 
      method="POST" 
      use:enhance={({ formElement, formData, action, cancel }) => {
        return async ({ result, update }) => {
          if (result.type == 'success') {
            renameDialog.open = false;
            update();
          } else if (result.type == 'failure') {
            console.error(result.data);
            alert('エラーが発生しました:\n' + result.data);
          }
        };
      }}>
      <input name="id" type="hidden" value={renameDialog.id} />
      <Label for="renameLabel" class="mb-2">カードの名前</Label>
      <Input
        id="renameLabel"
        name="label"
        placeholder="e.g. スマホのSuica"
        bind:value={renameDialog.label}
      />
    </form>
    <Dialog.Footer class="sm:justify-end">
      <Dialog.Close class={buttonVariants({ variant: "secondary" })}
        >キャンセル</Dialog.Close
      >
      <Button type="submit" form="renameForm" disabled={!renameDialog.label || renameDialog.label == renameDialog.oldLabel}>変更</Button>
    </Dialog.Footer>
  </Dialog.Content>
</Dialog.Root>

<Dialog.Root bind:open={deleteDialog.open}>
  <Dialog.Content onOpenAutoFocus={(e) => e.preventDefault()}>
   <Dialog.Header>
      <Dialog.Title class="text-xl font-bold">カードを削除</Dialog.Title>
      <Dialog.Description class="break-all">
        <p>カード名: {deleteDialog.label}</p>
        <p>IDm: {deleteDialog.idm}</p>
      </Dialog.Description>
    </Dialog.Header>
    <form
      id="deleteForm"
      action="?/delete" 
      method="POST" 
      use:enhance={({ formElement, formData, action, cancel }) => {
        return async ({ result, update }) => {
          if (result.type == 'success') {
            deleteDialog.open = false;
            update();
          } else if (result.type == 'failure') {
            console.error(result.data);
            alert('エラーが発生しました:\n' + result.data);
          }
        };
      }}>
      <input name="id" type="hidden" value={deleteDialog.id} />
      本当に削除しますか？
    </form>
    <Dialog.Footer class="sm:justify-end">
      <Dialog.Close class={buttonVariants({ variant: "secondary" })}
        >キャンセル</Dialog.Close
      >
      <Button type="submit" form="deleteForm" variant="destructive">削除</Button>
    </Dialog.Footer>
  </Dialog.Content>
</Dialog.Root>
