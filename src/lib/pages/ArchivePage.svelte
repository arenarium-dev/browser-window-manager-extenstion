<script lang="ts">
	import { onMount } from 'svelte';

	import Icon from '$lib/components/icon/Icon.svelte';
	import WindowGroupNode from '$lib/components/nodes/WindowGroup.svelte';
	import {
		bookmarkWindows,
		getBookmarkedWindows,
		getOpenedWindows,
		getSyncEnabled,
		openWindows,
		setSyncEnabled,
		syncWindows
	} from '$lib/core/chrome';
	import type { WindowGroup } from '$lib/core/types';

	interface Props {
		onClose: () => void;
	}

	let props: Props = $props();

	let loading = $state(true);
	let error = $state<string | null>(null);
	let windowsBookmarked = $state<WindowGroup[] | null>(null);
	let windowsSyncEnabled = $state(false);

	let searchQuery = $state('');
	let searchInput = $state<HTMLInputElement | null>(null);

	onMount(async () => {
		setTimeout(async () => {
			try {
				windowsBookmarked = await getBookmarkedWindows();
				windowsSyncEnabled = await getSyncEnabled();
				setTimeout(() => searchInput?.focus(), 0);
			} catch (e) {
				error = String(e);
			} finally {
				loading = false;
			}
		}, 0);
	});

	async function onOpen() {
		if (!windowsBookmarked) return;

		try {
			const lastWindowGroup = windowsBookmarked.at(-1);
			if (!lastWindowGroup) return;

			await openWindows(lastWindowGroup);
			props.onClose();
		} catch (e) {
			error = String(e);
		}
	}

	async function onSave() {
		try {
			const windowsOpened = await getOpenedWindows();
			if (!windowsOpened) return;

			await bookmarkWindows(windowsOpened);
			windowsBookmarked = await getBookmarkedWindows();
		} catch (e) {
			error = String(e);
		}
	}

	async function onSync() {
		try {
			await setSyncEnabled(!windowsSyncEnabled);
			windowsSyncEnabled = await getSyncEnabled();
			if (windowsSyncEnabled) await syncWindows();
		} catch (e) {
			error = String(e);
		}
	}
</script>

<header class="header">
	<div class="icon">
		<Icon name="search" size={16} />
	</div>
	<input bind:this={searchInput} bind:value={searchQuery} type="text" class="search" placeholder="Search..." />
	<div class="actions">
		<button class="button" onclick={onOpen} title="Open bookmarked windows">
			<Icon name="upload" size={16} />
		</button>
		<button class="button" onclick={onSave} title="Bookmark opened windows">
			<Icon name="download" size={16} />
		</button>
		<button class="button" onclick={onSync} class:enabled={windowsSyncEnabled} title="Sync opened to bookmarks periodically">
			<Icon name="refresh" size={16} />
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
			<Icon name="close" size={48} />
			<span>Failed to load tabs</span>
			<small>{error}</small>
		</div>
	{:else}
		{#key windowsBookmarked}
			{#each windowsBookmarked ?? [] as windowGroup}
				<WindowGroupNode group={windowGroup} title="Bookmarked" query={searchQuery} />
			{/each}
		{/key}
	{/if}
</div>

<style>
	.header {
		position: fixed;
		top: 0;
		left: 0;
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

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}
</style>
