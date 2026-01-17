export interface WindowItem {
	index: number;

	matches(query: string): boolean;
}

export class Window {
	id: number;
	items: WindowItem[];

	constructor(window: chrome.windows.Window) {
		this.id = window.id ?? -1;
		this.items = [];
	}
}

export class Group implements WindowItem {
	// Interface
	index: number;
	// Data
	id: number | undefined;
	windowId: number | undefined;
	title: string | undefined;
	color: chrome.tabGroups.ColorEnum;
	tabs: Tab[];

	constructor(index: number, group: chrome.tabGroups.TabGroup) {
		this.index = index;

		this.id = group.id;
		this.windowId = group.windowId;
		this.title = group.title;
		this.color = group.color;
		this.tabs = [];
	}

	matches(query: string): boolean {
		const lowerQuery = query.trim().toLowerCase();
		if (!lowerQuery) return true;

		const lowerTitle = this.title?.toLowerCase();
		if (lowerTitle?.includes(lowerQuery)) return true;

		return this.tabs.some((tab) => tab.matches(lowerQuery));
	}
}

export class Tab implements WindowItem {
	// Interface
	index: number;
	// Data
	id: number | undefined;
	groupId: number | undefined;
	windowId: number | undefined;
	url: string | undefined;
	title: string | undefined;
	icon: string | undefined;

	constructor(index: number, tab: chrome.tabs.Tab) {
		this.index = index;

		this.id = tab.id;
		this.groupId = tab.groupId;
		this.windowId = tab.windowId;
		this.title = tab.title ?? tab.url;
		this.url = tab.url;
		this.icon = tab.favIconUrl;
	}

	matches(query: string): boolean {
		const lowerQuery = query.trim().toLowerCase();
		if (!lowerQuery) return true;

		const lowerTitle = this.title?.toLowerCase();
		if (lowerTitle?.includes(lowerQuery)) return true;

		const lowerUrl = this.url?.toLowerCase();
		if (lowerUrl?.includes(lowerQuery)) return true;

		return false;
	}
}
