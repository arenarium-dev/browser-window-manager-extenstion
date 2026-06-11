<script lang="ts">
	import type { IconName } from '$lib/components/icon/names';

	let {
		name,
		color = 'inherit',
		size = 24,
		scale = 1,
		weight = 'normal',
		transition = '',
		filled = false
	}: {
		name: IconName;
		color?: string;
		size?: number;
		scale?: number;
		weight?: string;
		transition?: string;
		filled?: boolean;
	} = $props();

	let sizePx = $derived(size + 'px');
</script>

<span
	class="material-symbols-rounded icon"
	class:filled
	style:scale
	style:color
	style:transition
	style:font-weight={weight}
	style:font-size={sizePx}
	style:width={sizePx}
	style:height={sizePx}
>
	{name}
</span>

<style>
	.icon {
		overflow: hidden;
	}

	.filled {
		font-variation-settings:
			'FILL' 1,
			'opsz' 24;
	}
</style>
