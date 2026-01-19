class WindowGroup {
  windows;
  constructor() {
    this.windows = [];
  }
  matches(query) {
    const lowerQuery = query.trim().toLowerCase();
    if (!lowerQuery) return true;
    return this.windows.some((window) => window.matches(query));
  }
}
class Window {
  id;
  items;
  constructor(id) {
    this.id = id;
    this.items = [];
  }
  matches(query) {
    const lowerQuery = query.trim().toLowerCase();
    if (!lowerQuery) return true;
    return this.items.some((item) => item.matches(lowerQuery));
  }
}
class Tab {
  id;
  windowId;
  groupId;
  url;
  title;
  icon;
  constructor(options) {
    this.id = options.id;
    this.windowId = options.windowId;
    this.groupId = options.groupId;
    this.url = options.url;
    this.title = options.title;
    this.icon = options.icon;
    if (!this.icon && this.url) {
      try {
        const urlObj = new URL(this.url);
        this.icon = `https://www.google.com/s2/favicons?domain=${urlObj.hostname}&sz=32`;
      } catch {
        this.icon = void 0;
      }
    }
  }
  matches(query) {
    const lowerQuery = query.trim().toLowerCase();
    if (!lowerQuery) return true;
    const lowerTitle = this.title?.toLowerCase();
    if (lowerTitle?.includes(lowerQuery)) return true;
    const lowerUrl = this.url?.toLowerCase();
    if (lowerUrl?.includes(lowerQuery)) return true;
    return false;
  }
}
class TabGroup {
  id;
  windowId;
  color;
  title;
  tabs;
  constructor(options) {
    this.id = options.id;
    this.windowId = options.windowId;
    this.color = options.color;
    this.title = options.title;
    this.tabs = [];
  }
  matches(query) {
    const lowerQuery = query.trim().toLowerCase();
    if (!lowerQuery) return true;
    const lowerTitle = this.title?.toLowerCase();
    if (lowerTitle?.includes(lowerQuery)) return true;
    return this.tabs.some((tab) => tab.matches(lowerQuery));
  }
}
const BOOKMARKS_ROOT_NAME = "TabManager";
const BOOKMARKS_EMPTY_TAB_GROUP_TITLE = "Untitled";
const BOOKMARKS_EMPTY_TAB_GROUP_COLOR = "grey";
async function getOpenedWindows() {
  let windowGroup = new WindowGroup();
  let chromeWindows = await chrome.windows.getAll({ populate: true });
  for (const chromeWindow of chromeWindows) {
    if (!chromeWindow.id || !chromeWindow.tabs) continue;
    let chromeGroups = await chrome.tabGroups.query({ windowId: chromeWindow.id });
    let window = new Window(windowGroup.windows.length + 1);
    let windowTabGroups = /* @__PURE__ */ new Map();
    for (let i = 0; i < chromeWindow.tabs.length; i++) {
      const chromeTab = chromeWindow.tabs[i];
      if (!chromeTab.id) continue;
      if (!chromeTab.url) continue;
      let chromeGroup = chromeGroups.find((group) => group.id === chromeTab.groupId);
      let windowGroup2 = windowTabGroups.get(chromeTab.groupId);
      if (chromeGroup && !windowGroup2) {
        windowGroup2 = new TabGroup({
          windowId: chromeWindow.id,
          id: chromeGroup.id,
          color: chromeGroup.color,
          title: chromeGroup.title
        });
        windowTabGroups.set(chromeTab.groupId, windowGroup2);
        window.items.push(windowGroup2);
      }
      let tab = new Tab({
        id: chromeTab.id,
        groupId: chromeTab.groupId,
        windowId: chromeWindow.id,
        url: chromeTab.url,
        title: chromeTab.title,
        icon: chromeTab.favIconUrl
      });
      if (windowGroup2) {
        windowGroup2.tabs.push(tab);
      } else {
        window.items.push(tab);
      }
    }
    windowGroup.windows.push(window);
  }
  return windowGroup;
}
async function bookmarkWindows(windowGroup) {
  let chromeWindowsRootResults = await chrome.bookmarks.search({ title: BOOKMARKS_ROOT_NAME });
  let chromeWindowsRoot = chromeWindowsRootResults.find((n) => !n.url && n.title === BOOKMARKS_ROOT_NAME);
  if (chromeWindowsRoot) await chrome.bookmarks.removeTree(chromeWindowsRoot.id);
  chromeWindowsRoot = await chrome.bookmarks.create({ title: BOOKMARKS_ROOT_NAME });
  if (!chromeWindowsRoot.id) throw new Error("Failed to create root folder");
  for (const window of windowGroup.windows) {
    const windowFolderData = {
      type: "window",
      index: window.id
    };
    const windowFolder = await chrome.bookmarks.create({
      parentId: chromeWindowsRoot.id,
      title: JSON.stringify(windowFolderData)
    });
    if (!windowFolder.id) throw new Error("Failed to create window folder");
    for (const item of window.items) {
      if (item instanceof Tab) {
        if (!item.url) continue;
        await chrome.bookmarks.create({
          parentId: windowFolder.id,
          title: item.title || item.url,
          url: item.url
        });
        continue;
      }
      if (item instanceof TabGroup) {
        const tabGroupFolderData = {
          type: "tabgroup",
          title: item.title || BOOKMARKS_EMPTY_TAB_GROUP_TITLE,
          color: item.color || BOOKMARKS_EMPTY_TAB_GROUP_COLOR
        };
        const tabGroupFolder = await chrome.bookmarks.create({
          parentId: windowFolder.id,
          title: JSON.stringify(tabGroupFolderData)
        });
        if (!tabGroupFolder.id) throw new Error("Failed to create tab group folder");
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
async function syncWindows() {
  const windowGroup = await getOpenedWindows();
  await bookmarkWindows(windowGroup);
}
const SYNC_ALARM_NAME = "syncWindows";
const SYNC_INTERVAL_MINUTES = 1;
chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name === SYNC_ALARM_NAME) {
    try {
      const syncEnabled = await chrome.storage.local.get("syncEnabled");
      if (!syncEnabled.syncEnabled) return;
      await syncWindows();
    } catch (error) {
      console.error("Background sync failed:", error);
    }
  }
});
chrome.alarms.create(SYNC_ALARM_NAME, {
  periodInMinutes: SYNC_INTERVAL_MINUTES
});
chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true });
