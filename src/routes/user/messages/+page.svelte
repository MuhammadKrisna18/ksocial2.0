<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import { slide } from 'svelte/transition';
	import { page } from '$app/stores';
	import { chatState } from '$lib/presentation/stores/chatState.svelte';

	type Contact = {
		userId: string;
		username: string;
		fullName: string;
		avatarUrl: string | null;
		lastMessage: string | null;
		lastMessageAt: string | Date | null;
		unreadCount: number;
	};

	type Friend = {
		id: string;
		username: string;
		fullName: string;
		profilePictureUrl: string | null;
	};

	type ChatMessage = {
		id: string;
		senderId: string;
		text: string;
		createdAt: string;
		isMine: boolean;
	};

	let { data } = $props();
	const currentUserId = data.user?.sub ?? '';
	let friends = $state<Friend[]>(data.friends ?? []);
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
	let unsubscribeMessages: (() => void) | null = null;

	// Synchronize activeContactId with global chatState
	$effect(() => {
		chatState.activeContactId = activeContactId;
		return () => {
			chatState.activeContactId = null;
		};
	});

	const activeContact = $derived(
		contacts.find((contact) => contact.userId === activeContactId) ||
		(() => {
			const f = friends.find((f) => f.id === activeContactId);
			if (!f) return undefined;
			return {
				userId: f.id,
				username: f.username,
				fullName: f.fullName,
				avatarUrl: f.profilePictureUrl,
				lastMessage: null,
				lastMessageAt: null,
				unreadCount: 0
			};
		})()
	);

	const filteredContacts = $derived(
		contacts.filter((contact) =>
			`${contact.fullName} ${contact.username}`.toLowerCase().includes(search.toLowerCase())
		)
	);

	const searchMatchedFriends = $derived(
		search.trim()
			? friends.filter(
					(f) =>
						!contacts.some((c) => c.userId === f.id) &&
						`${f.fullName} ${f.username}`.toLowerCase().includes(search.toLowerCase())
				)
			: []
	);

	onMount(() => {
		// Listen to incoming messages broadcast by the global chat stream
		unsubscribeMessages = chatState.subscribeMessages((incomingRaw) => {
			const incoming = mapMessage(incomingRaw);
			const isCurrentConversation =
				activeContactId &&
				((incoming.senderId === activeContactId && incoming.isMine === false) ||
					(incoming.senderId === currentUserId && activeContactId));
			if (isCurrentConversation && !messages.some((message) => message.id === incoming.id)) {
				messages = [...messages, incoming];
				scrollToBottom();
				if (incoming.senderId === activeContactId) {
					void fetch(`/api/chat/${encodeURIComponent(activeContactId)}`, { method: 'PATCH' });
				}
			}
			void fetchContacts();
		});

		void fetchContacts().then(() => {
			const contactParam = $page.url.searchParams.get('contact');
			if (contactParam) {
				void selectContact(contactParam);
			}
		});
		void fetchFriends();
	});

	onDestroy(() => {
		unsubscribeMessages?.();
	});

	function formatTime(value: string | Date) {
		return new Date(value).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
	}

	function mapMessage(message: any): ChatMessage {
		return {
			id: message.id,
			senderId: message.senderId,
			text: message.content,
			createdAt: message.createdAt,
			isMine: message.senderId === currentUserId
		};
	}

	async function fetchFriends() {
		try {
			const res = await fetch('/api/chat/friends');
			if (res.ok) {
				const payload = await res.json();
				if (Array.isArray(payload.friends)) {
					friends = payload.friends;
				}
			}
		} catch (err) {
			console.error('Failed to refresh friends list:', err);
		}
	}

	async function fetchContacts() {
		isLoadingContacts = true;
		try {
			const response = await fetch('/api/chat/contacts');
			if (!response.ok) throw new Error('Gagal memuat daftar percakapan.');
			contacts = (await response.json()).contacts ?? [];

			// If a contact is currently open, ensure its unread count is zeroed out
			if (activeContactId) {
				const current = contacts.find((c) => c.userId === activeContactId);
				if (current) current.unreadCount = 0;
			}
		} catch (error) {
			errorText = error instanceof Error ? error.message : 'Gagal memuat percakapan.';
		} finally {
			isLoadingContacts = false;
		}
	}

	async function selectContact(id: string) {
		activeContactId = id;
		showChatList = false;
		errorText = '';
		messages = [];
		isLoadingMessages = true;

		// Immediately reduce unread count for this contact from global state
		const targetContact = contacts.find((contact) => contact.userId === id);
		if (targetContact && targetContact.unreadCount > 0) {
			chatState.decrementUnread(targetContact.unreadCount);
			targetContact.unreadCount = 0;
		}

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
		setTimeout(() => {
			if (messagesContainer) messagesContainer.scrollTop = messagesContainer.scrollHeight;
		}, 0);
	}

	async function sendMessage() {
		const content = newMessage.trim();
		if (!content || !activeContactId || isSending) return;
		newMessage = '';
		errorText = '';
		isSending = true;
		try {
			const response = await fetch(`/api/chat/${encodeURIComponent(activeContactId)}`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ content })
			});
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

