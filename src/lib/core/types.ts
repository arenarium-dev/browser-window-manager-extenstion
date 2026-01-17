// ----------------------------
// WINDOWS
// ----------------------------

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

export class TabGroup implements WindowItem {
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

// ----------------------------
// BOOKMARKS
// ----------------------------

export interface BookmarkItem {
	matches(query: string): boolean;
}

export class BookmarksRoot {
	items: BookmarkItem[];

	constructor() {
		this.items = [];
	}
}

export class BookmarkFolder implements BookmarkItem {
	id: string;
	title: string;
	children: BookmarkItem[];

	constructor(node: chrome.bookmarks.BookmarkTreeNode) {
		this.id = node.id;
		this.title = node.title || 'Untitled Folder';
		this.children = [];
	}

	matches(query: string): boolean {
		const lowerQuery = query.trim().toLowerCase();
		if (!lowerQuery) return true;

		const lowerTitle = this.title.toLowerCase();
		if (lowerTitle.includes(lowerQuery)) return true;

		return this.children.some((child) => child.matches(lowerQuery));
	}
}

export class Bookmark implements BookmarkItem {
	id: string;
	title: string;
	url: string;
	icon: string | undefined;

	constructor(node: chrome.bookmarks.BookmarkTreeNode) {
		this.id = node.id;
		this.title = node.title || node.url || 'Untitled';
		this.url = node.url || '';

		// Use Google's favicon service for bookmark icons
		if (this.url) {
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

		const lowerTitle = this.title.toLowerCase();
		if (lowerTitle.includes(lowerQuery)) return true;

		const lowerUrl = this.url.toLowerCase();
		if (lowerUrl.includes(lowerQuery)) return true;

		return false;
	}
}