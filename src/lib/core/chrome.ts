import { Window, TabGroup, Tab, BookmarksRoot, BookmarkFolder, Bookmark, type BookmarkItem } from './types';

export async function getWindows(): Promise<Window[]> {
	const windows: Window[] = [];

	// Get all windows
	let chromeWindows = await chrome.windows.getAll({ populate: true });

	// Process each window
	for (const chromeWindow of chromeWindows) {
		if (!chromeWindow.id || !chromeWindow.tabs) continue;

		// Get all groups for the window
		let chromeGroups = await chrome.tabGroups.query({ windowId: chromeWindow.id });

		// Create a new window
		let window = new Window(chromeWindow);
		let windowGroups = new Map<number, TabGroup>();

		// Process tabs
		for (const chromeTab of chromeWindow.tabs) {
			// Skip if tab is does not have an id
			if (!chromeTab.id) continue;

			// Try to find the group for the tab
			let chromeGroup = chromeGroups.find((group) => group.id === chromeTab.groupId);
			let windowGroup = windowGroups.get(chromeTab.groupId);

			// If the group is found, and not already in the window groups, create a new group
			if (chromeGroup && !windowGroup) {
				// Create a new group
				windowGroup = new TabGroup(chromeTab.groupId, chromeGroup);

				// Add the group to the window groups
				windowGroups.set(chromeTab.groupId, windowGroup);
				window.items.push(windowGroup);
			}

			// Create a new tab
			let tab = new Tab(chromeTab.index, chromeTab);

			if (windowGroup) {
				// If the group is found, add the tab to the group
				windowGroup.tabs.push(tab);
			} else {
				// Else, add the tab to the window
				window.items.push(tab);
			}
		}

		windows.push(window);
	}

	return windows;
}

function processBookmarkNode(node: chrome.bookmarks.BookmarkTreeNode): BookmarkItem | null {
	// If it has a URL, it's a bookmark
	if (node.url) {
		return new Bookmark(node);
	}

	// If it has children, it's a folder
	if (node.children) {
		const folder = new BookmarkFolder(node);
		for (const child of node.children) {
			const item = processBookmarkNode(child);
			if (item) {
				folder.children.push(item);
			}
		}
		return folder;
	}

	return null;
}

export async function getBookmarks(): Promise<BookmarksRoot> {
	const root = new BookmarksRoot();

	// Get the bookmark tree
	const tree = await chrome.bookmarks.getTree();

	// Process the root nodes (usually "Bookmarks Bar", "Other Bookmarks", etc.)
	for (const rootNode of tree) {
		if (rootNode.children) {
			for (const child of rootNode.children) {
				const item = processBookmarkNode(child);
				if (item) {
					root.items.push(item);
				}
			}
		}
	}

	return root;
}
