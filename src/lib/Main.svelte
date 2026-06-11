<script lang="ts">
	import Icon from '$lib/components/icon/Icon.svelte';
	import ActivePage from '$lib/pages/ActivePage.svelte';
	import ArchivePage from '$lib/pages/ArchivePage.svelte';

	let archiveOpen = $state(false);
</script>

<div class="container">
	{#if archiveOpen}
		<ArchivePage onClose={() => (archiveOpen = false)} />
	{:else}
		<ActivePage />
	{/if}

	<footer class="footer">
		<div class="windows"></div>
		<button class="archive" class:enabled={archiveOpen} onclick={() => (archiveOpen = !archiveOpen)} aria-pressed={archiveOpen} title="Archive">
			<Icon name="archive" size={20} />
		</button>
	</footer>
</div>

<style>
	.container {
		display: flex;
		flex-direction: column;
		width: var(--app-width);
		height: var(--app-height);
	}

	.footer {
		position: fixed;
		bottom: 0;
		left: 0;
		width: 100%;
		height: 48px;
		display: flex;
		justify-content: start;
		align-items: center;
		background: var(--bg-primary);
		border: 1px solid var(--border);
		border-radius: 8px;
		padding: 8px;

		.windows {
			flex-grow: 1;
		}

		.archive {
			display: flex;
			align-items: center;
			justify-content: center;
			width: 28px;
			height: 28px;
			color: var(--text-secondary);
			background: transparent;
			border: none;
			border-radius: 8px;
			cursor: pointer;
			transition:
				background var(--transition-fast),
				color var(--transition-fast);

			&:hover,
			&.enabled {
				background: var(--bg-tertiary);
				color: var(--text-primary);
			}
		}
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
</style>
