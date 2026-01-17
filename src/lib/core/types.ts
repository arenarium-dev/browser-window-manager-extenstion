export interface Queryable {
	matches(query: string): boolean;
}

export class WindowGroup implements Queryable {
	windows: Window[];

	constructor() {
		this.windows = [];
	}

	matches(query: string): boolean {
		const lowerQuery = query.trim().toLowerCase();
		if (!lowerQuery) return true;

		return this.windows.some((window) => window.matches(query));
	}
}

export class Window implements Queryable {
	id: number;
	items: (Tab | TabGroup)[];

	constructor(window: chrome.windows.Window) {
		this.id = window.id ?? -1;
		this.items = [];
	}

	matches(query: string): boolean {
		const lowerQuery = query.trim().toLowerCase();
		if (!lowerQuery) return true;

		return this.items.some((item) => item.matches(lowerQuery));
	}
}

export class TabGroup implements Queryable {
	id: number | undefined;
	windowId: number | undefined;
	title: string | undefined;
	color: chrome.tabGroups.ColorEnum;
	tabs: Tab[];

	constructor(group: chrome.tabGroups.TabGroup) {
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

export class Tab implements Queryable {
	id: number | undefined;
	groupId: number | undefined;
	windowId: number | undefined;
	url: string | undefined;
	title: string | undefined;
	icon: string | undefined;

	constructor(tab: chrome.tabs.Tab) {
		this.id = tab.id;
		this.groupId = tab.groupId;
		this.windowId = tab.windowId;
		this.title = tab.title ?? tab.url;
		this.url = tab.url;
		this.icon = tab.favIconUrl;

		// Use Google's favicon service for bookmark icons
		if (!this.icon && this.url) {
			try {
				const urlObj = new URL(this.url);
				this.icon = `https://www.google.com/s2/favicons?domain=${urlObj.hostname}&sz=32`;
			} catch {
				this.icon = undefined;
			}
		}
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