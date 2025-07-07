import packageInfo from '../package.json';
import { MaterialYouConfigCard } from './classes/material-you-config-card';
import { MaterialYouPanel } from './classes/material-you-panel';

import { THEME_NAME } from './models/constants/inputs';
import { RenderTemplateError, RenderTemplateResult } from './models/interfaces';
import { getAsync, querySelectorAsync } from './utils/async';
import { setCardType, setCardTypeAll } from './utils/cards';
import { setTheme, setThemeAll } from './utils/colors';
import { getEntityId, getHomeAssistantMainAsync } from './utils/common';
import { setBaseColorFromImage } from './utils/image';
import { debugToast, mdLog } from './utils/logging';
import { setStyles } from './utils/styles';

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
					setTheme(body);
					setCardType(body);
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
			await setBaseColorFromImage();
			await setTheme(html);
			await setCardType(html);
		}
	};
	setOnFirstLoad(100);

	const setupSubscriptions = async () => {
		const hass = (await getHomeAssistantMainAsync()).hass;
		const userId = haMain.hass.user?.id;
		const deviceId = window.browser_mod?.browserID?.replace(/-/g, '_');

		if (hass.connection.connected && userId) {
			// User inputs
			const colorThemeInputs = [
				getEntityId('base_color'),
				getEntityId('scheme'),
				getEntityId('contrast'),
				getEntityId('spec'),
				getEntityId('platform'),
				getEntityId('base_color', userId),
				getEntityId('scheme', userId),
				getEntityId('contrast', userId),
				getEntityId('spec', userId),
				getEntityId('platform', userId),
			];
			const imageUrlInputs = [
				getEntityId('image_url'),
				getEntityId('image_url', userId),
			];
			const styleInputs = [
				getEntityId('card_type'),
				getEntityId('card_type', userId),
			];
			if (deviceId) {
				colorThemeInputs.push(
					...[
						getEntityId('base_color', deviceId),
						getEntityId('scheme', deviceId),
						getEntityId('contrast', deviceId),
						getEntityId('spec', deviceId),
						getEntityId('platform', deviceId),
					],
				);
				imageUrlInputs.push(getEntityId('image_url', deviceId));
				styleInputs.push(getEntityId('card_type', deviceId));
			}

			if (hass.user?.is_admin) {
				// Trigger on input change
				hass.connection.subscribeMessage(
					() => setThemeAll(),
					{
						type: 'subscribe_trigger',
						trigger: {
							platform: 'state',
							entity_id: colorThemeInputs,
						},
					},
					{ resubscribe: true },
				);
				hass.connection.subscribeMessage(
					() => setBaseColorFromImage(),
					{
						type: 'subscribe_trigger',
						trigger: {
							platform: 'state',
							entity_id: imageUrlInputs,
						},
					},
					{ resubscribe: true },
				);
				hass.connection.subscribeMessage(
					() => setCardTypeAll(),
					{
						type: 'subscribe_trigger',
						trigger: {
							platform: 'state',
							entity_id: styleInputs,
						},
					},
					{ resubscribe: true },
				);

				// Trigger on theme changed event
				hass.connection.subscribeEvents(
					() => setThemeAll(),
					'themes_updated',
				);

				// Trigger on set theme service call
				hass.connection.subscribeEvents((e: Record<string, any>) => {
					if (e?.data?.service == 'set_theme') {
						setTimeout(() => setThemeAll(), 1000);
					}
				}, 'call_service');
			} else {
				// Trigger on input change using templates
				for (const entityId of colorThemeInputs) {
					hass.connection.subscribeMessage(
						(msg: RenderTemplateResult | RenderTemplateError) => {
							if ('error' in msg) {
								console.error(msg.error);
								debugToast(msg.error);
							}
							setThemeAll();
						},
						{
							type: 'render_template',
							template: `{{ states("${entityId}") }}`,
							entity_ids: entityId,
							report_errors: true,
						},
					);
				}
				for (const entityId of imageUrlInputs) {
					hass.connection.subscribeMessage(
						(msg: RenderTemplateResult | RenderTemplateError) => {
							if ('error' in msg) {
								console.error(msg.error);
								debugToast(msg.error);
							}
							setBaseColorFromImage();
						},
						{
							type: 'render_template',
							template: `{{ states("${entityId}") }}`,
							entity_ids: entityId,
							report_errors: true,
						},
					);
				}
				for (const entityId of styleInputs) {
					hass.connection.subscribeMessage(
						(msg: RenderTemplateResult | RenderTemplateError) => {
							if ('error' in msg) {
								console.error(msg.error);
								debugToast(msg.error);
							}
							setCardTypeAll();
						},
						{
							type: 'render_template',
							template: `{{ states("${entityId}") }}`,
							entity_ids: entityId,
							report_errors: true,
						},
					);
				}
			}
			return;
		}

		setTimeout(() => setupSubscriptions(), 100);
	};
	setupSubscriptions();
}

main();
