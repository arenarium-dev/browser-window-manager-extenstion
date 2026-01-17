import { Window, Group, Tab } from './types';

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
		let windowGroups = new Map<number, Group>();

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
				windowGroup = new Group(chromeTab.groupId, chromeGroup);

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
