<script lang="ts">
	import { onMount } from 'svelte';

	import { Search, SquareX } from 'lucide-svelte';

	import WindowNode from '$lib/components/nodes/Window.svelte';
	import BookmarksNode from '$lib/components/nodes/Bookmarks.svelte';

	import { getWindows, getBookmarks } from '$lib/core/chrome';
	import type { Window, BookmarksRoot } from '$lib/core/types';

	let windows = $state<Window[]>([]);
	let bookmarks = $state<BookmarksRoot | null>(null);
	let loading = $state(true);
	let error = $state<string | null>(null);

	let searchQuery = $state('');
	let searchInput = $state<HTMLInputElement | null>(null);

	onMount(async () => {
		setTimeout(async () => {
			try {
				// Set loading to false
				loading = false;
				// Get all windows and bookmarks
				[windows, bookmarks] = await Promise.all([getWindows(), getBookmarks()]);
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
				<span>Loading tabs...</span>
			</div>
		{:else if error}
			<div class="empty">
				<SquareX class="icon" size={48} />
				<span>Failed to load tabs</span>
				<small>{error}</small>
			</div>
		{:else if windows.length === 0}
			<div class="empty">
				<SquareX class="icon" size={48} />
				<span>No windows found</span>
			</div>
		{:else}
			{#each windows as window, index (window.id)}
				<WindowNode {window} {index} query={searchQuery} />
			{/each}
			{#if bookmarks && bookmarks.items.length > 0}
				<BookmarksNode {bookmarks} query={searchQuery} />
			{/if}
		{/if}
	</div>

	<footer class="footer"></footer>
</div>

<style lang="less">
	.container {
		display: flex;
		flex-direction: column;
		width: var(--app-width);
		height: var(--app-height);
		overflow: hidden;
	}

	.header {
		height: 36px;
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--spacing-sm);
		padding: 0 var(--spacing-md);
		border-bottom: 1px solid var(--bg-tertiary);
		border-right: 4px solid var(--bg-tertiary);

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
		overflow-y: scroll;
		overflow-x: hidden;

		&::-webkit-scrollbar {
			width: 4px;
		}

		&::-webkit-scrollbar-track {
			background: transparent;
			border-left: 1px solid var(--bg-tertiary);
		}

		&::-webkit-scrollbar-thumb {
			background: var(--bg-tertiary);
			border-radius: 0;

			&:hover {
				background: var(--bg-hover);
			}
		}
	}

	.footer {
		height: 36px;
		display: flex;
		border-top: 1px solid var(--bg-tertiary);
		border-top: 1px solid var(--bg-tertiary);
		border-right: 4px solid var(--bg-tertiary);
		background: var(--bg-primary);
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

	@keyframes spin {
		to {
			transform: rotate(360deg);
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
</style>
