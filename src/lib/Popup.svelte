<script lang="ts">
	import { onMount, tick } from 'svelte';

	import WindowNode from './components/nodes/Window.svelte';

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
			<svg class="logo-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
				<path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"
				></path>
			</svg>
			<span class="logo-text">Tab Tree</span>
		</div>
		<div class="stats">
			{#if !loading && !error}
				<span class="stat-item">
					<span class="stat-value">{windows.length}</span> windows
				</span>
				<span class="stat-item">
					<span class="stat-value">{totalTabs}</span> tabs
				</span>
				{#if totalGroups > 0}
					<span class="stat-item">
						<span class="stat-value">{totalGroups}</span> groups
					</span>
				{/if}
			{/if}
		</div>
	</header>

	<div class="search-container">
		<svg class="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
			<circle cx="11" cy="11" r="8"></circle>
			<path d="m21 21-4.35-4.35"></path>
		</svg>
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
				<svg
					class="empty-state-icon"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
				>
					<rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
					<line x1="9" y1="9" x2="15" y2="15"></line>
					<line x1="15" y1="9" x2="9" y2="15"></line>
				</svg>
				<span>Failed to load tabs</span>
				<small>{error}</small>
			</div>
		{:else if windows.length === 0}
			<div class="empty-state">
				<svg
					class="empty-state-icon"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
				>
					<rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
					<line x1="9" y1="9" x2="15" y2="15"></line>
					<line x1="15" y1="9" x2="9" y2="15"></line>
				</svg>
				<span>No windows found</span>
			</div>
		{:else}
			{#each windows as windowInfo, index (windowInfo.id)}
				<WindowNode {windowInfo} {index} {searchQuery} />
			{/each}
		{/if}
	</div>
</div>

<style>
	.container {
		display: flex;
		flex-direction: column;
		height: 100%;
		max-height: 600px;
	}

	/* Header */
	.header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: var(--spacing-md) var(--spacing-lg);
		background: linear-gradient(135deg, var(--bg-secondary) 0%, var(--bg-primary) 100%);
		border-bottom: 1px solid var(--bg-tertiary);
	}

	.logo {
		display: flex;
		align-items: center;
		gap: var(--spacing-sm);
	}

	.logo-icon {
		width: 22px;
		height: 22px;
		color: var(--accent-yellow);
		filter: drop-shadow(0 0 4px rgba(230, 219, 116, 0.4));
	}

	.logo-text {
		font-family: 'JetBrains Mono', monospace;
		font-size: 15px;
		font-weight: 600;
		background: linear-gradient(90deg, var(--accent-yellow) 0%, var(--accent-orange) 100%);
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-clip: text;
	}

	.stats {
		font-family: 'JetBrains Mono', monospace;
		font-size: 11px;
		color: var(--text-muted);
		display: flex;
		gap: var(--spacing-md);
	}

	.stat-item {
		display: flex;
		align-items: center;
		gap: var(--spacing-xs);
	}

	.stat-value {
		color: var(--accent-blue);
		font-weight: 500;
	}

	/* Search */
	.search-container {
		position: relative;
		padding: var(--spacing-sm) var(--spacing-lg);
		background: var(--bg-secondary);
		border-bottom: 1px solid var(--bg-tertiary);
	}

	.search-icon {
		position: absolute;
		left: calc(var(--spacing-lg) + var(--spacing-sm));
		top: 50%;
		transform: translateY(-50%);
		width: 16px;
		height: 16px;
		color: var(--text-muted);
		pointer-events: none;
	}

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
	}

	.search-input::placeholder {
		color: var(--text-muted);
	}

	.search-input:focus {
		border-color: var(--accent-blue);
		box-shadow: 0 0 0 3px rgba(102, 217, 239, 0.15);
	}

	/* Tree Container */
	.tree-container {
		flex: 1;
		overflow-y: auto;
		overflow-x: hidden;
		padding: var(--spacing-sm) 0;
		background:
			radial-gradient(ellipse at top left, rgba(102, 217, 239, 0.03) 0%, transparent 50%),
			radial-gradient(ellipse at bottom right, rgba(174, 129, 255, 0.03) 0%, transparent 50%),
			var(--bg-primary);
	}

	.tree-container::-webkit-scrollbar {
		width: 8px;
	}

	.tree-container::-webkit-scrollbar-track {
		background: transparent;
	}

	.tree-container::-webkit-scrollbar-thumb {
		background: var(--bg-tertiary);
		border-radius: var(--radius-sm);
	}

	.tree-container::-webkit-scrollbar-thumb:hover {
		background: var(--bg-hover);
	}

	/* Loading State */
	.loading {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: var(--spacing-md);
		padding: var(--spacing-xl);
		color: var(--text-muted);
		height: 200px;
	}

	.loading-spinner {
		width: 32px;
		height: 32px;
		border: 3px solid var(--bg-tertiary);
		border-top-color: var(--accent-blue);
		border-radius: 50%;
		animation: spin 0.8s linear infinite;
	}

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}

	/* Empty State */
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

	.empty-state-icon {
		width: 48px;
		height: 48px;
		color: var(--bg-tertiary);
	}
</style>
