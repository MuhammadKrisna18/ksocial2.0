<script lang="ts">
	import { fade, slide } from 'svelte/transition';
	import { onMount, onDestroy } from 'svelte';
	
	let { data } = $props(); 
	let currentUserId = data.user?.sub || '';

	let contacts = $state<any[]>([]);
	let activeContactId = $state<string | null>(null);
	let messages = $state<any[]>([]);
	let newMessage = $state('');
	let showChatList = $state(true); 
	
	let eventSource: EventSource | null = null;
	let errorText = $state('');
	let messagesContainer: HTMLDivElement | null = $state(null);

	onMount(() => {
		fetchContacts();
		setupSSE();
	});

	onDestroy(() => {
		if (eventSource) {
			eventSource.close();
		}
	});

	async function fetchContacts() {
		const res = await fetch('/api/chat/contacts');
		if (res.ok) {
			const resData = await res.json();
			contacts = resData.contacts;
		}
	}

	function setupSSE() {
		eventSource = new EventSource('/api/chat/stream');
		eventSource.onmessage = (event) => {
			if (event.data === ':') return; // Ping
			const newMsg = JSON.parse(event.data);
			
			if (activeContactId && (
				(newMsg.senderId === activeContactId && newMsg.receiverId === currentUserId) || 
				(newMsg.senderId === currentUserId && newMsg.receiverId === activeContactId)
			)) {
				if (!messages.find(m => m.id === newMsg.id)) {
					messages = [...messages, {
						id: newMsg.id,
						senderId: newMsg.senderId,
						text: newMsg.content,
						timestamp: new Date(newMsg.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
						isMine: newMsg.senderId === currentUserId
					}];
					scrollToBottom();
				}
			}
			
			fetchContacts();
		};
	}

	async function selectContact(id: string) {
		activeContactId = id;
		showChatList = false;
		errorText = '';
		messages = []; 
		
		const res = await fetch(`/api/chat/${id}`);
		if (res.ok) {
			const resData = await res.json();
			messages = resData.messages.map((m: any) => ({
				id: m.id,
				senderId: m.senderId,
				text: m.content,
				timestamp: new Date(m.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
				isMine: m.senderId === currentUserId
			}));
			fetchContacts();
			scrollToBottom();
		}
	}

	function backToList() {
		showChatList = true;
		activeContactId = null;
		errorText = '';
	}

	function scrollToBottom() {
		setTimeout(() => {
			if (messagesContainer) {
				messagesContainer.scrollTop = messagesContainer.scrollHeight;
			}
		}, 50);
	}

	async function sendMessage() {
		if (newMessage.trim() === '' || !activeContactId) return;
		
		const text = newMessage.trim();
		newMessage = '';
		errorText = '';

		try {
			const res = await fetch(`/api/chat/${activeContactId}`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ content: text })
			});

			const resData = await res.json();

			if (!res.ok) {
				errorText = resData.error || 'Failed to send message';
				return;
			}
			
			if (!messages.find(m => m.id === resData.message.id)) {
				messages = [...messages, {
					id: resData.message.id,
					senderId: currentUserId,
					text: text,
					timestamp: new Date(resData.message.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
					isMine: true
				}];
				scrollToBottom();
			}
			fetchContacts();
		} catch(err) {
			errorText = "Connection error";
		}
	}

	let activeContact = $derived(contacts.find(c => c.userId === activeContactId));
</script>

<svelte:head>
	<title>Messages | K-Social</title>
</svelte:head>

