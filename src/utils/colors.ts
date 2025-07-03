import {
	argbFromHex,
	DynamicColor,
	Hct,
	hexFromArgb,
	MaterialDynamicColors,
	Platform,
} from '@material/material-color-utilities';

import { SpecVersion } from '@material/material-color-utilities/dynamiccolor/color_spec';
import { colors } from '../models/constants/colors';
import { inputs, THEME_NAME } from '../models/constants/inputs';
import { HassElement } from '../models/interfaces';
import { InputField } from '../models/interfaces/Panel';
import { querySelectorAsync } from './async';
import { getHomeAssistantMainAsync, getSchemeInfo, getToken } from './common';
import { debugToast, mdLog } from './logging';

/* Generate and set theme colors based on user defined inputs */
export async function setTheme(target: HTMLElement) {
	const hass = (document.querySelector('home-assistant') as HassElement).hass;

	try {
		const html = await querySelectorAsync(document, 'html');

		const themeName = hass?.themes?.theme ?? '';
		if (themeName.includes(THEME_NAME)) {
			// Fix explicit html background color
			html?.style.setProperty(
				'background-color',
				'var(--md-sys-color-surface)',
			);

			// Setup input values
			const values: Partial<Record<InputField, string | number>> = {
				base_color: '',
				scheme: '',
				contrast: '',
				spec: '',
				platform: '',
			};
			const ids = [
				window.browser_mod?.browserID?.replace(/-/g, '_'),
				hass.user?.id,
				'',
			];
			for (const id of ids) {
				if (id == undefined) {
					continue;
				}

				for (const field in values) {
					if (
						values[field as InputField] ||
						values[field as InputField] === 0
					) {
						continue;
					}
					values[field as InputField] =
						hass.states[
							`${inputs[field as InputField].input}${id ? `_${id}` : ''}`
						]?.state?.trim();
				}
			}

			// Only update if one of the inputs is set
			if (
				values.base_color ||
				values.scheme ||
				values.contrast ||
				values.spec ||
				values.platform
			) {
				values.base_color ||= inputs.base_color.default as string;
				values.scheme ||= inputs.scheme.default as string;
				values.contrast ??= inputs.contrast.default as number;
				values.spec ||= inputs.spec.default as string;
				values.platform ||= inputs.platform.default as string;

				const schemeInfo = getSchemeInfo(values.scheme as string);

				for (const mode of ['light', 'dark']) {
					const scheme = new schemeInfo.class(
						Hct.fromInt(argbFromHex(values.base_color as string)),
						mode == 'dark',
						parseFloat(values.contrast as string),
						values.spec as SpecVersion,
						values.platform as Platform,
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
				mdLog(
					`Material design system colors updated.\nBase Color - ${values.base_color} | Scheme - ${schemeInfo.label} | Contrast Level - ${values.contrast} | Specification Version - ${values.spec} | Platform - ${(values.platform as string)[0].toUpperCase()}${(values.platform as string).slice(1)}`,
					true,
				);
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
	mdLog('Material design system colors removed.', true);
}

/** Call setTheme on all valid available targets */
export async function setThemeAll() {
	const targets = await getTargets();
	for (const target of targets) {
		setTheme(target);
	}
}
