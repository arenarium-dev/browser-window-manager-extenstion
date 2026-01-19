import { WindowGroup, Window, TabGroup, Tab } from './types';

const BOOKMARKS_ROOT_NAME = 'TabManager';
const BOOKMARKS_EMPTY_TAB_GROUP_TITLE = 'Untitled';
const BOOKMARKS_EMPTY_TAB_GROUP_COLOR = 'grey';

const STORAGE_SYNC_KEY = 'syncEnabled';

interface WindowFolderData {
	type: 'window';
	index: number;
}

interface TabGroupFolderData {
	type: 'tabgroup';
	title: string;
	color: chrome.tabGroups.ColorEnum;	
}

export async function getOpenedWindows(): Promise<WindowGroup> {
	let windowGroup = new WindowGroup();

	// Get all windows
	let chromeWindows = await chrome.windows.getAll({ populate: true });

	// Process each window
	for (const chromeWindow of chromeWindows) {
		if (!chromeWindow.id || !chromeWindow.tabs) continue;

		// Get all groups for the window
		let chromeGroups = await chrome.tabGroups.query({ windowId: chromeWindow.id });

		// Create a new window
		let window = new Window(windowGroup.windows.length + 1);
		let windowTabGroups = new Map<number, TabGroup>();

		// Process tabs
		for (let i = 0; i < chromeWindow.tabs.length; i++) {
			// Get the tab
			const chromeTab = chromeWindow.tabs[i];
			// Skip if tab is does not have an id
			if (!chromeTab.id) continue;
			// Skip if tab does not have a url
			if (!chromeTab.url) continue;

			// Try to find the group for the tab
			let chromeGroup = chromeGroups.find((group) => group.id === chromeTab.groupId);
			let windowGroup = windowTabGroups.get(chromeTab.groupId);

			// If the group is found, and not already in the window groups, create a new group
			if (chromeGroup && !windowGroup) {
				// Create a new group
				windowGroup = new TabGroup({
					windowId: chromeWindow.id,
					id: chromeGroup.id,
					color: chromeGroup.color,
					title: chromeGroup.title
				});

				// Add the group to the window groups
				windowTabGroups.set(chromeTab.groupId, windowGroup);
				window.items.push(windowGroup);
			}

			// Create a new tab
			let tab = new Tab({
				id: chromeTab.id,
				groupId: chromeTab.groupId,
				windowId: chromeWindow.id,
				url: chromeTab.url,
				title: chromeTab.title,
				icon: chromeTab.favIconUrl
			});

			if (windowGroup) {
				// If the group is found, add the tab to the group
				windowGroup.tabs.push(tab);
			} else {
				// Else, add the tab to the window
				window.items.push(tab);
			}
		}

		// Add the window to the opened group
		windowGroup.windows.push(window);
	}

	return windowGroup;
}

export function subscribeOpenedWindows(callback: () => void) {
	chrome.windows.onCreated.addListener(callback);
	chrome.windows.onRemoved.addListener(callback);
	chrome.tabs.onCreated.addListener(callback);
	chrome.tabs.onRemoved.addListener(callback);
	chrome.tabs.onUpdated.addListener(callback);
	chrome.tabs.onMoved.addListener(callback);
	chrome.tabs.onReplaced.addListener(callback);
	chrome.tabGroups.onCreated.addListener(callback);
	chrome.tabGroups.onRemoved.addListener(callback);
	chrome.tabGroups.onUpdated.addListener(callback);
	chrome.tabGroups.onMoved.addListener(callback);
}

export function unsubscribeOpenedWindows(callback: () => void) {
	chrome.windows.onCreated.removeListener(callback);
	chrome.windows.onRemoved.removeListener(callback);
	chrome.tabs.onCreated.removeListener(callback);
	chrome.tabs.onRemoved.removeListener(callback);
	chrome.tabs.onUpdated.removeListener(callback);
	chrome.tabs.onMoved.removeListener(callback);
	chrome.tabs.onReplaced.removeListener(callback);
	chrome.tabGroups.onCreated.removeListener(callback);
	chrome.tabGroups.onRemoved.removeListener(callback);
	chrome.tabGroups.onUpdated.removeListener(callback);
	chrome.tabGroups.onMoved.removeListener(callback);
}