<div class="h-full max-h-[calc(100vh-4rem)] flex overflow-hidden bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm m-4 rounded-3xl border border-slate-200/60 dark:border-slate-800/60 shadow-xl">
	
	<!-- Left Pane: Chat List -->
	<div class="{showChatList ? 'flex' : 'hidden'} md:flex flex-col w-full md:w-80 lg:w-96 border-r border-slate-200/60 dark:border-slate-800/60 bg-white/80 dark:bg-slate-900/80">
		<!-- Header -->
		<div class="p-4 border-b border-slate-200/60 dark:border-slate-800/60 flex items-center justify-between sticky top-0 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md z-10">
			<h1 class="text-xl font-extrabold text-slate-800 dark:text-slate-100">Messages</h1>
			<button class="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-colors">
				<svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
				</svg>
			</button>
		</div>

		<!-- Search Contacts -->
		<div class="p-4">
			<div class="relative">
				<div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
					<svg class="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
					</svg>
				</div>
				<input type="text" placeholder="Search messages..." class="block w-full pl-10 pr-3 py-2 border-none rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-500 focus:ring-2 focus:ring-blue-500 transition-all text-sm">
			</div>
		</div>

		<!-- Contact List -->
		<div class="flex-1 overflow-y-auto">
			{#if contacts.length === 0}
				<div class="p-4 text-center text-slate-500 text-sm mt-10">Belum ada obrolan.</div>
			{/if}
			{#each contacts as contact}
				<button 
					class="w-full flex items-center gap-3 p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors border-b border-slate-100/50 dark:border-slate-800/50 text-left {activeContactId === contact.userId ? 'bg-blue-50/50 dark:bg-blue-900/20' : ''}"
					onclick={() => selectContact(contact.userId)}
				>
					<div class="relative">
						{#if contact.avatarUrl}
							<img src={contact.avatarUrl} alt={contact.fullName} class="w-12 h-12 rounded-full object-cover">
						{:else}
							<div class="w-12 h-12 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-500 flex items-center justify-center text-white font-bold text-lg">
								{contact.fullName.charAt(0)}
							</div>
						{/if}
					</div>
					
					<div class="flex-1 min-w-0">
						<div class="flex justify-between items-baseline mb-0.5">
							<h3 class="text-sm font-bold text-slate-900 dark:text-slate-100 truncate">{contact.fullName}</h3>
							<span class="text-xs text-slate-500 dark:text-slate-400 ml-2 shrink-0">
								{#if contact.lastMessageAt}
									{new Date(contact.lastMessageAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
								{/if}
							</span>
						</div>
						<p class="text-xs text-slate-500 dark:text-slate-400 truncate {contact.unreadCount > 0 ? 'font-semibold text-slate-900 dark:text-slate-200' : ''}">{contact.lastMessage || 'Sent an attachment'}</p>
					</div>
					
					{#if contact.unreadCount > 0}
						<div class="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center shrink-0">
							<span class="text-[10px] font-bold text-white">{contact.unreadCount}</span>
						</div>
					{/if}
				</button>
			{/each}
		</div>
	</div>

	<!-- Right Pane: Chat Window -->
	<div class="{!showChatList ? 'flex' : 'hidden'} md:flex flex-1 flex-col bg-slate-50/30 dark:bg-slate-950/30 relative">
		{#if activeContact}
			<!-- Chat Header -->
			<div class="h-16 shrink-0 p-4 border-b border-slate-200/60 dark:border-slate-800/60 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md flex items-center justify-between sticky top-0 z-10">
				<div class="flex items-center gap-3">
					<button class="md:hidden p-2 -ml-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500" onclick={backToList}>
						<svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
						</svg>
					</button>
					<div class="relative">
						{#if activeContact.avatarUrl}
							<img src={activeContact.avatarUrl} alt={activeContact.fullName} class="w-10 h-10 rounded-full object-cover">
						{:else}
							<div class="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-500 flex items-center justify-center text-white font-bold text-sm">
								{activeContact.fullName.charAt(0)}
							</div>
						{/if}
					</div>
					<div>
						<h2 class="text-sm font-bold text-slate-900 dark:text-slate-100">{activeContact.fullName}</h2>
						<p class="text-xs text-slate-500 dark:text-slate-400">@{activeContact.username}</p>
					</div>
				</div>
			</div>

			{#if errorText}
				<div class="bg-red-50 text-red-600 px-4 py-2 text-sm text-center font-medium border-b border-red-100">
					{errorText}
				</div>
			{/if}

			<!-- Messages Area -->
			<div class="flex-1 overflow-y-auto p-4 space-y-4" bind:this={messagesContainer}>
				{#if messages.length === 0}
					<div class="text-center my-4">
						<span class="text-xs font-semibold text-slate-400 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full">Kirim pesan pertama Anda</span>
					</div>
				{/if}
				
				{#each messages as msg}
					<div class="flex {msg.isMine ? 'justify-end' : 'justify-start'}" transition:slide>
						<div class="max-w-[75%] sm:max-w-[65%] flex flex-col {msg.isMine ? 'items-end' : 'items-start'}">
							<div class="px-4 py-2.5 rounded-2xl shadow-sm text-sm {msg.isMine ? 'bg-blue-600 text-white rounded-tr-sm' : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-100 dark:border-slate-700 rounded-tl-sm'}">
								{msg.text}
							</div>
							<span class="text-[10px] text-slate-400 mt-1 mx-1">{msg.timestamp}</span>
						</div>
					</div>
				{/each}
			</div>

			<!-- Input Area -->
			<div class="p-3 sm:p-4 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-t border-slate-200/60 dark:border-slate-800/60 sticky bottom-0">
				<form onsubmit={(e) => { e.preventDefault(); sendMessage(); }} class="flex items-end gap-2">
					<button type="button" class="p-2 text-slate-400 hover:text-blue-500 transition-colors shrink-0">
						<svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
						</svg>
					</button>
					<div class="flex-1 bg-slate-100 dark:bg-slate-800 rounded-3xl flex items-center px-4 py-1 border border-transparent focus-within:border-blue-500/30 transition-colors">
						<input 
							type="text" 
							placeholder="Type a message..." 
							bind:value={newMessage}
							class="w-full bg-transparent border-none focus:ring-0 text-sm text-slate-800 dark:text-slate-200 py-2 placeholder-slate-500"
						>
						<button type="button" class="p-1.5 text-slate-400 hover:text-blue-500 transition-colors shrink-0">
							<svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
							</svg>
						</button>
					</div>
					<button 
						type="submit" 
						disabled={newMessage.trim() === ''}
						class="w-10 h-10 shrink-0 bg-blue-600 text-white rounded-full flex items-center justify-center hover:bg-blue-700 disabled:opacity-50 disabled:hover:bg-blue-600 transition-all shadow-md shadow-blue-500/20"
					>
						<svg class="w-4 h-4 ml-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
						</svg>
					</button>
				</form>
			</div>
		{:else}
			<!-- Empty State -->
			<div class="flex-1 flex flex-col items-center justify-center text-slate-500 dark:text-slate-400 p-8 text-center">
				<div class="w-24 h-24 bg-blue-50 dark:bg-slate-800 rounded-full flex items-center justify-center mb-6 shadow-inner">
					<svg class="w-10 h-10 text-blue-300 dark:text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
					</svg>
				</div>
				<h2 class="text-xl font-bold text-slate-700 dark:text-slate-300 mb-2">Your Messages</h2>
				<p class="text-sm max-w-sm">Select a conversation from the list to start chatting with your friends.</p>
			</div>
		{/if}
	</div>
</div>
