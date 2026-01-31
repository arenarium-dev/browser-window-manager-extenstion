export interface Queryable {
	matches(query: string): boolean;
}

export class WindowGroup implements Queryable {
	name: string;
	windows: Window[];

	constructor(name: string) {
		this.name = name;
		this.windows = [];
	}

	matches(query: string): boolean {
		const lowerQuery = query.trim().toLowerCase();
		if (!lowerQuery) return true;

		return this.windows.some((window) => window.matches(query));
	}
}

export class Window implements Queryable {
	index: number;
	items: (Tab | TabGroup)[];

	constructor(index: number) {
		this.index = index;
		this.items = [];
	}

	matches(query: string): boolean {
		const lowerQuery = query.trim().toLowerCase();
		if (!lowerQuery) return true;

		return this.items.some((item) => item.matches(lowerQuery));
	}
}

export class Tab implements Queryable {
	id?: number;
	windowId?: number;
	groupId?: number;
	url?: string;
	title?: string;
	icon?: string;

	constructor(options: { id?: number; windowId?: number; groupId?: number; url?: string; title?: string; icon?: string }) {
		this.id = options.id;
		this.windowId = options.windowId;
		this.groupId = options.groupId;
		this.url = options.url;
		this.title = options.title;
		this.icon = options.icon;

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

export class TabGroup implements Queryable {
	id?: number;
	windowId?: number;
	color?: string;
	title?: string;
	tabs: Tab[];

	constructor(options: { id?: number; windowId?: number; color?: string; title?: string }) {
		this.id = options.id;
		this.windowId = options.windowId;
		this.color = options.color;
		this.title = options.title;
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
