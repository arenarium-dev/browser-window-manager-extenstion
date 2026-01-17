<script lang="ts">
	import GroupNode from '$lib/components/nodes/Group.svelte';
	import TabNode from '$lib/components/nodes/Tab.svelte';

	import { ChevronDown, AppWindow } from 'lucide-svelte';

	import { Window, Tab, Group } from '$lib/core/types';

	interface Props {
		window: Window;
		index: number;
		query: string;
	}
	let props: Props = $props();

	// Collapsed
	let collapsed = $state(false);

	// Visibility
	let visibleItems = $derived(props.window.items.filter((item) => item.matches(props.query)));
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

<div class="window" class:collapsed class:hidden={!visibleContentExists}>
	<button class="header" onclick={onToggle}>
		<div class="icon">
			<AppWindow size={16} />
		</div>
		<span class="label">{`Window ${props.window.id}`}</span>
		<div class="icon chevron">
			<ChevronDown size={16} />
		</div>
	</button>

	<div class="children">
		{#each props.window.items as item}
			{#if item instanceof Tab}
				<TabNode tab={item} query={props.query} />
			{/if}
			{#if item instanceof Group}
				<GroupNode group={item} query={props.query} />
			{/if}
		{/each}
	</div>
</div>

<style lang="less">
	.window {
		width: 100%;
		display: flex;
		flex-direction: column;
		align-items: start;
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
