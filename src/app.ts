import { mount } from 'svelte';

import './app.css';
import App from './app.svelte';

import { ICON_NAMES } from '$lib/components/icon/names';

// Add Material Symbols Rounded icons to the document head
const icons = Array.from(ICON_NAMES);
icons.sort();
const iconsString = icons.join(',');

const iconsUrl = `https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:wght,FILL@100..700,0..1&icon_names=${iconsString}&display=block`;
const iconsLinkElement = document.createElement('link');
iconsLinkElement.rel = 'stylesheet';
iconsLinkElement.href = iconsUrl;
window.document.head.appendChild(iconsLinkElement);

// Mount the Svelte app
const app = mount(App, {
	target: document.getElementById('app')!
});

// Export the app instance
export default app;
