<script lang="ts">
	import { onDestroy, onMount, tick } from 'svelte';

	import { Search, SquareX, Download, Upload, RefreshCw } from 'lucide-svelte';

	import WindowGroupNode from '$lib/components/nodes/WindowGroup.svelte';

	import { Windows } from '$lib/core/chrome';
	import type { WindowGroup } from '$lib/core/types';

	let loading = $state(true);
	let error = $state<string | null>(null);

	let searchQuery = $state('');
	let searchInput = $state<HTMLInputElement | null>(null);

	let windowGroupOpened = $state<WindowGroup | null>(null);
	let windowGroupStored = $state<WindowGroup | null>(null);

	let hasStoredWindows = $derived(windowGroupStored !== null && windowGroupStored.windows.length > 0);

	async function onOpen() {
		// Check if there are stored windows
		if (!windowGroupStored || windowGroupStored.windows.length === 0) return;

		try {
			// Open the stored windows
			await Windows.Stored.open(windowGroupStored);
		} catch (e) {
			error = String(e);
		}
	}

	async function onSave() {
		// Check if there are opened windows
		if (!windowGroupOpened) return;

		try {
			// Save the opened windows
			await Windows.Stored.save(windowGroupOpened);
			// Refresh stored windows after saving
			windowGroupStored = await Windows.Stored.get();
		} catch (e) {
			error = String(e);
		}
	}

	function onSync() {
		// To be implemented later
		console.log('Sync functionality to be implemented');
	}

	onMount(async () => {
		setTimeout(async () => {
			try {
				// Set loading to false
				loading = false;

				// Get all windows and bookmarks
				windowGroupOpened = await Windows.Opened.get();
				windowGroupStored = await Windows.Stored.get();

				// Focus search input after load
				setTimeout(() => searchInput?.focus(), 0);

				// Subscribe to chrome events
				Windows.Opened.subscribe(async () => {
					windowGroupOpened = await Windows.Opened.get();
				});
			} catch (e) {
				// Set error
				error = String(e);
			} finally {
				// Set loading to false
				loading = false;
			}
		}, 0);
	});

	onDestroy(() => {
		// Unsubscribe from chrome events
		Windows.Opened.unsubscribe(async () => {
			windowGroupOpened = await Windows.Opened.get();
		});
	});
</script>

<div class="container">
	<header class="header">
		<div class="icon">
			<Search size={16} />
		</div>
		<input bind:this={searchInput} bind:value={searchQuery} type="text" class="search" placeholder="Search..." />
		<div class="actions">
			<button class="action-button" class:disabled={!hasStoredWindows} onclick={onOpen} title="Open stored windows" disabled={!hasStoredWindows}>
				<Upload size={16} />
			</button>
			<button class="action-button" onclick={onSave} title="Save current windows">
				<Download size={16} />
			</button>
			<button class="action-button" onclick={onSync} title="Sync periodically">
				<RefreshCw size={16} />
			</button>
		</div>
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
		{:else}
			{#key windowGroupOpened}
				{#if windowGroupOpened}
					<WindowGroupNode group={windowGroupOpened} title="Opened" query={searchQuery} />
				{/if}
			{/key}
			{#key windowGroupStored}
				{#if windowGroupStored}
					<WindowGroupNode group={windowGroupStored} title="Bookmarked" query={searchQuery} />
				{/if}
			{/key}
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
		position: fixed;
		height: 48px;
		width: 100%;
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--spacing-sm);
		padding: 0 var(--spacing-md);
		background-color: var(--bg-secondary);
		border-bottom: 2px solid var(--bg-tertiary);

		.icon {
			display: flex;
			color: var(--text-secondary);
			pointer-events: none;
		}

		.search {
			flex: 1;
			padding: var(--spacing-sm);
			background: var(--bg-secondary);
			border: none;
			color: var(--text-primary);
			font-family: inherit;
			outline: none;

			&::placeholder {
				color: var(--text-muted);
			}
		}

		.actions {
			display: flex;
			align-items: center;
			gap: var(--spacing-xs);
		}

		.action-button {
			display: flex;
			align-items: center;
			justify-content: center;
			width: 28px;
			height: 28px;
			border-radius: 50%;
			border: none;
			background: var(--bg-tertiary);
			color: var(--text-secondary);
			cursor: pointer;
			transition: all var(--transition-fast);
			padding: 0;

			&:hover:not(:disabled) {
				background: var(--bg-hover);
				color: var(--text-primary);
			}

			&:active:not(:disabled) {
				transform: scale(0.95);
			}

			&:disabled {
				opacity: 0.4;
				cursor: not-allowed;
			}
		}
	}

	.tree {
		height: 100%;
		margin: 48px 0px;
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
