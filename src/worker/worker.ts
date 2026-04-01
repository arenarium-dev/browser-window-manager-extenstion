import { syncWindows, pruneWindows, STORAGE_SYNC_KEY } from '../lib/core/chrome';

const SYNC_ALARM_NAME = 'syncWindows';
const SYNC_INTERVAL_MINUTES = 10;

const PRUNE_COUNT = 10;

// Handle alarm events
chrome.alarms.onAlarm.addListener(async (alarm) => {
	// If the alarm is the sync alarm, perform the sync
	if (alarm.name === SYNC_ALARM_NAME) {
		try {
			// Check if sync is enabled
			const syncEnabled = await chrome.storage.local.get(STORAGE_SYNC_KEY);
			if (!syncEnabled.syncEnabled) return;

			// Sync the windows
			await syncWindows();
			// Prune the windows
			await pruneWindows(PRUNE_COUNT);
		} catch (error) {
			console.error('Background sync failed:', error);
		}
	}
});

chrome.alarms.create(SYNC_ALARM_NAME, {
	periodInMinutes: SYNC_INTERVAL_MINUTES
});

chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true });
