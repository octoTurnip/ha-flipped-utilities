import packageInfo from '../package.json';
import { MaterialYouConfigCard } from './classes/material-you-config-card';
import { MaterialYouPanel } from './classes/material-you-panel';

import { THEME_NAME } from './models/constants/inputs';
import { getAsync, querySelectorAsync } from './utils/async';
import { setCardType } from './utils/cards';
import { setTheme } from './utils/colors';
import { getHomeAssistantMainAsync } from './utils/common';
import { setBaseColorFromImage } from './utils/image';
import { mdLog } from './utils/logging';
import { hideNavbar } from './utils/navbar';
import { setStyles } from './utils/styles';
import { setupSubscriptions } from './utils/subscriptions';

async function main() {
	if (window.MaterialYouInit) {
		return;
	}
	window.MaterialYouInit = true;

	// Set styles on main window custom elements
	// Do this before anything else because it's time sensitive
	setStyles(window);

	mdLog(
		document.querySelector('html') as HTMLElement,
		`Material You Utilities v${packageInfo.version}`,
	);

	// Apply colors and styles on iframe when it's added
	const haMain = await getHomeAssistantMainAsync();
	const observer = new MutationObserver(async (mutations) => {
		for (const mutation of mutations) {
			for (const addedNode of mutation.addedNodes) {
				if (addedNode.nodeName == 'IFRAME') {
					const iframe = (await querySelectorAsync(
						haMain.shadowRoot as ShadowRoot,
						'iframe',
					)) as HTMLIFrameElement;
					const contentWindow = await getAsync(
						iframe,
						'contentWindow',
					);
					setStyles(contentWindow);

					const document = await getAsync(contentWindow, 'document');
					const body = await querySelectorAsync(document, 'body');
					setTheme({ targets: [body] });
					setCardType({ targets: [body] });
				}
			}
		}
	});
	observer.observe(haMain.shadowRoot as ShadowRoot, {
		subtree: true,
		childList: true,
	});

	// Define Material You Panel custom element
	customElements.define('material-you-config-card', MaterialYouConfigCard);
	customElements.define('material-you-panel', MaterialYouPanel);

	// Set user theme colors and card type
	const setOnFirstLoad = async (ms: number) => {
		if (ms > 10000) {
			return;
		}

		const theme = haMain.hass?.themes?.theme;
		if (!theme) {
			setTimeout(() => {
				setOnFirstLoad(ms);
			}, 2 * ms);
			return;
		}

		if (theme.includes(THEME_NAME)) {
			const html = await querySelectorAsync(document, 'html');
			await setBaseColorFromImage({});
			await setTheme({ targets: [html] });
			await setCardType({ targets: [html] });
			hideNavbar({});
		}
	};
	setOnFirstLoad(100);

	const setupThemeChangeSubscriptions = async () => {
		const hass = (await getHomeAssistantMainAsync()).hass;
		const userId = hass.user?.id;

		if (hass.connection.connected && userId) {
			if (hass.user?.is_admin) {
				// Trigger on theme changed event
				hass.connection.subscribeEvents(
					() => setTheme({}),
					'themes_updated',
				);

				// Trigger on set theme service call
				hass.connection.subscribeEvents((e: Record<string, any>) => {
					if (e?.data?.service == 'set_theme') {
						setTimeout(() => setTheme({}), 1000);
					}
				}, 'call_service');
			}
			return;
		}
		setTimeout(() => setupThemeChangeSubscriptions(), 100);
	};

	setupSubscriptions({});
	setupThemeChangeSubscriptions();
}

main();
