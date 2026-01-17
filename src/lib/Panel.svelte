<script lang="ts">
	import { onMount } from 'svelte';

	import { Search, SquareX } from 'lucide-svelte';

	import WindowGroupNode from '$lib/components/nodes/WindowGroup.svelte';

	import { getWindows } from '$lib/core/chrome';
	import type { WindowGroup } from '$lib/core/types';

	let loading = $state(true);
	let error = $state<string | null>(null);

	let searchQuery = $state('');
	let searchInput = $state<HTMLInputElement | null>(null);

	let windowGroupOpened = $state<WindowGroup | null>(null);
	let windowGroupStored = $state<WindowGroup | null>(null);

	onMount(async () => {
		setTimeout(async () => {
			try {
				// Set loading to false
				loading = false;
				// Get all windows and bookmarks
				windowGroupOpened = await getWindows();
				// Focus search input after load
				setTimeout(() => searchInput?.focus(), 0);
			} catch (e) {
				// Set error
				error = String(e);
			} finally {
				// Set loading to false
				loading = false;
			}
		}, 0);
	});
</script>

<div class="container">
	<header class="header">
		<div class="icon">
			<Search size={16} />
		</div>
		<input
			bind:this={searchInput}
			bind:value={searchQuery}
			type="text"
			class="search"
			placeholder="Search..."
		/>
	</header>

	<div class="tree">
		{#if loading}
			<div class="loading">
				<div class="spinner"></div>
				<span>Loading...</span>
			</div>
		{:else if error}
			<div class="empty">
				<SquareX class="icon" size={48} />
				<span>Failed to load tabs</span>
				<small>{error}</small>
			</div>
		{:else if windowGroupOpened}
			<WindowGroupNode group={windowGroupOpened} title="Opened" query={searchQuery} />
		{/if}
	</div>
</div>

<style lang="less">
	.container {
		display: flex;
		flex-direction: column;
		width: var(--app-width);
		height: var(--app-height);
	}

	.header {
		height: 36px;
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--spacing-sm);
		padding: 0 var(--spacing-md);
		border-bottom: 1px solid var(--bg-tertiary);

		.icon {
			display: flex;
			color: var(--text-secondary);
			pointer-events: none;
		}

		.search {
			width: 100%;
			padding: var(--spacing-sm);
			background: var(--bg-primary);
			border: none;
			color: var(--text-primary);
			font-family: inherit;
			outline: none;

			&::placeholder {
				color: var(--text-muted);
			}
		}
	}

	.tree {
		height: 100%;
		flex-grow: 1;
		display: flex;
		flex-direction: column;
		align-items: start;
		gap: var(--spacing-md);
		padding: var(--spacing-md);
	}

	.loading {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: var(--spacing-md);
		padding: var(--spacing-xl);
		color: var(--text-muted);
		height: 200px;

		.spinner {
			width: 32px;
			height: 32px;
			border: 3px solid var(--bg-tertiary);
			border-top-color: var(--accent-blue);
			border-radius: 50%;
			animation: spin 0.8s linear infinite;
		}
	}

	.empty {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: var(--spacing-xl);
		color: var(--text-muted);
		text-align: center;
		gap: var(--spacing-sm);
	}

	::-webkit-scrollbar {
		width: 4px;
	}

	::-webkit-scrollbar-track {
		background: transparent;
		border-left: 1px solid var(--bg-tertiary);
	}

	::-webkit-scrollbar-thumb {
		background: var(--bg-tertiary);
		border-radius: 0;

		&:hover {
			background: var(--bg-hover);
		}
	}

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}
</style>
