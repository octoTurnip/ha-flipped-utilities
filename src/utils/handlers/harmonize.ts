import {
	argbFromHex,
	argbFromRgb,
	Blend,
	hexFromArgb,
} from '@material/material-color-utilities';
import { getEntityIdAndValue } from '.';
import { semanticColors } from '../../models/constants/colors';
import { inputs } from '../../models/constants/inputs';
import { THEME_NAME } from '../../models/constants/theme';
import { HassElement } from '../../models/interfaces';
import { IHandlerArguments } from '../../models/interfaces/Input';
import { getToken } from '../common';
import { debugToast, mdLog } from '../logging';
import { getTargets } from './colors';

/**
 * Harmonize semantic colors to be closer to the base color
 * https://m3.material.io/blog/dynamic-color-harmony
 */
export async function harmonize(args: IHandlerArguments) {
	const hass = (document.querySelector('home-assistant') as HassElement).hass;
	const targets = args.targets ?? (await getTargets());

	try {
		const themeName = hass?.themes?.theme ?? '';
		if (themeName.includes(THEME_NAME)) {
			const value =
				getEntityIdAndValue('harmonize', args.id).value || 'off';

			if (value != 'on') {
				dissonance(args);
				return;
			}

			// Get base color
			const baseColorHex =
				getComputedStyle(targets[0]).getPropertyValue(
					'--primary-color',
				) || (inputs.base_color.default as string);
			let baseColorArgb: number;
			if (baseColorHex.startsWith('rgb')) {
				const [r, g, b] = baseColorHex
					.replace('rgb(', '')
					.replace(')', '')
					.replace(/ /g, ',')
					.split(',')
					.map((c) => parseInt(c));
				baseColorArgb = argbFromRgb(r, g, b);
			} else {
				baseColorArgb = argbFromHex(baseColorHex);
			}

			for (const color in semanticColors) {
				const harmonizedColor = hexFromArgb(
					Blend.harmonize(
						argbFromHex(semanticColors[color]),
						baseColorArgb,
					),
				);

				const token = getToken(color);
				for (const target of targets) {
					target.style.setProperty(
						`--md-sys-color-${token}`,
						harmonizedColor,
					);
				}
			}

			mdLog(targets[0], 'Semantic colors harmonized.', true);
		} else {
			await dissonance(args);
		}
	} catch (e) {
		console.error(e);
		debugToast(String(e));
		dissonance(args);
	}
}

async function dissonance(args: IHandlerArguments) {
	const targets = args.targets ?? (await getTargets());
	if (
		targets.some((target) =>
			target.style.getPropertyValue('--md-sys-color-red'),
		)
	) {
		for (const color in semanticColors) {
			for (const target of targets) {
				const token = getToken(color);
				target?.style.removeProperty(`--md-sys-color-${token}`);
			}
		}
		mdLog(targets[0], 'Harmonized colors removed.', true);
	}
}
