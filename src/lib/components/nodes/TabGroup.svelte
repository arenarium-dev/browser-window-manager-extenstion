<script lang="ts">
	import TabNode from './Tab.svelte';

	import Icon from '$lib/components/icon/Icon.svelte';

	import type { TabGroup } from '$lib/core/types';

	interface Props {
		group: TabGroup;
		query: string;
	}
	let props: Props = $props();

	// Collapsed
	let collapsed = $state(false);

	// Visibility
	let visible = $derived(props.group.matches(props.query));
	let visibleTabs = $derived.by(() => {
		// Check if query is empty
		const query = props.query.toLowerCase().trim();
		if (!query) return props.group.tabs;

		// Filter tabs by query
		return props.group.tabs.filter((tab) => tab.matches(query));
	});
	let visibleContentExists = $derived(visibleTabs.length > 0);

	// Auto-expand when searching and has matches
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

<div class="group" class:collapsed class:hidden={!visible} style="--group-color: {props.group.color}">
	<button class="header" onclick={onToggle}>
		<div class="circle"></div>
		<span class="label">{props.group.title}</span>
		<div class="icon chevron">
			<Icon name="keyboard_arrow_down" size={16} />
		</div>
	</button>

	<div class="children">
		{#each visibleTabs as tab}
			<TabNode {tab} query={props.query} />
		{/each}
	</div>
</div>

<style>
	.group {
		display: flex;
		flex-direction: column;
		flex-shrink: 0;
		align-items: start;
		gap: var(--spacing-xs);
		user-select: none;
		animation: fadeIn var(--transition-normal) ease-out;
		animation-fill-mode: backwards;

		.header {
			--color: color-mix(in srgb, var(--group-color) 50%, var(--text-primary));

			display: flex;
			align-items: center;
			gap: var(--spacing-sm);
			padding: var(--spacing-xs) var(--spacing-sm);
			background-color: var(--bg-secondary);
			border: 2px solid var(--text-secondary);
			border-radius: var(--radius-md);
			cursor: pointer;
			transition: background var(--transition-fast);

			.circle {
				width: 12px;
				height: 12px;
				border-radius: 50%;
				background-color: var(--color);
			}

			.label {
				flex: 1;
				color: var(--text-primary);
				font-size: 12px;
				white-space: nowrap;
				overflow: hidden;
				text-overflow: ellipsis;
			}

			.icon {
				display: flex;
				color: var(--text-primary);
				pointer-events: none;
				transition: transform var(--transition-fast);
			}

			&:hover {
				background-color: var(--bg-tertiary);
				border-color: var(--text-secondary);
			}
		}

		.children {
			display: flex;
			flex-direction: column;
			align-items: start;
			gap: var(--spacing-xs);
			padding-left: var(--spacing-md);
			overflow: hidden;
			transition: max-height var(--transition-normal);
		}

		&.collapsed {
			.header {
				.chevron {
					transform: rotate(-90deg);
				}
			}

			.children {
				display: none;
			}
		}
	}
</style>
