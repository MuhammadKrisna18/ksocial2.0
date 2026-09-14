<script lang="ts">
	let { children } = $props();
</script>

<!-- Animated Gradient Background -->
<div class="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-50 px-4 sm:px-6 lg:px-8">
	<!-- Decorative Blobs -->
	<div class="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-primary-400/30 blur-[100px]"></div>
	<div class="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-blue-400/30 blur-[100px]"></div>
	<div class="absolute top-1/2 left-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-purple-400/20 blur-[120px]"></div>

	<!-- Glassmorphism Card -->
	<div class="relative z-10 w-full max-w-md">
		<div class="rounded-3xl border border-white/40 bg-white/60 p-8 shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] backdrop-blur-xl sm:p-10">
			{@render children()}
		</div>
		
		<!-- Optional Footer/Disclaimer outside the card -->
		<div class="mt-8 text-center text-xs text-slate-500">
			<p>&copy; {new Date().getFullYear()} K-Social. All rights reserved.</p>
		</div>
	</div>
</div>
