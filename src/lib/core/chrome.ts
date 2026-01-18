import { WindowGroup, Window, TabGroup, Tab } from './types';

export namespace Windows {
	export namespace Opened {
		export async function get(): Promise<WindowGroup> {
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
				for (const chromeTab of chromeWindow.tabs) {
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
	}

	export namespace Stored {
		const STORAGE_ROOT_NAME = 'TabManager';
		const STORAGE_EMPTY_TAB_GROUP_TITLE = 'Untitled';
		const STORAGE_EMPTY_TAB_GROUP_COLOR = 'grey';

		interface WindowFolderData {
			type: 'window';
			index: number;
		}

		interface TabGroupFolderData {
			type: 'tabgroup';
			title: string;
			color: chrome.tabGroups.ColorEnum;
		}

		export async function get(): Promise<WindowGroup> {
			const windowGroup = new WindowGroup();

			// Find the root folder
			const chromeWindowsRootResults = await chrome.bookmarks.search({ title: STORAGE_ROOT_NAME });
			const chromeWindowsRoot = chromeWindowsRootResults.find(
				(node) => !node.url && node.title === STORAGE_ROOT_NAME
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
							title: tabGroupData.title === STORAGE_EMPTY_TAB_GROUP_TITLE ? undefined : tabGroupData.title
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

						window.items.push(tabGroup);
						continue;
					}
				}

				// Add the window to the window group
				windowGroup.windows.push(window);
			}

			return windowGroup;
		}

		export async function save(windowGroup: WindowGroup) {
			// Find or create the root folder
			let chromeWindowsRootResults = await chrome.bookmarks.search({ title: STORAGE_ROOT_NAME });
			let chromeWindowsRoot = chromeWindowsRootResults.find((n) => !n.url && n.title === STORAGE_ROOT_NAME);

			// Create the root folder if it doesn't exist
			if (!chromeWindowsRoot) {
				chromeWindowsRoot = await chrome.bookmarks.create({ title: STORAGE_ROOT_NAME });
			}
			if (!chromeWindowsRoot.id) return;

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
				if (!windowFolder.id) continue;

				// Process each item in the window
				for (const item of window.items) {
					// If the item is a Tab, create a bookmark
					if (item instanceof Tab) {
						if (!item.url) continue;

						await chrome.bookmarks.create({
							parentId: windowFolder.id,
							title: item.title || item.url,
							url: item.url
						});
						continue;
					}

					// If the item is a TabGroup, create a folder and add tabs as bookmarks
					if (item instanceof TabGroup) {
						const tabGroupFolderData: TabGroupFolderData = {
							type: 'tabgroup',
							title: item.title || STORAGE_EMPTY_TAB_GROUP_TITLE,
							color: (item.color as chrome.tabGroups.ColorEnum) || STORAGE_EMPTY_TAB_GROUP_COLOR
						};

						const tabGroupFolder = await chrome.bookmarks.create({
							parentId: windowFolder.id,
							title: JSON.stringify(tabGroupFolderData)
						});

						if (!tabGroupFolder.id) continue;

						// Create bookmarks for each tab in the group
						for (const tab of item.tabs) {
							if (!tab.url) continue;

							await chrome.bookmarks.create({
								parentId: tabGroupFolder.id,
								title: tab.title || tab.url,
								url: tab.url
							});
						}
						continue;
					}
				}
			}
		}

		export async function open(windowGroup: WindowGroup) {
			for (const window of windowGroup.windows) {
				const chromeWindow = await chrome.windows.create();
				if (!chromeWindow) continue;

				for (const item of window.items) {
					// Create a tab
					if (item instanceof Tab) {
						await chrome.tabs.create({ url: item.url, windowId: chromeWindow.id });
						continue;
					}

					// Create a tab group
					if (item instanceof TabGroup) {
						// Create the tabs
						const chromeTabs = await Promise.all(
							item.tabs.map(async (tab) => {
								return await chrome.tabs.create({ url: tab.url, windowId: chromeWindow.id });
							})
						);

						// Group the tabs
						const chromeTabGroupId = await chrome.tabs.group({
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
	}
}
