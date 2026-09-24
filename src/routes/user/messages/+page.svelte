<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import { slide, fade } from 'svelte/transition';
	import { page } from '$app/stores';
	import { resolve } from '$app/paths';
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

	type RawChatMessage = {
		id: string;
		senderId: string;
		content?: string;
		text?: string;
		createdAt: string;
	};

	let { data } = $props();
	const currentUserId = $derived(data.user?.sub ?? '');
	let friends = $state<Friend[]>([]);
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
	let activeFilter = $state<'all' | 'unread' | 'friends'>('all');
	let messagesContainer: HTMLDivElement | null = $state(null);
	let unsubscribeMessages: (() => void) | null = null;

	$effect(() => {
		if (data.friends) {
			friends = data.friends;
		}
	});

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

	const totalUnreadCount = $derived(
		contacts.reduce((acc, c) => acc + (c.unreadCount || 0), 0)
	);

	const uncontactedFriends = $derived(
		friends.filter((f) => !contacts.some((c) => c.userId === f.id))
	);

	const filteredContacts = $derived.by(() => {
		let list = contacts;
		if (activeFilter === 'unread') {
			list = contacts.filter((c) => c.unreadCount > 0);
		}
		if (search.trim()) {
			const q = search.toLowerCase();
			return list.filter((c) =>
				`${c.fullName} ${c.username}`.toLowerCase().includes(q)
			);
		}
		return list;
	});

	const searchMatchedFriends = $derived(
		search.trim()
			? friends.filter(
					(f) =>
						!contacts.some((c) => c.userId === f.id) &&
						`${f.fullName} ${f.username}`.toLowerCase().includes(search.toLowerCase())
				)
			: []
	);

	const AVATAR_GRADIENTS = [
		'from-blue-500 to-indigo-600',
		'from-violet-500 to-purple-600',
		'from-rose-500 to-pink-600',
		'from-amber-500 to-orange-600',
		'from-emerald-500 to-teal-600',
		'from-sky-500 to-cyan-600',
		'from-fuchsia-500 to-pink-600',
		'from-indigo-500 to-blue-600'
	];

	function getAvatarGradient(name: string) {
		let hash = 0;
		for (let i = 0; i < (name || '').length; i++) {
			hash = (name.charCodeAt(i) + ((hash << 5) - hash)) | 0;
		}
		const index = Math.abs(hash) % AVATAR_GRADIENTS.length;
		return AVATAR_GRADIENTS[index];
	}

	function getInitials(name: string) {
		if (!name) return '?';
		const parts = name.trim().split(/\s+/);
		if (parts.length >= 2) {
			return (parts[0][0] + parts[1][0]).toUpperCase();
		}
		return parts[0].slice(0, 2).toUpperCase();
	}

	function formatMessageDate(value: string | Date | null) {
		if (!value) return '';
		const date = new Date(value);
		const now = new Date();
		const isToday = date.toDateString() === now.toDateString();
		if (isToday) {
			return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
		}
		const yesterday = new Date(Date.now() - 86400000);
		if (date.toDateString() === yesterday.toDateString()) {
			return 'Kemarin';
		}
		return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
	}

	function formatTime(value: string | Date) {
		return new Date(value).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
	}

	function formatChatSeparatorDate(dateStr: string) {
		const date = new Date(dateStr);
		const now = new Date();
		if (date.toDateString() === now.toDateString()) return 'Hari Ini';
		const yesterday = new Date(Date.now() - 86400000);
		if (date.toDateString() === yesterday.toDateString()) return 'Kemarin';
		return date.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'short' });
	}

	function isDifferentDay(d1: string, d2: string) {
		return new Date(d1).toDateString() !== new Date(d2).toDateString();
	}

	const quickGreetings = ['Halo! 👋', 'Lagi santai nih?', 'Bisa ngobrol sebentar?', 'Pe gelud 👊'];

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

	function mapMessage(message: RawChatMessage): ChatMessage {
		return {
			id: message.id,
			senderId: message.senderId,
			text: message.content ?? message.text ?? '',
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
	class="m-2 sm:m-4 flex h-[calc(100vh-4.5rem)] overflow-hidden rounded-3xl border border-slate-200/80 bg-white/75 shadow-2xl shadow-slate-200/40 backdrop-blur-2xl dark:border-slate-800/80 dark:bg-slate-900/75 dark:shadow-none"
>
	<!-- Sidebar Percakapan & Teman -->
	<aside
		class={`${showChatList ? 'flex' : 'hidden'} w-full flex-col border-r border-slate-200/70 bg-white/90 backdrop-blur-xl dark:border-slate-800/70 dark:bg-slate-900/90 md:flex md:w-80 lg:w-96 shrink-0 transition-all duration-300`}
	>
		<!-- Header Sidebar -->
		<div class="flex items-center justify-between px-5 pt-5 pb-3 border-b border-slate-100 dark:border-slate-800/60">
			<div class="flex items-center gap-2.5">
				<h1 class="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
					Pesan
				</h1>
				{#if totalUnreadCount > 0}
					<span
						class="inline-flex items-center gap-1 rounded-full bg-blue-500/10 px-2.5 py-0.5 text-xs font-bold text-blue-600 dark:bg-blue-400/15 dark:text-blue-400"
					>
						<span class="h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse"></span>
						{totalUnreadCount} baru
					</span>
				{:else}
					<span
						class="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-600 dark:bg-emerald-400/15 dark:text-emerald-400"
					>
						<span class="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
						Aktif
					</span>
				{/if}
			</div>

			<!-- Refresh Button -->
			<button
				type="button"
				onclick={() => { void fetchContacts(); void fetchFriends(); }}
				class="rounded-xl p-2 text-slate-400 transition-all hover:bg-slate-100 hover:text-slate-700 active:scale-90 dark:hover:bg-slate-800 dark:hover:text-slate-200"
				title="Muat ulang pesan"
				aria-label="Muat ulang pesan"
			>
				<svg class={`h-4 w-4 ${isLoadingContacts ? 'animate-spin text-blue-500' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
				</svg>
			</button>
		</div>

		<!-- Segment Tabs Filter (Semua, Belum Dibaca, Teman) -->
		<div class="px-4 pt-3 pb-1">
			<div class="flex rounded-2xl bg-slate-100/80 p-1 dark:bg-slate-800/60 text-xs font-semibold">
				<button
					type="button"
					onclick={() => (activeFilter = 'all')}
					class={`flex-1 rounded-xl py-1.5 transition-all duration-200 flex items-center justify-center gap-1.5 ${
						activeFilter === 'all'
							? 'bg-white text-slate-900 shadow-sm shadow-slate-200 dark:bg-slate-700 dark:text-white dark:shadow-none font-bold'
							: 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
					}`}
				>
					<span>Semua</span>
					{#if contacts.length > 0}
						<span class="rounded-full bg-slate-200/70 px-1.5 py-0.2 text-[10px] text-slate-600 dark:bg-slate-600 dark:text-slate-300">
							{contacts.length}
						</span>
					{/if}
				</button>
				<button
					type="button"
					onclick={() => (activeFilter = 'unread')}
					class={`flex-1 rounded-xl py-1.5 transition-all duration-200 flex items-center justify-center gap-1.5 ${
						activeFilter === 'unread'
							? 'bg-white text-blue-600 shadow-sm shadow-slate-200 dark:bg-slate-700 dark:text-blue-400 dark:shadow-none font-bold'
							: 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
					}`}
				>
					<span>Belum Dibaca</span>
					{#if totalUnreadCount > 0}
						<span class="rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 px-1.5 py-0.2 text-[10px] font-black text-white shadow-xs">
							{totalUnreadCount}
						</span>
					{/if}
				</button>
				<button
					type="button"
					onclick={() => (activeFilter = 'friends')}
					class={`flex-1 rounded-xl py-1.5 transition-all duration-200 flex items-center justify-center gap-1.5 ${
						activeFilter === 'friends'
							? 'bg-white text-slate-900 shadow-sm shadow-slate-200 dark:bg-slate-700 dark:text-white dark:shadow-none font-bold'
							: 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
					}`}
				>
					<span>Teman</span>
					{#if friends.length > 0}
						<span class="rounded-full bg-slate-200/70 px-1.5 py-0.2 text-[10px] text-slate-600 dark:bg-slate-600 dark:text-slate-300">
							{friends.length}
						</span>
					{/if}
				</button>
			</div>
		</div>

		<!-- Friends Quick Start Carousel (Jika ada teman & bukan di tab 'friends') -->
		{#if friends.length > 0 && activeFilter !== 'friends'}
			<div class="px-4 py-3 border-b border-slate-100/80 dark:border-slate-800/50">
				<div class="mb-2.5 flex items-center justify-between">
					<div class="flex items-center gap-1.5">
						<span class="h-2 w-2 rounded-full bg-emerald-500 ring-2 ring-emerald-500/20"></span>
						<span class="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-400">
							Teman Aktif
						</span>
					</div>
					<span class="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-500 dark:bg-slate-800 dark:text-slate-400">
						{friends.length}
					</span>
				</div>
				<div class="flex gap-3.5 overflow-x-auto pb-1 scrollbar-none">
					{#each friends as friend (friend.id)}
						<button
							type="button"
							onclick={() => selectContact(friend.id)}
							class="group flex flex-shrink-0 flex-col items-center gap-1.5 focus:outline-none transition-transform duration-200 hover:-translate-y-1 active:scale-95"
							title={`Mulai obrolan dengan ${friend.fullName}`}
						>
							<div class="relative">
								<div
									class={`h-12 w-12 overflow-hidden rounded-full ring-2 transition-all duration-200 shadow-sm ${
										activeContactId === friend.id
											? 'ring-blue-600 ring-offset-2 dark:ring-offset-slate-900 shadow-blue-500/20'
											: 'ring-slate-100 group-hover:ring-blue-400 dark:ring-slate-800'
									}`}
								>
									{#if friend.profilePictureUrl}
										<img src={friend.profilePictureUrl} alt={friend.fullName} class="h-full w-full object-cover" />
									{:else}
										<div
											class={`flex h-full w-full items-center justify-center bg-gradient-to-tr ${getAvatarGradient(friend.fullName)} text-xs font-black tracking-wider text-white shadow-inner`}
										>
											{getInitials(friend.fullName || friend.username)}
										</div>
									{/if}
								</div>
								<!-- Online Indicator -->
								<div class="absolute -bottom-0.5 -right-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-emerald-500 ring-2 ring-white dark:ring-slate-900 shadow-xs">
									<span class="h-1 w-1 rounded-full bg-white"></span>
								</div>
							</div>
							<span
								class={`max-w-[62px] truncate text-[11px] transition-colors ${
									activeContactId === friend.id
										? 'font-bold text-blue-600 dark:text-blue-400'
										: 'font-medium text-slate-600 group-hover:text-blue-600 dark:text-slate-300 dark:group-hover:text-blue-400'
								}`}
							>
								{friend.fullName ? friend.fullName.split(' ')[0] : friend.username}
							</span>
						</button>
					{/each}
				</div>
			</div>
		{/if}

		<!-- Search Bar with Floating Glass Style -->
		<div class="p-3">
			<div class="relative flex items-center rounded-2xl bg-slate-100/80 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60 shadow-xs transition-all duration-200 focus-within:bg-white dark:focus-within:bg-slate-800 focus-within:border-blue-500/60 focus-within:ring-4 focus-within:ring-blue-500/10">
				<svg
					class="ml-3.5 h-4 w-4 text-slate-400 shrink-0"
					fill="none"
					viewBox="0 0 24 24"
					stroke="currentColor"
				>
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
				</svg>
				<input
					bind:value={search}
					aria-label="Cari obrolan atau teman"
					placeholder="Cari obrolan atau teman..."
					class="w-full bg-transparent py-2.5 pl-2.5 pr-8 text-sm outline-none text-slate-800 dark:text-white placeholder:text-slate-400"
				/>
				{#if search.trim()}
					<button
						type="button"
						onclick={() => (search = '')}
						class="mr-2.5 rounded-full p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
						aria-label="Hapus pencarian"
					>
						<svg class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
						</svg>
					</button>
				{/if}
			</div>
		</div>

		<!-- List Percakapan / Kontak -->
		<div class="flex-1 overflow-y-auto px-2 py-1 scrollbar-thin">
			{#if isLoadingContacts}
				<div class="flex flex-col items-center justify-center py-12 text-slate-400">
					<div class="h-6 w-6 animate-spin rounded-full border-2 border-blue-500 border-t-transparent mb-2.5"></div>
					<p class="text-xs font-medium">Memuat percakapan...</p>
				</div>
			{:else}
				<!-- Tab 'friends': Show direct friend list to chat -->
				{#if activeFilter === 'friends'}
					<div class="space-y-1 py-1">
						{#if friends.length === 0}
							<div class="px-4 py-10 text-center text-slate-400">
								<p class="text-sm font-semibold">Belum ada teman terhubung</p>
								<p class="mt-1 text-xs">Cari dan tambahkan teman di halaman Teman.</p>
							</div>
						{:else}
							{#each friends as friend (friend.id)}
								<button
									type="button"
									onclick={() => selectContact(friend.id)}
									class={`group flex w-full items-center gap-3.5 rounded-2xl p-3 text-left transition-all duration-200 ${
										activeContactId === friend.id
											? 'bg-gradient-to-r from-blue-500/10 via-indigo-500/10 to-transparent border border-blue-500/30 dark:from-blue-500/20 dark:to-transparent'
											: 'hover:bg-slate-100/70 dark:hover:bg-slate-800/60'
									}`}
								>
									<div class="relative shrink-0">
										<div class="h-11 w-11 overflow-hidden rounded-full shadow-sm ring-2 ring-slate-100 dark:ring-slate-800">
											{#if friend.profilePictureUrl}
												<img src={friend.profilePictureUrl} alt={friend.fullName} class="h-full w-full object-cover" />
											{:else}
												<div
													class={`flex h-full w-full items-center justify-center bg-gradient-to-tr ${getAvatarGradient(friend.fullName)} text-xs font-black tracking-wider text-white`}
												>
													{getInitials(friend.fullName || friend.username)}
												</div>
											{/if}
										</div>
										<span class="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-slate-900"></span>
									</div>
									<div class="min-w-0 flex-1">
										<p class="truncate text-sm font-bold text-slate-800 group-hover:text-blue-600 dark:text-white dark:group-hover:text-blue-400">
											{friend.fullName}
										</p>
										<p class="truncate text-xs text-slate-400">@{friend.username}</p>
									</div>
									<span class="rounded-xl bg-blue-500/10 px-2.5 py-1 text-xs font-bold text-blue-600 transition-colors group-hover:bg-blue-600 group-hover:text-white dark:bg-blue-400/15 dark:text-blue-400">
										Chat
									</span>
								</button>
							{/each}
						{/if}
					</div>

				<!-- Tab 'unread' or 'all': Show conversation list -->
				{:else}
					<!-- Search matched friends section -->
					{#if searchMatchedFriends.length > 0}
						<div class="px-3 pt-2 pb-1 text-[11px] font-bold uppercase tracking-wider text-slate-400">
							Teman Baru
						</div>
						{#each searchMatchedFriends as friend (friend.id)}
							<button
								type="button"
								onclick={() => selectContact(friend.id)}
								class="group flex w-full items-center gap-3.5 rounded-2xl p-3 text-left transition-all duration-200 hover:bg-slate-100/70 dark:hover:bg-slate-800/60"
							>
								<div class="h-11 w-11 shrink-0 overflow-hidden rounded-full shadow-sm">
									{#if friend.profilePictureUrl}
										<img src={friend.profilePictureUrl} alt={friend.fullName} class="h-full w-full object-cover" />
									{:else}
										<div
											class={`flex h-full w-full items-center justify-center bg-gradient-to-tr ${getAvatarGradient(friend.fullName)} text-xs font-black tracking-wider text-white`}
										>
											{getInitials(friend.fullName || friend.username)}
										</div>
									{/if}
								</div>
								<div class="min-w-0 flex-1">
									<p class="truncate text-sm font-bold text-slate-800 dark:text-white">{friend.fullName}</p>
									<p class="truncate text-xs text-slate-400">@{friend.username}</p>
								</div>
								<span class="rounded-xl bg-blue-500/10 px-2.5 py-1 text-xs font-bold text-blue-600 dark:bg-blue-400/15 dark:text-blue-400">
									Mulai Chat
								</span>
							</button>
						{/each}
					{/if}

					<!-- Conversation items list -->
					{#if filteredContacts.length > 0}
						{#if searchMatchedFriends.length > 0}
							<div class="px-3 pt-3 pb-1 text-[11px] font-bold uppercase tracking-wider text-slate-400">
								Obrolan
							</div>
						{/if}

						<div class="space-y-1">
							{#each filteredContacts as contact (contact.userId)}
								<button
									type="button"
									onclick={() => selectContact(contact.userId)}
									class={`group relative flex w-full items-center gap-3.5 rounded-2xl p-3 text-left transition-all duration-200 ${
										activeContactId === contact.userId
											? 'bg-gradient-to-r from-blue-500/10 via-indigo-500/10 to-transparent border border-blue-500/30 dark:from-blue-500/20 dark:via-indigo-500/20 dark:to-transparent dark:border-blue-500/40 shadow-xs'
											: 'hover:bg-slate-100/70 dark:hover:bg-slate-800/60'
									}`}
								>
									{#if activeContactId === contact.userId}
										<div class="absolute left-1.5 top-3 bottom-3 w-1 rounded-full bg-blue-600 dark:bg-blue-400"></div>
									{/if}

									<!-- Avatar -->
									<div class="relative shrink-0">
										<div class="h-12 w-12 overflow-hidden rounded-full shadow-sm ring-2 ring-slate-100 dark:ring-slate-800">
											{#if contact.avatarUrl}
												<img src={contact.avatarUrl} alt={contact.fullName} class="h-full w-full object-cover" />
											{:else}
												<div
													class={`flex h-full w-full items-center justify-center bg-gradient-to-tr ${getAvatarGradient(contact.fullName)} text-xs font-black tracking-wider text-white shadow-inner`}
												>
													{getInitials(contact.fullName || contact.username)}
												</div>
											{/if}
										</div>
										{#if contact.unreadCount > 0}
											<span class="absolute -top-0.5 -right-0.5 h-3.5 w-3.5 rounded-full bg-blue-600 ring-2 ring-white dark:ring-slate-900"></span>
										{/if}
									</div>

									<!-- Message text & details -->
									<div class="min-w-0 flex-1">
										<div class="flex items-center justify-between gap-1 mb-0.5">
											<b class={`truncate text-sm ${activeContactId === contact.userId ? 'text-blue-600 dark:text-blue-400' : 'text-slate-800 dark:text-slate-100'}`}>
												{contact.fullName}
											</b>
											<small class={`shrink-0 text-[11px] font-semibold ${contact.unreadCount ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'}`}>
												{formatMessageDate(contact.lastMessageAt)}
											</small>
										</div>
										<div class="flex items-center justify-between gap-2">
											<p class={`truncate text-xs ${contact.unreadCount ? 'font-bold text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400'}`}>
												{contact.lastMessage ?? 'Memulai percakapan baru'}
											</p>
											{#if contact.unreadCount > 0}
												<span class="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 px-1.5 text-[10px] font-black text-white shadow-xs shadow-blue-500/30 shrink-0">
													{contact.unreadCount > 99 ? '99+' : contact.unreadCount}
												</span>
											{/if}
										</div>
									</div>
								</button>
							{/each}
						</div>

						<!-- Section Teman Lainnya (Ketika ada sisa teman yang belum pernah diajak chat) -->
						{#if !search.trim() && activeFilter === 'all' && uncontactedFriends.length > 0}
							<div class="pt-5 pb-2">
								<div class="flex items-center gap-2 px-3 mb-2">
									<div class="h-px flex-1 bg-slate-200/60 dark:bg-slate-800/60"></div>
									<span class="text-[10px] font-black uppercase tracking-wider text-slate-400">
										Mulai Obrolan Baru
									</span>
									<div class="h-px flex-1 bg-slate-200/60 dark:bg-slate-800/60"></div>
								</div>
								<div class="space-y-1">
									{#each uncontactedFriends as friend (friend.id)}
										<button
											type="button"
											onclick={() => selectContact(friend.id)}
											class="group flex w-full items-center gap-3 rounded-2xl p-2.5 text-left transition-all duration-200 hover:bg-slate-100/70 dark:hover:bg-slate-800/60"
										>
											<div class="h-9 w-9 shrink-0 overflow-hidden rounded-full shadow-xs">
												{#if friend.profilePictureUrl}
													<img src={friend.profilePictureUrl} alt={friend.fullName} class="h-full w-full object-cover" />
												{:else}
													<div class={`flex h-full w-full items-center justify-center bg-gradient-to-tr ${getAvatarGradient(friend.fullName)} text-[11px] font-black tracking-wider text-white`}>
														{getInitials(friend.fullName || friend.username)}
													</div>
												{/if}
											</div>
											<div class="min-w-0 flex-1">
												<p class="truncate text-xs font-bold text-slate-700 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-blue-400">
													{friend.fullName}
												</p>
												<p class="truncate text-[10px] text-slate-400">@{friend.username}</p>
											</div>
											<span class="rounded-lg bg-blue-500/10 px-2 py-0.5 text-[11px] font-bold text-blue-600 dark:bg-blue-400/15 dark:text-blue-400">
												Sapa 👋
											</span>
										</button>
									{/each}
								</div>
							</div>
						{/if}

					{:else if search.trim() && searchMatchedFriends.length === 0}
						<div class="py-12 px-4 text-center text-slate-400">
							<svg class="mx-auto h-8 w-8 text-slate-300 dark:text-slate-600 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
							</svg>
							<p class="text-xs font-medium">Tidak ada percakapan atau teman yang cocok dengan "{search}".</p>
						</div>

					{:else if activeFilter === 'unread'}
						<div class="py-12 px-4 text-center text-slate-400">
							<div class="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400">
								<svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
								</svg>
							</div>
							<p class="text-sm font-bold text-slate-800 dark:text-slate-200">Semua pesan sudah dibaca</p>
							<p class="mt-1 text-xs text-slate-400">Tidak ada pesan yang belum dibaca saat ini.</p>
						</div>

					{:else if !search.trim()}
						<!-- Empty State: Belum ada obrolan sama sekali -->
						<div class="p-4 text-center">
							<div class="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-3xl bg-blue-500/10 text-blue-600 dark:bg-blue-400/15 dark:text-blue-400 shadow-inner">
								<svg class="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="1.8"
										d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
									/>
								</svg>
							</div>
							<p class="text-sm font-bold text-slate-800 dark:text-slate-100">Belum ada obrolan</p>
							<p class="mt-1 mb-4 text-xs text-slate-500 dark:text-slate-400">
								Pilih teman di bawah untuk memulai percakapan baru.
							</p>

							{#if friends.length > 0}
								<div class="space-y-1.5 text-left">
									{#each friends as friend (friend.id)}
										<button
											type="button"
											onclick={() => selectContact(friend.id)}
											class="group flex w-full items-center gap-3 rounded-2xl border border-slate-100/80 bg-white/70 p-2.5 transition-all hover:border-blue-300 hover:bg-blue-50/50 hover:shadow-xs dark:border-slate-800/80 dark:bg-slate-800/40 dark:hover:border-blue-700/50"
										>
											<div class="h-10 w-10 flex-shrink-0 overflow-hidden rounded-full shadow-xs">
												{#if friend.profilePictureUrl}
													<img src={friend.profilePictureUrl} alt={friend.fullName} class="h-full w-full object-cover" />
												{:else}
													<div
														class={`flex h-full w-full items-center justify-center bg-gradient-to-tr ${getAvatarGradient(friend.fullName)} text-xs font-black tracking-wider text-white`}
													>
														{getInitials(friend.fullName || friend.username)}
													</div>
												{/if}
											</div>
											<div class="min-w-0 flex-1">
												<p class="truncate text-xs font-bold text-slate-800 transition-colors group-hover:text-blue-600 dark:text-white dark:group-hover:text-blue-400">
													{friend.fullName}
												</p>
												<p class="truncate text-[11px] text-slate-400">@{friend.username}</p>
											</div>
											<span class="rounded-xl bg-blue-500/10 px-2.5 py-1 text-xs font-bold text-blue-600 transition-colors group-hover:bg-blue-600 group-hover:text-white dark:bg-blue-400/15 dark:text-blue-400">
												Chat
											</span>
										</button>
									{/each}
								</div>
							{:else}
								<div class="rounded-2xl bg-slate-50 p-4 text-xs text-slate-500 dark:bg-slate-800/50 dark:text-slate-400">
									Anda belum memiliki teman. Kunjungi halaman
									<a href={resolve('/user/friends')} class="font-bold text-blue-600 hover:underline dark:text-blue-400">
										Teman
									</a>
									untuk terhubung dengan pengguna lain.
								</div>
							{/if}
						</div>
					{/if}
				{/if}
			{/if}
		</div>

		<!-- Footer Security Note -->
		<div class="border-t border-slate-100 dark:border-slate-800/60 px-4 py-2.5 text-center">
			<p class="flex items-center justify-center gap-1.5 text-[10px] font-semibold text-slate-400">
				<svg class="h-3 w-3 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
					<path fill-rule="evenodd" d="M10 1.944A11.954 11.954 0 012.166 5C2.056 5.649 2 6.319 2 7c0 5.225 3.34 9.67 8 11.317C14.66 16.67 18 12.225 18 7c0-.682-.057-1.35-.166-2.001A11.954 11.954 0 0110 1.944zM11 14a1 1 0 11-2 0 1 1 0 012 0zm0-7a1 1 0 10-2 0v3a1 1 0 102 0V7z" clip-rule="evenodd" />
				</svg>
				Pesan terenkripsi secara aman
			</p>
		</div>
	</aside>

	<!-- Main Chat Area -->
	<section
		class={`${!showChatList ? 'flex' : 'hidden'} min-w-0 flex-1 flex-col bg-slate-50/50 dark:bg-slate-950/40 md:flex transition-all`}
	>
		{#if activeContact}
			<!-- Chat Header -->
			<header
				class="flex h-16 items-center justify-between border-b border-slate-200/70 bg-white/90 px-4 backdrop-blur-xl dark:border-slate-800/70 dark:bg-slate-900/90"
			>
				<div class="flex items-center gap-3 min-w-0">
					<!-- Mobile Back Button -->
					<button
						type="button"
						class="rounded-xl p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-800 md:hidden dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
						onclick={() => {
							showChatList = true;
							activeContactId = null;
						}}
						aria-label="Kembali ke daftar pesan"
					>
						<svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M15 19l-7-7 7-7" />
						</svg>
					</button>

					<!-- Contact Avatar -->
					<div class="relative shrink-0">
						<div class="h-10 w-10 overflow-hidden rounded-full shadow-sm ring-2 ring-slate-100 dark:ring-slate-800">
							{#if activeContact.avatarUrl}
								<img src={activeContact.avatarUrl} alt={activeContact.fullName} class="h-full w-full object-cover" />
							{:else}
								<div
									class={`flex h-full w-full items-center justify-center bg-gradient-to-tr ${getAvatarGradient(activeContact.fullName)} text-xs font-black tracking-wider text-white`}
								>
									{getInitials(activeContact.fullName || activeContact.username)}
								</div>
							{/if}
						</div>
						<span class="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-slate-900"></span>
					</div>

					<div class="min-w-0">
						<b class="truncate block text-sm font-bold text-slate-900 dark:text-white leading-tight">
							{activeContact.fullName}
						</b>
						<p class="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
							<span class="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
							Aktif sekarang
						</p>
					</div>
				</div>

				<!-- Actions: View Profile -->
				<div class="flex items-center gap-1">
					<a
						href={resolve('/user/profile/[username]', { username: activeContact.username })}
						class="flex items-center gap-1.5 rounded-xl border border-slate-200/80 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 shadow-xs transition-all hover:border-blue-400 hover:text-blue-600 hover:shadow-sm dark:border-slate-700/80 dark:bg-slate-800 dark:text-slate-200 dark:hover:border-blue-500 dark:hover:text-blue-400"
						title="Lihat Profil"
					>
						<svg class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
						</svg>
						<span class="hidden sm:inline">Profil</span>
					</a>
				</div>
			</header>

			{#if errorText}
				<div role="alert" class="border-b border-rose-200 bg-rose-50 px-4 py-2 text-center text-xs font-semibold text-rose-600 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-400">
					{errorText}
				</div>
			{/if}

			<!-- Messages Stream / Log -->
			<div
				bind:this={messagesContainer}
				class="flex-1 space-y-3.5 overflow-y-auto p-4 sm:p-6 bg-gradient-to-b from-slate-50/40 via-white/30 to-slate-50/40 dark:from-slate-950/30 dark:via-slate-900/30 dark:to-slate-950/30"
			>
				{#if isLoadingMessages}
					<div class="flex flex-col items-center justify-center py-16 text-slate-400">
						<div class="h-7 w-7 animate-spin rounded-full border-2 border-blue-500 border-t-transparent mb-2.5"></div>
						<p class="text-xs font-medium">Memuat percakapan...</p>
					</div>
				{:else if messages.length === 0}
					<div class="flex flex-col items-center justify-center py-16 text-center text-slate-400 max-w-sm mx-auto" in:fade>
						<div class="mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-blue-500/10 text-blue-600 dark:bg-blue-400/15 dark:text-blue-400 shadow-inner">
							<svg class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="1.8"
									d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
								/>
							</svg>
						</div>
						<p class="text-base font-extrabold text-slate-800 dark:text-slate-100">
							Mulai obrolan dengan {activeContact.fullName}
						</p>
						<p class="mt-1 text-xs text-slate-400 leading-relaxed">
							Kirim pesan pertama atau pilih sapaan cepat di bawah ini untuk memulai obrolan.
						</p>

						<!-- Quick Greeting Buttons -->
						<div class="mt-5 flex flex-wrap justify-center gap-2">
							{#each quickGreetings as greeting (greeting)}
								<button
									type="button"
									onclick={() => (newMessage = greeting)}
									class="rounded-xl border border-slate-200/80 bg-white/80 px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-xs transition-all hover:border-blue-400 hover:bg-blue-50/50 hover:text-blue-600 active:scale-95 dark:border-slate-800 dark:bg-slate-800/80 dark:text-slate-300 dark:hover:border-blue-500 dark:hover:text-blue-400"
								>
									{greeting}
								</button>
							{/each}
						</div>
					</div>
				{:else}
					{#each messages as message, idx (message.id)}
						<!-- Date Separator if previous message was on another day -->
						{#if idx === 0 || isDifferentDay(messages[idx - 1].createdAt, message.createdAt)}
							<div class="flex items-center justify-center my-4">
								<span class="rounded-full bg-slate-200/60 dark:bg-slate-800/60 px-3 py-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 shadow-xs">
									{formatChatSeparatorDate(message.createdAt)}
								</span>
							</div>
						{/if}

						<div class={`flex ${message.isMine ? 'justify-end' : 'justify-start'}`} transition:slide={{ duration: 150 }}>
							<div
								class={`group relative max-w-[80%] sm:max-w-[70%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed transition-all shadow-xs ${
									message.isMine
										? 'rounded-tr-xs bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-blue-500/20'
										: 'rounded-tl-xs bg-white text-slate-800 border border-slate-200/70 dark:border-slate-700/60 dark:bg-slate-800 dark:text-slate-100'
								}`}
							>
								<p class="whitespace-pre-wrap break-words">{message.text}</p>
								<div class="mt-1 flex items-center justify-end gap-1">
									<small
										class={`text-[10px] font-semibold ${
											message.isMine ? 'text-blue-100/90' : 'text-slate-400'
										}`}
									>
										{formatTime(message.createdAt)}
									</small>
									{#if message.isMine}
										<!-- Sent / Read checkmarks -->
										<svg class="h-3.5 w-3.5 text-blue-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
											<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
										</svg>
									{/if}
								</div>
							</div>
						</div>
					{/each}
				{/if}
			</div>

			<!-- Message Input Form -->
			<form
				class="border-t border-slate-200/70 bg-white/90 p-3.5 backdrop-blur-xl dark:border-slate-800/70 dark:bg-slate-900/90"
				onsubmit={(event) => {
					event.preventDefault();
					void sendMessage();
				}}
			>
				<div class="flex items-center gap-2 rounded-2xl bg-slate-100/90 dark:bg-slate-800/90 border border-slate-200/60 dark:border-slate-700/60 p-1.5 focus-within:bg-white dark:focus-within:bg-slate-800 focus-within:border-blue-500/50 focus-within:ring-4 focus-within:ring-blue-500/10 transition-all shadow-inner">
					<input
						bind:value={newMessage}
						maxlength="1000"
						autocomplete="off"
						aria-label="Ketik pesan"
						placeholder={`Ketik pesan untuk ${activeContact.fullName}...`}
						class="min-w-0 flex-1 bg-transparent px-3 py-1.5 text-sm text-slate-800 outline-none placeholder:text-slate-400 dark:text-white"
					/>
					<button
						type="submit"
						disabled={!newMessage.trim() || isSending}
						class="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-md shadow-blue-500/25 transition-all hover:from-blue-700 hover:to-indigo-700 hover:scale-105 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100"
					>
						{#if isSending}
							<div class="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
						{:else}
							<span>Kirim</span>
							<svg class="h-3.5 w-3.5 rotate-45" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
							</svg>
						{/if}
					</button>
				</div>
			</form>
		{:else}
			<!-- Desktop Empty State when no conversation selected -->
			<div class="flex flex-1 flex-col items-center justify-center p-8 text-center" in:fade>
				<div class="relative mb-5">
					<div class="flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-tr from-blue-500/20 to-indigo-500/20 text-blue-600 shadow-xl shadow-blue-500/10 dark:from-blue-500/30 dark:to-indigo-500/30 dark:text-blue-400">
						<svg class="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="1.8"
								d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
							/>
						</svg>
					</div>
					<div class="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 ring-4 ring-white dark:ring-slate-900 shadow-xs">
						<span class="h-2 w-2 rounded-full bg-white"></span>
					</div>
				</div>
				<h2 class="text-xl font-black text-slate-800 dark:text-white tracking-tight">Pesan K-Social</h2>
				<p class="mt-1.5 max-w-sm text-xs text-slate-400 leading-relaxed">
					Pilih salah satu teman atau percakapan di sebelah kiri untuk mulai berkirim pesan secara instan dan aman.
				</p>

				{#if friends.length > 0}
					<div class="mt-6 flex flex-wrap justify-center gap-2 max-w-md">
						{#each friends.slice(0, 4) as friend (friend.id)}
							<button
								type="button"
								onclick={() => selectContact(friend.id)}
								class="flex items-center gap-2 rounded-2xl border border-slate-200/80 bg-white/80 px-3 py-1.5 shadow-xs transition-all hover:border-blue-400 hover:bg-blue-50/50 hover:scale-105 active:scale-95 dark:border-slate-800 dark:bg-slate-800/80 dark:hover:border-blue-500"
							>
								<div class="h-6 w-6 overflow-hidden rounded-full">
									{#if friend.profilePictureUrl}
										<img src={friend.profilePictureUrl} alt={friend.fullName} class="h-full w-full object-cover" />
									{:else}
										<div class={`flex h-full w-full items-center justify-center bg-gradient-to-tr ${getAvatarGradient(friend.fullName)} text-[9px] font-black text-white`}>
											{getInitials(friend.fullName || friend.username)}
										</div>
									{/if}
								</div>
								<span class="text-xs font-bold text-slate-700 dark:text-slate-200">
									{friend.fullName ? friend.fullName.split(' ')[0] : friend.username}
								</span>
							</button>
						{/each}
					</div>
				{/if}
			</div>
		{/if}
	</section>
</div>
