import type { WindowInfo, TabInfo } from './types';

export async function getAllWindows(): Promise<WindowInfo[]> {
	const windows = await chrome.windows.getAll({ populate: true });
	const windowInfos: WindowInfo[] = [];

	for (const win of windows) {
		if (!win.id || !win.tabs) continue;

		const windowInfo: WindowInfo = {
			id: win.id,
			focused: win.focused || false,
			tabs: [],
			groups: new Map()
		};

		// Get tab groups for this window
		try {
			const groups = await chrome.tabGroups.query({ windowId: win.id });
			for (const group of groups) {
				windowInfo.groups.set(group.id, {
					id: group.id,
					windowId: win.id,
					title: group.title || 'Unnamed Group',
					color: group.color,
					collapsed: group.collapsed
				});
			}
		} catch {
			// Tab groups API might not be available
		}

		// Process tabs
		for (const tab of win.tabs) {
			if (!tab.id) continue;

			windowInfo.tabs.push({
				id: tab.id,
				groupId: tab.groupId ?? -1,
				windowId: win.id,
				title: tab.title || 'Untitled',
				url: tab.url || '',
				icon: tab.favIconUrl,
				index: tab.index
			});
		}

		windowInfos.push(windowInfo);
	}

	// Sort windows - focused window first
	windowInfos.sort((a, b) => {
		if (a.focused && !b.focused) return -1;
		if (!a.focused && b.focused) return 1;
		return a.id - b.id;
	});

	return windowInfos;
}

export async function switchToTab(tabId: number, windowId: number): Promise<void> {
	await chrome.tabs.update(tabId, { active: true });
	await chrome.windows.update(windowId, { focused: true });
	window.close();
}

export function organizeTabsByGroups(tabs: TabInfo[]): {
	ungroupedTabs: TabInfo[];
	groupedTabs: Map<number, TabInfo[]>;
} {
	const ungroupedTabs: TabInfo[] = [];
	const groupedTabs = new Map<number, TabInfo[]>();

	for (const tab of tabs) {
		if (tab.groupId === -1 || tab.groupId === chrome.tabGroups?.TAB_GROUP_ID_NONE) {
			ungroupedTabs.push(tab);
		} else {
			if (!groupedTabs.has(tab.groupId)) {
				groupedTabs.set(tab.groupId, []);
			}
			groupedTabs.get(tab.groupId)!.push(tab);
		}
	}

	return { ungroupedTabs, groupedTabs };
}
