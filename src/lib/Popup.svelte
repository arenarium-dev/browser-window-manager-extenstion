<script lang="ts">
	import { onMount } from 'svelte';

	import { FolderTree, Search, SquareX } from 'lucide-svelte';

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
		<div class="logo">
			<FolderTree size={20} />
			<span class="text">Tab Manager</span>
		</div>
		<div class="stats">
			{#if !loading && !error}
				<span class="stat-item">
					<span class="stat-value">{windows.length}</span> windows
				</span>
				{#if totalGroups > 0}
					<span class="stat-item">
						<span class="stat-value">{totalGroups}</span> groups
					</span>
				{/if}
				<span class="stat-item">
					<span class="stat-value">{totalTabs}</span> tabs
				</span>
			{/if}
		</div>
	</header>

	<div class="search-container">
		<Search class="search-icon" size={16} />
		<input
			bind:this={searchInput}
			bind:value={searchQuery}
			type="text"
			class="search-input"
			placeholder="Search tabs..."
		/>
	</div>

	<div class="tree-container">
		{#if loading}
			<div class="loading">
				<div class="loading-spinner"></div>
				<span>Loading tabs...</span>
			</div>
		{:else if error}
			<div class="empty-state">
				<SquareX class="empty-state-icon" size={48} />
				<span>Failed to load tabs</span>
				<small>{error}</small>
			</div>
		{:else if windows.length === 0}
			<div class="empty-state">
				<SquareX class="empty-state-icon" size={48} />
				<span>No windows found</span>
			</div>
		{:else}
			{#each windows as windowInfo, index (windowInfo.id)}
				<WindowNode {windowInfo} {index} {searchQuery} />
			{/each}
		{/if}
	</div>
</div>

<style lang="less">
	.container {
		display: flex;
		flex-direction: column;
		height: 100%;
		max-height: 600px;
	}

	.header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: var(--spacing-md) var(--spacing-lg);
		background: linear-gradient(135deg, var(--bg-secondary) 0%, var(--bg-primary) 100%);
		border-bottom: 1px solid var(--bg-tertiary);

		.logo {
			display: flex;
			align-items: center;
			gap: var(--spacing-md);

			.text {
				font-family: 'JetBrains Mono', monospace;
				font-size: 15px;
				font-weight: 600;
			}
		}

		.stats {
			font-family: 'JetBrains Mono', monospace;
			font-size: 11px;
			color: var(--text-muted);
			display: flex;
			gap: var(--spacing-md);

			.stat-item {
				display: flex;
				align-items: center;
				gap: var(--spacing-xs);

				.stat-value {
					color: var(--accent-blue);
					font-weight: 500;
				}
			}
		}
	}

	.search-container {
		position: relative;
		padding: var(--spacing-sm) var(--spacing-lg);
		background: var(--bg-secondary);
		border-bottom: 1px solid var(--bg-tertiary);

		.search-input {
			width: 100%;
			padding: var(--spacing-sm) var(--spacing-md);
			padding-left: calc(var(--spacing-lg) + var(--spacing-md));
			background: var(--bg-primary);
			border: 1px solid var(--bg-tertiary);
			border-radius: var(--radius-md);
			color: var(--text-primary);
			font-family: inherit;
			font-size: 12px;
			outline: none;
			transition:
				border-color var(--transition-fast),
				box-shadow var(--transition-fast);

			&::placeholder {
				color: var(--text-muted);
			}

			&:focus {
				border-color: var(--accent-blue);
				box-shadow: 0 0 0 3px rgba(102, 217, 239, 0.15);
			}
		}
	}

	.tree-container {
		flex: 1;
		overflow-y: auto;
		overflow-x: hidden;
		padding: var(--spacing-sm) 0;
		background:
			radial-gradient(ellipse at top left, rgba(102, 217, 239, 0.03) 0%, transparent 50%),
			radial-gradient(ellipse at bottom right, rgba(174, 129, 255, 0.03) 0%, transparent 50%),
			var(--bg-primary);

		&::-webkit-scrollbar {
			width: 8px;
		}

		&::-webkit-scrollbar-track {
			background: transparent;
		}

		&::-webkit-scrollbar-thumb {
			background: var(--bg-tertiary);
			border-radius: var(--radius-sm);

			&:hover {
				background: var(--bg-hover);
			}
		}
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

		.loading-spinner {
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

	.empty-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: var(--spacing-xl);
		color: var(--text-muted);
		text-align: center;
		gap: var(--spacing-sm);
	}

	:global(.empty-state-icon) {
		color: var(--bg-tertiary);
	}
</style>
