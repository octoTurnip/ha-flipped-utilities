import {
	argbFromHex,
	DynamicColor,
	Hct,
	hexFromArgb,
	MaterialDynamicColors,
} from '@material/material-color-utilities';

import { colors, logStyles } from '../models/constants/colors';
import { inputs } from '../models/constants/inputs';
import { HassElement } from '../models/interfaces';
import { querySelectorAsync } from './async';
import {
	debugToast,
	getHomeAssistantMainAsync,
	getSchemeInfo,
	getToken,
} from './common';

/* Generate and set theme colors based on user defined inputs */
export async function setTheme(target: HTMLElement) {
	const hass = (document.querySelector('home-assistant') as HassElement).hass;

	try {
		// Setup inputs
		const userId = hass.user?.id;
		const colorInputUserId = `${inputs.base_color.input}_${userId}`;
		const schemeInputUserId = `${inputs.scheme.input}_${userId}`;
		const contrastInputUserId = `${inputs.contrast.input}_${userId}`;

		const html = await querySelectorAsync(document, 'html');

		const themeName = hass?.themes?.theme ?? '';
		if (themeName.includes('Material You')) {
			// Fix explicit html background color
			html?.style.setProperty(
				'background-color',
				'var(--md-sys-color-surface)',
			);

			let baseColor =
				hass.states[colorInputUserId]?.state?.trim() ||
				hass.states[inputs.base_color.input]?.state?.trim() ||
				'';

			const schemeName =
				hass.states[schemeInputUserId]?.state?.trim() ||
				hass.states[inputs.scheme.input]?.state?.trim() ||
				'';

			let contrastLevel: number = inputs.contrast.default as number;
			for (const value of [
				hass.states[contrastInputUserId]?.state,
				hass.states[inputs.contrast.input]?.state,
			]) {
				const parsed = parseFloat(value);
				if (!isNaN(parsed)) {
					contrastLevel = Math.max(Math.min(parsed, 1), -1);
					break;
				}
			}

			// Only update if one of the inputs is set
			if (baseColor || schemeName || contrastLevel) {
				baseColor ||= inputs.base_color.default as string;
				const schemeInfo = getSchemeInfo(schemeName);

				for (const mode of ['light', 'dark']) {
					const scheme = new schemeInfo.class(
						Hct.fromInt(argbFromHex(baseColor)),
						mode == 'dark',
						contrastLevel,
					);

					for (const color of colors) {
						const hex = hexFromArgb(
							(
								MaterialDynamicColors[color] as DynamicColor
							).getArgb(scheme),
						);
						const token = getToken(color);
						target.style.setProperty(
							`--md-sys-color-${token}-${mode}`,
							hex,
						);
					}
				}

				const message = `Material design system colors updated using base color ${baseColor}, scheme ${schemeInfo.label}, and contrast level ${contrastLevel}.`;
				console.info(`%c ${message} `, logStyles());
				debugToast(message);
			} else {
				await unsetTheme();
			}
		}
	} catch (e) {
		console.error(e);
		debugToast(String(e));
		await unsetTheme();
	}

	// Update companion app app and navigation bar colors
	const msg = { type: 'theme-update' };
	if (window.externalApp) {
		window.externalApp.externalBus(JSON.stringify(msg));
	} else if (window.webkit) {
		window.webkit.messageHandlers.externalBus.postMessage(msg);
	}
}

/**
 * Get targets to apply or remove theme colors to/from
 * @returns {HTMLElement[]} HTML Elements to apply/remove theme to/from
 */
export async function getTargets(): Promise<HTMLElement[]> {
	const targets: HTMLElement[] = [
		(await querySelectorAsync(document, 'html')) as HTMLElement,
	];

	// Add-ons and HACS iframe
	const ha = await getHomeAssistantMainAsync();
	const iframe = ha.shadowRoot
		?.querySelector('iframe')
		?.contentWindow?.document?.querySelector('body');
	if (iframe) {
		targets.push(iframe);
	}
	return targets;
}

/* Remove theme colors */
export async function unsetTheme() {
	const targets = await getTargets();
	for (const color of colors) {
		for (const target of targets) {
			const token = getToken(color);
			target?.style.removeProperty(`--md-sys-color-${token}-light`);
			target?.style.removeProperty(`--md-sys-color-${token}-dark`);
		}
	}
	const message = 'Material design system colors removed.';
	console.info(`%c ${message} `, logStyles());
	debugToast(message);
}

/** Call setTheme on all valid available targets */
export async function setThemeAll() {
	const targets = await getTargets();
	for (const target of targets) {
		setTheme(target);
	}
}
