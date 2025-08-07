import {
	argbFromHex,
	DynamicColor,
	Hct,
	hexFromArgb,
	MaterialDynamicColors,
	Platform,
} from '@material/material-color-utilities';

import { SpecVersion } from '@material/material-color-utilities/dynamiccolor/color_spec';
import { getEntityIdAndValue, getTargets } from '.';
import { colors } from '../../models/constants/colors';
import { inputs } from '../../models/constants/inputs';
import { THEME_NAME } from '../../models/constants/theme';
import { HassElement } from '../../models/interfaces';
import { IHandlerArguments, InputField } from '../../models/interfaces/Input';
import { querySelectorAsync } from '../async';
import { getSchemeInfo, getToken } from '../common';
import { debugToast, mdLog } from '../logging';
import { harmonize } from './harmonize';
import { setPalette, unsetPalette } from './palettes';

/* Generate and set theme colors based on user defined inputs */
export async function setTheme(args: IHandlerArguments) {
	const hass = (document.querySelector('home-assistant') as HassElement).hass;
	const targets = args.targets ?? (await getTargets());

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
			const fields = [
				'base_color',
				'scheme',
				'contrast',
				'spec',
				'platform',
			];
			const values: Partial<Record<InputField, string | number>> = {};
			for (const field of fields) {
				values[field as InputField] = getEntityIdAndValue(
					field as InputField,
					args.id,
				).value as string | number;
			}

			// Only update if one of the inputs is set
			if (fields.some((field) => values[field as InputField] != '')) {
				for (const field in values) {
					values[field as InputField] ||=
						inputs[field as InputField].default;
				}

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
						for (const target of targets) {
							target.style.setProperty(
								`--md-sys-color-${token}-${mode}`,
								hex,
							);
						}
					}

					setPalette('primary', targets);
				}

				mdLog(
					targets[0] as HTMLElement,
					`Material design system colors updated.\nBase Color - ${values.base_color} | Scheme - ${schemeInfo.label} | Contrast Level - ${values.contrast} | Specification Version - ${values.spec} | Platform - ${(values.platform as string)[0].toUpperCase()}${(values.platform as string).slice(1)}`,
					true,
				);

				harmonize(args);
			} else {
				await unsetTheme(args);
			}
		}
	} catch (e) {
		console.error(e);
		debugToast(String(e));
		await unsetTheme(args);
	}

	// Update companion app app and navigation bar colors
	const msg = { type: 'theme-update' };
	if (window.externalApp) {
		window.externalApp.externalBus(JSON.stringify(msg));
	} else if (window.webkit) {
		window.webkit.messageHandlers.externalBus.postMessage(msg);
	}
}

/* Remove theme colors */
async function unsetTheme(args: IHandlerArguments) {
	const targets = args.targets ?? (await getTargets());
	if (
		targets.some((target) =>
			target.style.getPropertyValue('--md-sys-color-primary-light'),
		)
	) {
		for (const color of colors) {
			for (const target of targets) {
				const token = getToken(color);
				target?.style.removeProperty(`--md-sys-color-${token}-light`);
				target?.style.removeProperty(`--md-sys-color-${token}-dark`);
			}
		}
		mdLog(targets[0], 'Material design system colors removed.', true);
	}

	unsetPalette('primary', targets);
}
