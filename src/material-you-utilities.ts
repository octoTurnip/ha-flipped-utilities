import packageInfo from '../package.json';
import { MaterialYouPanel } from './classes/material-you-panel';

import { inputs, THEME_NAME } from './models/constants/inputs';
import { RenderTemplateError, RenderTemplateResult } from './models/interfaces';
import { getAsync, querySelectorAsync } from './utils/async';
import { setCardType, setCardTypeAll } from './utils/cards';
import { setTheme, setThemeAll } from './utils/colors';
import { getHomeAssistantMainAsync } from './utils/common';
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

	mdLog(`Material You Utilities v${packageInfo.version}`);

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
				inputs.base_color.input,
				inputs.scheme.input,
				inputs.contrast.input,
				inputs.spec.input,
				inputs.platform.input,
				`${inputs.base_color.input}_${userId}`,
				`${inputs.scheme.input}_${userId}`,
				`${inputs.contrast.input}_${userId}`,
				`${inputs.spec.input}_${userId}`,
				`${inputs.platform.input}_${userId}`,
			];
			const imageUrlInputs = [
				inputs.image_url.input,
				`${inputs.image_url.input}_${userId}`,
			];
			const styleInputs = [
				inputs.card_type.input,
				`${inputs.card_type.input}_${userId}`,
			];
			if (deviceId) {
				colorThemeInputs.push(
					...[
						`${inputs.base_color.input}_${deviceId}`,
						`${inputs.scheme.input}_${deviceId}`,
						`${inputs.contrast.input}_${deviceId}`,
						`${inputs.spec.input}_${deviceId}`,
						`${inputs.platform.input}_${deviceId}`,
					],
				);
				imageUrlInputs.push(`${inputs.image_url.input}_${deviceId}`);
				styleInputs.push(`${inputs.card_type.input}_${deviceId}`);
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
