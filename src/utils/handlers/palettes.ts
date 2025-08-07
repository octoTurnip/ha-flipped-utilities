import {
	argbFromHex,
	hexFromArgb,
	TonalPalette,
} from '@material/material-color-utilities';
import { THEME_TOKEN } from '../../models/constants/theme';
import { getToken } from '../common';
import { applyStyles, buildStylesString } from './styles';

const TONES = [5, 10, 20, 30, 40, 50, 60, 70, 80, 90, 95];
const STYLE_ID = `${THEME_TOKEN}-palettes`;

/* Set palette based on color */
export async function setPalette(targets: HTMLElement[], colors: string[]) {
	const style = getComputedStyle(targets[0]);

	const styles: Record<string, string> = {};
	for (const color of colors) {
		let token = `--${getToken(color)}-color`;
		const baseColor = style.getPropertyValue(token);
		const palette = TonalPalette.fromInt(argbFromHex(baseColor));
		token = `--md-sys-color-${getToken(color)}`;
		for (const tone of TONES) {
			const prop = `${token}-${tone.toString().padStart(2, '0')}`;
			const hex = hexFromArgb(palette.tone(tone));
			styles[prop] = hex;
		}
	}

	for (const target of targets) {
		applyStyles(target, STYLE_ID, buildStylesString(styles));
	}
}

/* Remove palette */
export async function unsetPalette(targets: HTMLElement[]) {
	for (const target0 of targets) {
		const target = target0.shadowRoot || target0;
		const style = target.querySelector(`#${STYLE_ID}`);
		if (style) {
			target.removeChild(style);
		}
	}
}