export async function getBookmarkedWindows(): Promise<WindowGroup> {
	const windowGroup = new WindowGroup();

	// Find the root folder
	const chromeWindowsRootResults = await chrome.bookmarks.search({ title: BOOKMARKS_ROOT_NAME });
	const chromeWindowsRoot = chromeWindowsRootResults.find(
		(node) => !node.url && node.title === BOOKMARKS_ROOT_NAME
	);
	if (!chromeWindowsRoot) return windowGroup;

	// Get the full subtree
	const chromeWindowsRootSubtree = await chrome.bookmarks.getSubTree(chromeWindowsRoot.id);
	const chromeWindowsRootNode = chromeWindowsRootSubtree[0];
	if (!chromeWindowsRootNode.children) return windowGroup;

	// Each child folder represents a stored window
	for (const chromeWindowsNode of chromeWindowsRootNode.children) {
		// Skip bookmarks at the root level (only folders are windows)
		if (chromeWindowsNode.url) continue;
		// Skip if the node does not have children
		if (!chromeWindowsNode.children) continue;

		// Parse the window folder data
		const windowData = JSON.parse(chromeWindowsNode.title) as WindowFolderData;
		if (!windowData) continue;

		// Create a new window
		const window = new Window(windowData.index);

		// Process the window items
		for (const chromeWindowItemNode of chromeWindowsNode.children) {
			// If the item is a bookmark, create a tab
			if (chromeWindowItemNode.url) {
				const tab = new Tab({
					url: chromeWindowItemNode.url,
					title: chromeWindowItemNode.title,
				});

				window.items.push(tab);
				continue;
			}

			// If the item is a folder, create a tab group
			if (chromeWindowItemNode.children) {
				const tabGroupData = JSON.parse(chromeWindowItemNode.title) as TabGroupFolderData;
				if (!tabGroupData) continue;

				const tabGroup = new TabGroup({
					color: tabGroupData.color,
					title: tabGroupData.title === BOOKMARKS_EMPTY_TAB_GROUP_TITLE ? undefined : tabGroupData.title
				});

				// Process the tabs in the tab group
				for (const chromeWindowItemChildNode of chromeWindowItemNode.children) {
					if (!chromeWindowItemChildNode.url) continue;

					const tab = new Tab({
						url: chromeWindowItemChildNode.url,
						title: chromeWindowItemChildNode.title,
					});
					tabGroup.tabs.push(tab);
				}

				console.log('Tab group has tabs:', tabGroup.tabs.length);
				window.items.push(tabGroup);
				continue;
			}
		}

		// Add the window to the window group
		windowGroup.windows.push(window);
	}

	return windowGroup;
}