<div
	class="m-4 flex h-full max-h-[calc(100vh-4rem)] overflow-hidden rounded-3xl border border-slate-200/60 bg-white/50 shadow-xl backdrop-blur-sm dark:border-slate-800/60 dark:bg-slate-900/50"
>
	<!-- Sidebar Percakapan & Teman -->
	<aside
		class={`${showChatList ? 'flex' : 'hidden'} w-full flex-col border-r border-slate-200/60 bg-white/80 dark:border-slate-800/60 dark:bg-slate-900/80 md:flex md:w-80 lg:w-96`}
	>
		<!-- Header Sidebar -->
		<div class="flex items-center justify-between border-b border-slate-200/60 p-4 dark:border-slate-800/60">
			<h1 class="text-xl font-extrabold text-slate-800 dark:text-slate-100">Messages</h1>
		</div>

		<!-- Friends Quick Start Carousel (Jika ada teman) -->
		{#if friends.length > 0}
			<div class="border-b border-slate-100 px-4 py-3 dark:border-slate-800/60">
				<div class="mb-2.5 flex items-center justify-between">
					<span class="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
						Teman
					</span>
					<span class="rounded-full bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-[10px] font-bold text-slate-500 dark:text-slate-400">
						{friends.length}
					</span>
				</div>
				<div class="flex gap-3 overflow-x-auto pb-1 scrollbar-none">
					{#each friends as friend (friend.id)}
						<button
							type="button"
							onclick={() => selectContact(friend.id)}
							class="group flex flex-shrink-0 flex-col items-center gap-1.5 focus:outline-none"
							title={`Mulai obrolan dengan ${friend.fullName}`}
						>
							<div class="relative">
								<div
									class={`h-12 w-12 overflow-hidden rounded-full ring-2 transition-all duration-200 ${
										activeContactId === friend.id
											? 'ring-primary-600 ring-offset-2 dark:ring-offset-slate-900'
											: 'ring-transparent group-hover:ring-primary-400'
									}`}
								>
									{#if friend.profilePictureUrl}
										<img src={friend.profilePictureUrl} alt={friend.fullName} class="h-full w-full object-cover" />
									{:else}
										<div class="flex h-full w-full items-center justify-center bg-gradient-to-tr from-primary-600 to-indigo-500 text-sm font-bold text-white">
											{friend.fullName ? friend.fullName.charAt(0).toUpperCase() : friend.username.charAt(0).toUpperCase()}
										</div>
									{/if}
								</div>
								<!-- Online / Mutual Friend Indicator -->
								<div class="absolute -bottom-0.5 -right-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full border-2 border-white bg-emerald-500 dark:border-slate-900">
									<div class="h-1 w-1 rounded-full bg-white"></div>
								</div>
							</div>
							<span
								class={`max-w-[60px] truncate text-[11px] font-medium transition-colors ${
									activeContactId === friend.id
										? 'font-bold text-primary-600 dark:text-primary-400'
										: 'text-slate-600 group-hover:text-primary-600 dark:text-slate-300 dark:group-hover:text-primary-400'
								}`}
							>
								{friend.fullName ? friend.fullName.split(' ')[0] : friend.username}
							</span>
						</button>
					{/each}
				</div>
			</div>
		{/if}

		<!-- Search Bar -->
		<div class="p-3">
			<div class="relative">
				<input
					bind:value={search}
					aria-label="Search conversations"
					placeholder="Cari obrolan atau teman..."
					class="w-full rounded-xl bg-slate-100 py-2 pl-9 pr-4 text-sm outline-none transition-all placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-primary-500/20 dark:bg-slate-800 dark:text-white dark:focus:bg-slate-800"
				/>
				<svg
					class="absolute left-3 top-2.5 h-4 w-4 text-slate-400"
					fill="none"
					viewBox="0 0 24 24"
					stroke="currentColor"
				>
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
				</svg>
			</div>
		</div>

		<!-- List Percakapan / Kontak -->
		<div class="flex-1 overflow-y-auto">
			{#if isLoadingContacts}
				<div class="flex flex-col items-center justify-center py-10 text-slate-400">
					<div class="h-6 w-6 animate-spin rounded-full border-2 border-primary-500 border-t-transparent mb-2"></div>
					<p class="text-xs">Memuat percakapan...</p>
				</div>
			{:else}
				<!-- Search results for friends who are not yet in contacts -->
				{#if searchMatchedFriends.length > 0}
					<div class="px-4 py-2 bg-slate-50/70 dark:bg-slate-800/40 text-[11px] font-bold uppercase tracking-wider text-slate-400">
						Teman
					</div>
					{#each searchMatchedFriends as friend (friend.id)}
						<button
							type="button"
							onclick={() => selectContact(friend.id)}
							class={`flex w-full items-center gap-3 border-b border-slate-100/50 p-3.5 text-left transition-colors hover:bg-slate-50 dark:border-slate-800/50 dark:hover:bg-slate-800/50 ${
								activeContactId === friend.id ? 'bg-primary-50/80 dark:bg-slate-800/80' : ''
							}`}
						>
							{#if friend.profilePictureUrl}
								<img src={friend.profilePictureUrl} alt={friend.fullName} class="h-11 w-11 rounded-full object-cover" />
							{:else}
								<div class="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-tr from-primary-600 to-indigo-500 text-sm font-bold text-white">
									{friend.fullName ? friend.fullName.charAt(0).toUpperCase() : friend.username.charAt(0).toUpperCase()}
								</div>
							{/if}
							<div class="min-w-0 flex-1">
								<b class="truncate text-sm text-slate-800 dark:text-white">{friend.fullName}</b>
								<p class="truncate text-xs text-slate-400">@{friend.username}</p>
							</div>
							<span class="rounded-lg bg-primary-50 px-2 py-1 text-xs font-semibold text-primary-600 dark:bg-primary-900/30 dark:text-primary-400">
								Mulai Chat
							</span>
						</button>
					{/each}
				{/if}

				<!-- Existing conversations list -->
				{#if filteredContacts.length > 0}
					{#if searchMatchedFriends.length > 0}
						<div class="px-4 py-2 bg-slate-50/70 dark:bg-slate-800/40 text-[11px] font-bold uppercase tracking-wider text-slate-400">
							Obrolan
						</div>
					{/if}
					{#each filteredContacts as contact (contact.userId)}
						<button
							type="button"
							onclick={() => selectContact(contact.userId)}
							class={`flex w-full items-center gap-3 border-b border-slate-100/50 p-4 text-left transition-colors hover:bg-slate-50 dark:border-slate-800/50 dark:hover:bg-slate-800/50 ${
								activeContactId === contact.userId ? 'bg-primary-50/80 dark:bg-slate-800/80' : ''
							}`}
						>
							{#if contact.avatarUrl}
								<img src={contact.avatarUrl} alt={contact.fullName} class="h-12 w-12 rounded-full object-cover" />
							{:else}
								<div class="flex h-12 w-12 items-center justify-center rounded-full bg-primary-600 text-base font-bold text-white">
									{contact.fullName.charAt(0).toUpperCase()}
								</div>
							{/if}
							<div class="min-w-0 flex-1">
								<b class="truncate text-sm text-slate-800 dark:text-white block">{contact.fullName}</b>
								<p class={`truncate text-xs mt-0.5 ${contact.unreadCount ? 'font-bold text-slate-900 dark:text-white' : 'text-slate-500'}`}>
									{contact.lastMessage ?? 'Memulai percakapan'}
								</p>
							</div>
							<div class="flex flex-col items-end justify-between self-stretch shrink-0 py-0.5">
								<small class={`text-[11px] ${contact.unreadCount ? 'font-bold text-blue-600 dark:text-blue-400' : 'text-slate-400'}`}>
									{contact.lastMessageAt ? new Date(contact.lastMessageAt).toLocaleDateString([], { month: 'short', day: 'numeric' }) : ''}
								</small>
								{#if contact.unreadCount > 0}
									<span class="flex h-5 min-w-5 items-center justify-center rounded-full bg-blue-600 px-1.5 text-[10px] font-bold text-white shadow-xs">
										{contact.unreadCount > 99 ? '99+' : contact.unreadCount}
									</span>
								{/if}
							</div>
						</button>

					{/each}
				{:else if search.trim() && searchMatchedFriends.length === 0}
					<p class="mt-8 p-4 text-center text-xs text-slate-400">
						Tidak ada percakapan atau teman yang cocok dengan "{search}".
					</p>
				{:else if !search.trim()}
					<!-- Empty State: Belum ada obrolan sebelumnya, tampilkan profil teman untuk diajak chat -->
					<div class="p-4 text-center">
						<div class="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-50 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400">
							<svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
								/>
							</svg>
						</div>
						<p class="text-sm font-bold text-slate-800 dark:text-slate-100">Belum ada obrolan</p>
						<p class="mt-1 mb-4 text-xs text-slate-500 dark:text-slate-400">
							Pilih teman di bawah untuk memulai percakapan baru.
						</p>

						{#if friends.length > 0}
							<div class="space-y-2 text-left">
								{#each friends as friend (friend.id)}
									<button
										type="button"
										onclick={() => selectContact(friend.id)}
										class="group flex w-full items-center gap-3 rounded-2xl border border-slate-100 bg-white/70 p-2.5 transition-all hover:border-primary-200 hover:bg-primary-50/50 dark:border-slate-800 dark:bg-slate-800/40 dark:hover:border-primary-700/50"
									>
										<div class="h-10 w-10 flex-shrink-0 overflow-hidden rounded-full">
											{#if friend.profilePictureUrl}
												<img src={friend.profilePictureUrl} alt={friend.fullName} class="h-full w-full object-cover" />
											{:else}
												<div class="flex h-full w-full items-center justify-center bg-gradient-to-tr from-primary-600 to-indigo-500 text-sm font-bold text-white">
													{friend.fullName ? friend.fullName.charAt(0).toUpperCase() : friend.username.charAt(0).toUpperCase()}
												</div>
											{/if}
										</div>
										<div class="min-w-0 flex-1">
											<p class="truncate text-xs font-bold text-slate-800 transition-colors group-hover:text-primary-600 dark:text-white dark:group-hover:text-primary-400">
												{friend.fullName}
											</p>
											<p class="truncate text-[11px] text-slate-400">@{friend.username}</p>
										</div>
										<span class="rounded-lg bg-primary-50 px-2.5 py-1 text-xs font-semibold text-primary-600 transition-colors group-hover:bg-primary-600 group-hover:text-white dark:bg-primary-900/30 dark:text-primary-400">
											Chat
										</span>
									</button>
								{/each}
							</div>
						{:else}
							<div class="rounded-xl bg-slate-50 p-3 text-xs text-slate-500 dark:bg-slate-800/50 dark:text-slate-400">
								Anda belum memiliki teman. Kunjungi halaman
								<a href="/user/friends" class="font-bold text-primary-600 hover:underline dark:text-primary-400">
									Teman
								</a>
								untuk terhubung dengan pengguna lain.
							</div>
						{/if}
					</div>
				{/if}
			{/if}
		</div>
	</aside>

	<!-- Main Chat Area -->
	<section
		class={`${!showChatList ? 'flex' : 'hidden'} min-w-0 flex-1 flex-col bg-slate-50/30 dark:bg-slate-950/30 md:flex`}
	>
		{#if activeContact}
			<!-- Chat Header -->
			<header
				class="flex h-16 items-center gap-3 border-b border-slate-200/60 bg-white/90 p-4 dark:border-slate-800/60 dark:bg-slate-900/90"
			>
				<button
					type="button"
					class="p-1 text-slate-500 hover:text-slate-800 md:hidden dark:text-slate-400 dark:hover:text-white"
					onclick={() => {
						showChatList = true;
						activeContactId = null;
					}}
					aria-label="Kembali ke daftar pesan"
				>
					<svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
					</svg>
				</button>

				{#if activeContact.avatarUrl}
					<img src={activeContact.avatarUrl} alt={activeContact.fullName} class="h-10 w-10 rounded-full object-cover" />
				{:else}
					<div class="flex h-10 w-10 items-center justify-center rounded-full bg-primary-600 font-bold text-white">
						{activeContact.fullName.charAt(0).toUpperCase()}
					</div>
				{/if}

				<div>
					<b class="text-sm text-slate-800 dark:text-white">{activeContact.fullName}</b>
					<p class="text-xs text-slate-500">@{activeContact.username}</p>
				</div>
			</header>

			{#if errorText}
				<div role="alert" class="border-b border-red-100 bg-red-50 px-4 py-2 text-center text-sm text-red-600">
					{errorText}
				</div>
			{/if}

			<!-- Messages Stream / Log -->
			<div bind:this={messagesContainer} class="flex-1 space-y-4 overflow-y-auto p-4">
				{#if isLoadingMessages}
					<div class="flex flex-col items-center justify-center py-12 text-slate-400">
						<div class="h-6 w-6 animate-spin rounded-full border-2 border-primary-500 border-t-transparent mb-2"></div>
						<p class="text-xs">Memuat pesan...</p>
					</div>
				{:else if messages.length === 0}
					<div class="flex flex-col items-center justify-center py-16 text-center text-slate-400">
						<div class="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-primary-50 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400">
							<svg class="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
								/>
							</svg>
						</div>
						<p class="text-sm font-semibold text-slate-700 dark:text-slate-200">
							Mulai obrolan dengan {activeContact.fullName}
						</p>
						<p class="mt-1 text-xs text-slate-400">
							Kirim pesan pertama Anda untuk memulai percakapan.
						</p>
					</div>
				{:else}
					{#each messages as message (message.id)}
						<div class={`flex ${message.isMine ? 'justify-end' : 'justify-start'}`} transition:slide>
							<div
								class={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm ${
									message.isMine
										? 'rounded-tr-sm bg-primary-600 text-white shadow-sm shadow-primary-500/20'
										: 'rounded-tl-sm bg-white text-slate-800 shadow-sm dark:bg-slate-800 dark:text-slate-200'
								}`}
							>
								<p class="whitespace-pre-wrap break-words">{message.text}</p>
								<small
									class={`mt-1 block text-right text-[10px] ${
										message.isMine ? 'text-primary-100' : 'text-slate-400'
									}`}
								>
									{formatTime(message.createdAt)}
								</small>
							</div>
						</div>
					{/each}
				{/if}
			</div>

			<!-- Message Input Form -->
			<form
				class="flex gap-2 border-t border-slate-200/60 bg-white/90 p-3 dark:border-slate-800/60 dark:bg-slate-900/90"
				onsubmit={(event) => {
					event.preventDefault();
					void sendMessage();
				}}
			>
				<input
					bind:value={newMessage}
					maxlength="1000"
					autocomplete="off"
					aria-label="Message"
					placeholder={`Ketik pesan untuk ${activeContact.fullName}...`}
					class="min-w-0 flex-1 rounded-2xl bg-slate-100 px-4 py-2.5 text-sm outline-none transition-all placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-primary-500/20 dark:bg-slate-800 dark:text-white dark:focus:bg-slate-800"
				/>
				<button
					type="submit"
					disabled={!newMessage.trim() || isSending}
					class="flex items-center gap-1.5 rounded-2xl bg-primary-600 px-5 py-2.5 text-sm font-bold text-white shadow-md shadow-primary-500/20 transition-all hover:bg-primary-700 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
				>
					{#if isSending}
						<div class="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
					{:else}
						<span>Kirim</span>
						<svg class="h-4 w-4 rotate-45" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
						</svg>
					{/if}
				</button>
			</form>
		{:else}
			<div class="flex flex-1 flex-col items-center justify-center p-8 text-center text-slate-500">
				<div class="mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-primary-50 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400">
					<svg class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
						/>
					</svg>
				</div>
				<h2 class="text-xl font-bold text-slate-800 dark:text-white">Pesan Anda</h2>
				<p class="mt-1 text-sm text-slate-400">Pilih teman atau percakapan untuk mulai berkirim pesan.</p>
			</div>
		{/if}
	</section>
</div>
