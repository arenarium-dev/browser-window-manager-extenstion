<script lang="ts">
	import { onMount } from 'svelte';

	import { Search, SquareX } from 'lucide-svelte';

	import WindowNode from '$lib/components/nodes/Window.svelte';

	import { getAllWindows } from './core/chrome';
	import type { WindowInfo } from './core/types';

	let windows = $state<WindowInfo[]>([]);
	let loading = $state(true);
	let error = $state<string | null>(null);
	let searchQuery = $state('');
	let searchInput = $state<HTMLInputElement | null>(null);

	// Computed stats
	let totalTabs = $derived(windows.reduce((sum, w) => sum + w.tabs.length, 0));
	let totalGroups = $derived(windows.reduce((sum, w) => sum + w.groups.size, 0));

	onMount(async () => {
		setTimeout(async () => {
			try {
				windows = await getAllWindows();
				loading = false;
				// Focus search input after load
				setTimeout(() => searchInput?.focus(), 0);
			} catch (e) {
				error = String(e);
				loading = false;
			}
		}, 0);
	});
</script>

<div class="container">
	<header class="header">
		<div class="icon">
			<Search size={14} />
		</div>
		<input
			bind:this={searchInput}
			bind:value={searchQuery}
			type="text"
			class="search"
			placeholder="Search..."
		/>
		<div class="stats">
			{#if !loading && !error}
				<span class="item">
					<span class="value">{windows.length}</span> windows
				</span>
				{#if totalGroups > 0}
					<span class="item">
						<span class="value">{totalGroups}</span> groups
					</span>
				{/if}
				<span class="item">
					<span class="value">{totalTabs}</span> tabs
				</span>
			{/if}
		</div>
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
			{#each windows as windowInfo, index (windowInfo.id)}
				<WindowNode {windowInfo} {index} {searchQuery} />
			{/each}
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
		gap: var(--spacing-md);
		padding: 0 var(--spacing-md);
		border-bottom: 1px solid var(--bg-tertiary);
		border-right: 4px solid var(--bg-tertiary);

		.icon {
			display: flex;
			color: var(--text);
			pointer-events: none;
		}

		.search {
			width: 100%;
			padding: var(--spacing-sm);
			background: var(--bg-primary);
			border: none;
			color: var(--text-primary);
			font-family: inherit;
			font-size: 14px;
			outline: none;

			&::placeholder {
				color: var(--text-muted);
			}
		}

		.stats {
			font-family: 'JetBrains Mono', monospace;
			font-size: 12px;
			color: var(--text-muted);
			display: flex;
			gap: var(--spacing-md);

			.item {
				display: flex;
				align-items: center;
				gap: var(--spacing-xs);

				.value {
					color: var(--text-primary);
					font-weight: 500;
				}
			}
		}
	}

	.tree {
		height: 100%;
		flex-grow: 1;
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