export async function bookmarkWindows(windowGroup: WindowGroup) {
	// Find or create the root folder
	let chromeWindowsRootResults = await chrome.bookmarks.search({ title: BOOKMARKS_ROOT_NAME });
	let chromeWindowsRoot = chromeWindowsRootResults.find((n) => !n.url && n.title === BOOKMARKS_ROOT_NAME);

	// Clear the root folder if it exists
	if (chromeWindowsRoot) await chrome.bookmarks.removeTree(chromeWindowsRoot.id);

	// Create the root folder if it doesn't exist
	chromeWindowsRoot = await chrome.bookmarks.create({ title: BOOKMARKS_ROOT_NAME });
	if (!chromeWindowsRoot.id) throw new Error('Failed to create root folder');

	// Process each window in the window group
	for (const window of windowGroup.windows) {
		// Create window folder with JSON title
		const windowFolderData: WindowFolderData = {
			type: 'window',
			index: window.id
		};

		const windowFolder = await chrome.bookmarks.create({
			parentId: chromeWindowsRoot.id,
			title: JSON.stringify(windowFolderData)
		});
		if (!windowFolder.id) throw new Error('Failed to create window folder');

		// Process each item in the window
		for (const item of window.items) {
			// If the item is a Tab, create a bookmark
			if (item instanceof Tab) {
				// Return if the tab does not have a url
				if (!item.url) continue;

				// Create the bookmark
				await chrome.bookmarks.create({
					parentId: windowFolder.id,
					title: item.title || item.url,
					url: item.url
				});
				// Continue to the next item
				continue;
			}

			// If the item is a TabGroup, create a folder and add tabs as bookmarks
			if (item instanceof TabGroup) {
				const tabGroupFolderData: TabGroupFolderData = {
					type: 'tabgroup',
					title: item.title || BOOKMARKS_EMPTY_TAB_GROUP_TITLE,
					color: (item.color as chrome.tabGroups.ColorEnum) || BOOKMARKS_EMPTY_TAB_GROUP_COLOR
				};

				const tabGroupFolder = await chrome.bookmarks.create({
					parentId: windowFolder.id,
					title: JSON.stringify(tabGroupFolderData)
				});
				if (!tabGroupFolder.id) throw new Error('Failed to create tab group folder');

				// Create bookmarks for each tab in the group
				for (const tab of item.tabs) {
					// Return if the tab does not have a url
					if (!tab.url) continue;

					// Create the bookmark
					await chrome.bookmarks.create({
						parentId: tabGroupFolder.id,
						title: tab.title || tab.url,
						url: tab.url
					});
				}

				// Continue to the next item
				continue;
			}
		}
	}
}

export async function openWindows(windowGroup: WindowGroup) {
	for (const window of windowGroup.windows) {
		const chromeWindow = await chrome.windows.create({ focused: true });
		if (!chromeWindow) continue;
		if (!chromeWindow.id) continue;
		if (!chromeWindow.tabs) continue;

		let chromeEmptyTab: chrome.tabs.Tab | undefined = chromeWindow.tabs[0];

		const addTab = async (tab: Tab) => {
			// Create the tab
			const chromeTab = await chrome.tabs.create({ url: tab.url, windowId: chromeWindow.id, active: false });
			// Remove the empty tab if it exists
			if (chromeEmptyTab?.id) await chrome.tabs.remove(chromeEmptyTab.id);
			// Clear the empty tab
			chromeEmptyTab = undefined;
			// Return the created tab
			return chromeTab;
		}

		for (const item of window.items) {
			if (item instanceof Tab) {
				// Add the tab
				await addTab(item);
				// Proceed to the next item
				continue;
			}

			if (item instanceof TabGroup) {
				// Add all the group tabs to the window
				const chromeTabs = [];
				for (const tab of item.tabs) {
					const chromeTab = await addTab(tab);
					chromeTabs.push(chromeTab);
				}

				// Group the tabs
				const chromeTabGroupId = await chrome.tabs.group({
					createProperties: { windowId: chromeWindow.id },
					tabIds: chromeTabs.map((tab) => tab.id).filter((id) => id !== undefined)
				});
				if (!chromeTabGroupId) continue;

				// Update the group
				await chrome.tabGroups.update(chromeTabGroupId, {
					title: item.title,
					color: item.color as chrome.tabGroups.ColorEnum
				});
				continue;
			}
		}
	}
}

export async function syncWindows() {
	const windowGroup = await getOpenedWindows();
	await bookmarkWindows(windowGroup);
}

export async function getSyncEnabled(): Promise<boolean> {
	const result = await chrome.storage.local.get(STORAGE_SYNC_KEY);
	return result[STORAGE_SYNC_KEY] === true;
}

export async function setSyncEnabled(enabled: boolean): Promise<void> {
	await chrome.storage.local.set({ [STORAGE_SYNC_KEY]: enabled });
}