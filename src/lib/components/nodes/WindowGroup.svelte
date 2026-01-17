<script lang="ts">
	import WindowNode from './Window.svelte';

	import { ChevronDown, PanelsTopLeft } from 'lucide-svelte';

	import { WindowGroup } from '$lib/core/types';

	interface Props {
		group: WindowGroup;
		title: string;
		query: string;
	}
	let props: Props = $props();

	// Collapsed
	let collapsed = $state(false);

	// Visibility
	let visibleItems = $derived(props.group.windows.filter((item) => item.matches(props.query)));
	let visibleContentExists = $derived(visibleItems.length > 0);

	// Auto-expand when searching
	$effect(() => {
		if (props.query.trim() && visibleContentExists) {
			collapsed = false;
		}
	});

	function onToggle(e: MouseEvent) {
		e.stopPropagation();
		collapsed = !collapsed;
	}
</script>

<div class="group" class:collapsed class:hidden={!visibleContentExists}>
	<button class="header" onclick={onToggle}>
		<div class="icon">
			<PanelsTopLeft size={16} />
		</div>
		<span class="label">{props.title}</span>
		<div class="icon chevron">
			<ChevronDown size={16} />
		</div>
	</button>

	<div class="children">
		{#each props.group.windows as window}
			<WindowNode {window} query={props.query} />
		{/each}
	</div>
</div>

<style lang="less">
	.group {
		width: 100%;
		display: flex;
		flex-direction: column;
		align-items: stretch;
		gap: var(--spacing-sm);

		.header {
			width: 100%;
			display: flex;
			align-items: center;
			gap: var(--spacing-sm);
			padding: var(--spacing-xs) var(--spacing-sm);
			background-color: var(--bg-secondary);
			border: 2px solid var(--text-secondary);
			border-radius: var(--radius-md);
			font-size: 12px;
			cursor: pointer;
			transition: background var(--transition-fast);

			.icon {
				display: flex;
				color: var(--text-primary);
				pointer-events: none;
				transition: transform var(--transition-fast);
			}

			.label {
				flex-grow: 1;
				color: var(--text-primary);
				white-space: nowrap;
				overflow: hidden;
				text-align: start;
				text-overflow: ellipsis;
			}

			&:hover {
				background-color: var(--bg-tertiary);
				border-color: var(--text-primary);
			}
		}

		.children {
			display: flex;
			flex-direction: column;
			align-items: start;
			gap: var(--spacing-xs);
			padding-left: var(--spacing-md);
			overflow: hidden;
		}

		&.collapsed {
			.chevron {
				transform: rotate(-90deg);
			}

			.children {
				display: none;
			}
		}
	}
</style>
