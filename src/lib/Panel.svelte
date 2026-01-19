<script lang="ts">
	import { onDestroy, onMount } from 'svelte';

	import { Search, SquareX, Download, Upload, RefreshCw } from 'lucide-svelte';

	import WindowGroupNode from '$lib/components/nodes/WindowGroup.svelte';

	import {
		getOpenedWindows,
		getBookmarkedWindows,
		getSyncEnabled,
		setSyncEnabled,
		openWindows,
		bookmarkWindows,
		subscribeOpenedWindows,
		unsubscribeOpenedWindows,
		syncWindows
	} from '$lib/core/chrome';
	import type { WindowGroup } from '$lib/core/types';

	let loading = $state(true);
	let error = $state<string | null>(null);

	let searchQuery = $state('');
	let searchInput = $state<HTMLInputElement | null>(null);

	let windowsOpened = $state<WindowGroup | null>(null);
	let windowsBookmarked = $state<WindowGroup | null>(null);

	let windowsSyncEnabled = $state(false);

	onMount(async () => {
		setTimeout(async () => {
			try {
				// Set loading to false
				loading = false;

				// Get all windows and bookmarks
				windowsOpened = await getOpenedWindows();
				windowsBookmarked = await getBookmarkedWindows();

				console.log(chrome);

				// Load sync state
				windowsSyncEnabled = await getSyncEnabled();

				// Focus search input after load
				setTimeout(() => searchInput?.focus(), 0);

				// Subscribe to chrome events
				subscribeOpenedWindows(async () => {
					windowsOpened = await getOpenedWindows();
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
		unsubscribeOpenedWindows(async () => {
			windowsOpened = await getOpenedWindows();
		});
	});

	async function onOpen() {
		// Check if there are stored windows
		if (!windowsBookmarked) return;

		try {
			// Open the stored windows
			await openWindows(windowsBookmarked);
		} catch (e) {
			error = String(e);
		}
	}

	async function onSave() {
		// Check if there are opened windows
		if (!windowsOpened) return;

		try {
			// Save the opened windows
			await bookmarkWindows(windowsOpened);
			// Refresh stored windows after saving
			windowsBookmarked = await getBookmarkedWindows();
		} catch (e) {
			error = String(e);
		}
	}

	async function onSync() {
		try {
			// Toggle the sync enabled state
			await setSyncEnabled(!windowsSyncEnabled);
			// Get the new sync enabled state
			windowsSyncEnabled = await getSyncEnabled();

			// Sync the windows if sync is enabled
			if (windowsSyncEnabled) {
				console.log('Syncing windows');
				await syncWindows();
			}
		} catch (e) {
			error = String(e);
		}
	}
</script>

<div class="container">
	<header class="header">
		<div class="icon">
			<Search size={16} />
		</div>
		<input bind:this={searchInput} bind:value={searchQuery} type="text" class="search" placeholder="Search..." />
		<div class="actions">
			<button class="button" onclick={onOpen} title="Open stored windows">
				<Upload size={16} />
			</button>
			<button class="button" onclick={onSave} title="Save current windows">
				<Download size={16} />
			</button>
			<button class="button" onclick={onSync} class:enabled={windowsSyncEnabled} title="Sync periodically">
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
			{#key windowsOpened}
				{#if windowsOpened}
					<WindowGroupNode group={windowsOpened} title="Opened" query={searchQuery} />
				{/if}
			{/key}
			{#key windowsBookmarked}
				{#if windowsBookmarked}
					<WindowGroupNode group={windowsBookmarked} title="Bookmarked" query={searchQuery} />
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

			.button {
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

				&.enabled {
					background: var(--accent-blue);
					color: var(--bg-primary);

					&:hover {
						background: var(--accent-blue);
						opacity: 0.9;
					}
				}
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
		width: 100%;
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
