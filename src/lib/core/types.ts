export interface WindowInfo {
	id: number;
	focused: boolean;
	tabs: TabInfo[];
	groups: Map<number, TabGroupInfo>;
}

export interface TabGroupInfo {
	id: number;
	windowId: number;
	title: string;
	color: chrome.tabGroups.ColorEnum;
	collapsed: boolean;
}

export interface TabInfo {
	id: number;
	windowId: number;
	groupId: number;
	index: number;
	title: string;
	url: string;
	icon?: string;
}
