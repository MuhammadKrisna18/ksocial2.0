<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import { slide } from 'svelte/transition';

	type Contact = { userId: string; username: string; fullName: string; avatarUrl: string | null; lastMessage: string | null; lastMessageAt: string | Date | null; unreadCount: number };
	type ChatMessage = { id: string; senderId: string; text: string; createdAt: string; isMine: boolean };

	let { data } = $props();
	const currentUserId = data.user?.sub ?? '';
	let contacts = $state<Contact[]>([]);
	let activeContactId = $state<string | null>(null);
	let messages = $state<ChatMessage[]>([]);
	let newMessage = $state('');
	let search = $state('');
	let showChatList = $state(true);
	let errorText = $state('');
	let isLoadingContacts = $state(false);
	let isLoadingMessages = $state(false);
	let isSending = $state(false);
	let messagesContainer: HTMLDivElement | null = $state(null);
	let eventSource: EventSource | null = null;

	const activeContact = $derived(contacts.find((contact) => contact.userId === activeContactId));
	const filteredContacts = $derived(contacts.filter((contact) => `${contact.fullName} ${contact.username}`.toLowerCase().includes(search.toLowerCase())));

	onMount(() => {
		void fetchContacts();
		connectSSE();
	});

	onDestroy(() => eventSource?.close());

	function formatTime(value: string | Date) {
		return new Date(value).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
	}

	function mapMessage(message: any): ChatMessage {
		return { id: message.id, senderId: message.senderId, text: message.content, createdAt: message.createdAt, isMine: message.senderId === currentUserId };
	}

	async function fetchContacts() {
		isLoadingContacts = true;
		try {
			const response = await fetch('/api/chat/contacts');
			if (!response.ok) throw new Error('Gagal memuat daftar percakapan.');
			contacts = (await response.json()).contacts ?? [];
		} catch (error) {
			errorText = error instanceof Error ? error.message : 'Gagal memuat percakapan.';
		} finally {
			isLoadingContacts = false;
		}
	}

	function connectSSE() {
		eventSource?.close();
		eventSource = new EventSource('/api/chat/stream');
		eventSource.addEventListener('message', (event) => {
			try {
				const incoming = mapMessage(JSON.parse((event as MessageEvent).data));
				const related = activeContactId && ((incoming.senderId === activeContactId && currentUserId) || (incoming.senderId === currentUserId && incoming.senderId !== activeContactId));
				const isCurrentConversation = activeContactId && ((incoming.senderId === activeContactId && incoming.isMine === false) || (incoming.senderId === currentUserId && activeContactId));
				if (isCurrentConversation && !messages.some((message) => message.id === incoming.id)) {
					messages = [...messages, incoming];
					scrollToBottom();
				}
				void fetchContacts();
			} catch (error) {
				console.error('Invalid chat event', error);
			}
		});
		eventSource.onerror = () => console.warn('Chat stream disconnected; browser will retry.');
	}

	async function selectContact(id: string) {
		activeContactId = id;
		showChatList = false;
		errorText = '';
		messages = [];
		isLoadingMessages = true;
		try {
			const response = await fetch(`/api/chat/${encodeURIComponent(id)}?limit=200`);
			const payload = await response.json();
			if (!response.ok) throw new Error(payload.error ?? 'Gagal memuat pesan.');
			messages = (payload.messages ?? []).map(mapMessage);
			await fetchContacts();
			scrollToBottom();
		} catch (error) {
			errorText = error instanceof Error ? error.message : 'Gagal memuat pesan.';
		} finally {
			isLoadingMessages = false;
		}
	}

	function scrollToBottom() {
		setTimeout(() => { if (messagesContainer) messagesContainer.scrollTop = messagesContainer.scrollHeight; }, 0);
	}

	async function sendMessage() {
		const content = newMessage.trim();
		if (!content || !activeContactId || isSending) return;
		newMessage = '';
		errorText = '';
		isSending = true;
		try {
			const response = await fetch(`/api/chat/${encodeURIComponent(activeContactId)}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ content }) });
			const payload = await response.json();
			if (!response.ok) throw new Error(payload.error ?? 'Pesan gagal dikirim.');
			const sent = mapMessage(payload.message);
			if (!messages.some((message) => message.id === sent.id)) messages = [...messages, sent];
			await fetchContacts();
			scrollToBottom();
		} catch (error) {
			newMessage = content;
			errorText = error instanceof Error ? error.message : 'Connection error.';
		} finally {
			isSending = false;
		}
	}
</script>

<svelte:head><title>Messages | K-Social</title></svelte:head>

<div class="m-4 flex h-full max-h-[calc(100vh-4rem)] overflow-hidden rounded-3xl border border-slate-200/60 bg-white/50 shadow-xl backdrop-blur-sm dark:border-slate-800/60 dark:bg-slate-900/50">
	<aside class={`${showChatList ? 'flex' : 'hidden'} w-full flex-col border-r border-slate-200/60 bg-white/80 dark:border-slate-800/60 dark:bg-slate-900/80 md:flex md:w-80 lg:w-96`}>
		<div class="flex items-center justify-between border-b border-slate-200/60 p-4 dark:border-slate-800/60"><h1 class="text-xl font-extrabold text-slate-800 dark:text-slate-100">Messages</h1></div>
		<div class="p-4"><input bind:value={search} aria-label="Search conversations" placeholder="Search messages..." class="w-full rounded-xl bg-slate-100 px-4 py-2 text-sm dark:bg-slate-800 dark:text-white" /></div>
		<div class="flex-1 overflow-y-auto">
			{#if isLoadingContacts}<p class="p-4 text-center text-sm text-slate-500">Loading conversations...</p>
			{:else if filteredContacts.length === 0}<p class="mt-10 p-4 text-center text-sm text-slate-500">Belum ada obrolan.</p>
			{:else}{#each filteredContacts as contact}<button type="button" onclick={() => selectContact(contact.userId)} class={`flex w-full items-center gap-3 border-b border-slate-100/50 p-4 text-left hover:bg-slate-50 dark:border-slate-800/50 dark:hover:bg-slate-800/50 ${activeContactId === contact.userId ? 'bg-blue-50 dark:bg-slate-800/80' : ''}`}>
				{#if contact.avatarUrl}<img src={contact.avatarUrl} alt={contact.fullName} class="h-12 w-12 rounded-full object-cover" />{:else}<div class="flex h-12 w-12 items-center justify-center rounded-full bg-blue-600 text-lg font-bold text-white">{contact.fullName.charAt(0)}</div>{/if}
				<div class="min-w-0 flex-1"><div class="flex justify-between"><b class="truncate text-sm dark:text-white">{contact.fullName}</b><small class="text-slate-500">{contact.lastMessageAt ? new Date(contact.lastMessageAt).toLocaleDateString([], { month: 'short', day: 'numeric' }) : ''}</small></div><p class={`truncate text-xs ${contact.unreadCount ? 'font-bold text-slate-900 dark:text-white' : 'text-slate-500'}`}>{contact.lastMessage ?? 'Started a conversation'}</p></div>
				{#if contact.unreadCount}<span class="flex h-5 min-w-5 items-center justify-center rounded-full bg-blue-600 px-1 text-[10px] font-bold text-white">{contact.unreadCount}</span>{/if}
			</button>{/each}{/if}
		</div>
	</aside>

	<section class={`${!showChatList ? 'flex' : 'hidden'} min-w-0 flex-1 flex-col bg-slate-50/30 dark:bg-slate-950/30 md:flex`}>
		{#if activeContact}
			<header class="flex h-16 items-center gap-3 border-b border-slate-200/60 bg-white/90 p-4 dark:border-slate-800/60 dark:bg-slate-900/90"><button type="button" class="md:hidden" onclick={() => { showChatList = true; activeContactId = null; }}>←</button>{#if activeContact.avatarUrl}<img src={activeContact.avatarUrl} alt={activeContact.fullName} class="h-10 w-10 rounded-full object-cover" />{:else}<div class="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 font-bold text-white">{activeContact.fullName.charAt(0)}</div>{/if}<div><b class="text-sm dark:text-white">{activeContact.fullName}</b><p class="text-xs text-slate-500">@{activeContact.username}</p></div></header>
			{#if errorText}<div role="alert" class="border-b border-red-100 bg-red-50 px-4 py-2 text-center text-sm text-red-600">{errorText}</div>{/if}
			<div bind:this={messagesContainer} class="flex-1 space-y-4 overflow-y-auto p-4">{#if isLoadingMessages}<p class="text-center text-sm text-slate-500">Loading messages...</p>{:else if messages.length === 0}<p class="text-center text-sm text-slate-500">Kirim pesan pertama Anda</p>{:else}{#each messages as message (message.id)}<div class={`flex ${message.isMine ? 'justify-end' : 'justify-start'}`} transition:slide><div class={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm ${message.isMine ? 'rounded-tr-sm bg-blue-600 text-white' : 'bg-white text-slate-800 dark:bg-slate-800 dark:text-slate-200'}`}><p class="whitespace-pre-wrap break-words">{message.text}</p><small class={`mt-1 block text-[10px] ${message.isMine ? 'text-blue-100' : 'text-slate-400'}`}>{formatTime(message.createdAt)}</small></div></div>{/each}{/if}</div>
			<form class="flex gap-2 border-t border-slate-200/60 bg-white/90 p-3 dark:border-slate-800/60 dark:bg-slate-900/90" onsubmit={(event) => { event.preventDefault(); void sendMessage(); }}><input bind:value={newMessage} maxlength="1000" autocomplete="off" aria-label="Message" placeholder="Type a message..." class="min-w-0 flex-1 rounded-3xl bg-slate-100 px-4 py-2 text-sm dark:bg-slate-800 dark:text-white" /><button type="submit" disabled={!newMessage.trim() || isSending} class="rounded-full bg-blue-600 px-5 text-sm font-bold text-white disabled:opacity-50">{isSending ? '...' : 'Send'}</button></form>
		{:else}<div class="flex flex-1 flex-col items-center justify-center p-8 text-center text-slate-500"><h2 class="text-xl font-bold">Your Messages</h2><p class="text-sm">Select a conversation to start chatting.</p></div>{/if}
	</section>
</div>
