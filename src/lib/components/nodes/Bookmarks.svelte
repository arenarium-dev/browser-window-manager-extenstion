<script lang="ts">
	import BookmarkNode from '$lib/components/nodes/Bookmark.svelte';
	import BookmarkFolderNode from '$lib/components/nodes/BookmarkFolder.svelte';

	import { ChevronDown, Star } from 'lucide-svelte';

	import { BookmarksRoot, Bookmark, BookmarkFolder } from '$lib/core/types';

	interface Props {
		bookmarks: BookmarksRoot;
		query: string;
	}
	let props: Props = $props();

	// Collapsed
	let collapsed = $state(false);

	// Visibility
	let visibleItems = $derived(props.bookmarks.items.filter((item) => item.matches(props.query)));
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

<div class="bookmarks" class:collapsed class:hidden={!visibleContentExists}>
	<button class="header" onclick={onToggle}>
		<div class="icon chevron">
			<ChevronDown size={16} />
		</div>
		<div class="icon star">
			<Star size={14} />
		</div>
		<span class="label">Bookmarks</span>
	</button>

	<div class="children">
		{#each visibleItems as item (item instanceof Bookmark ? item.id : item instanceof BookmarkFolder ? item.id : Math.random())}
			{#if item instanceof Bookmark}
				<BookmarkNode bookmark={item} query={props.query} />
			{:else if item instanceof BookmarkFolder}
				<BookmarkFolderNode folder={item} query={props.query} />
			{/if}
		{/each}
	</div>
</div>

<style lang="less">
	.bookmarks {
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
			padding: var(--spacing-xs) 0;
			padding-left: var(--spacing-sm);
			background-color: var(--bg-secondary);
			border: 2px solid var(--accent-yellow);
			border-radius: var(--radius-md);
			font-size: 12px;
			cursor: pointer;
			transition: background var(--transition-fast);

			.icon {
				display: flex;
				pointer-events: none;

				&.chevron {
					color: var(--accent-yellow);
					transition: transform var(--transition-fast);
				}

				&.star {
					color: var(--accent-yellow);
				}
			}

			.label {
				flex-grow: 1;
				color: var(--accent-yellow);
				white-space: nowrap;
				overflow: hidden;
				text-align: start;
				text-overflow: ellipsis;
			}

			&:hover {
				background-color: var(--bg-tertiary);
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
