import packageInfo from '../package.json';
import { MaterialYouConfigCard } from './classes/material-you-config-card';
import { MaterialYouPanel } from './classes/material-you-panel';

import { THEME_NAME, THEME_TOKEN } from './models/constants/theme';
import { getAsync, querySelectorAsync } from './utils/async';
import { getHomeAssistantMainAsync } from './utils/common';
import { setCardType } from './utils/handlers/cards';
import { setCSSFromFile } from './utils/handlers/css';
import { setBaseColorFromImage } from './utils/handlers/image';
import { hideNavbar } from './utils/handlers/navbar';
import { setStyles } from './utils/handlers/styles';
import { setTheme } from './utils/handlers/theme';
import { mdLog } from './utils/logging';
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
		`${THEME_NAME} Utilities v${packageInfo.version}`,
	);

	// Call handlers on iframe when it's added
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
					const args = { targets: [body] };
					const handlers = [setTheme, setCardType, setCSSFromFile];
					for (const handler of handlers) {
						await handler(args);
					}
				}
			}
		}
	});
	observer.observe(haMain.shadowRoot as ShadowRoot, {
		subtree: true,
		childList: true,
	});

	// Define Material You Panel custom element
	customElements.define(`${THEME_TOKEN}-config-card`, MaterialYouConfigCard);
	customElements.define(`${THEME_TOKEN}-panel`, MaterialYouPanel);

	// Call handlers on first load
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
			const args = { targets: [html] };
			const handlers = [
				setBaseColorFromImage,
				setTheme,
				setCardType,
				setCSSFromFile,
				hideNavbar,
			];
			for (const handler of handlers) {
				await handler(args);
			}
		}
	};
	setOnFirstLoad(100);

	// Call handlers on visibility change
	document.addEventListener('visibilitychange', async () => {
		if (!document.hidden) {
			const handlers = [setTheme, setCardType, setCSSFromFile];
			for (const handler of handlers) {
				await handler({});
			}
		}
	});

	setupSubscriptions({});

	const setupThemeChangeSubscriptions = async () => {
		const hass = (await getHomeAssistantMainAsync()).hass;
		const userId = hass.user?.id;

		if (hass.connection.connected && userId) {
			// Trigger on theme changed event
			hass.connection.subscribeEvents(
				() => setTheme({}),
				'themes_updated',
			);
			if (hass.user?.is_admin) {
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
	setupThemeChangeSubscriptions();
}

main();
