import {
	argbFromHex,
	hexFromArgb,
	TonalPalette,
} from '@material/material-color-utilities';
import { getToken } from '../common';

const TONES = [5, 10, 20, 30, 40, 50, 60, 70, 80, 90, 95];

/* Set palette based on color */
export async function setPalette(colors: string[], targets: HTMLElement[]) {
	const style = getComputedStyle(targets[0]);

	for (const color of colors) {
		let token = `--${getToken(color)}-color`;
		const baseColor = style.getPropertyValue(token);
		const palette = TonalPalette.fromInt(argbFromHex(baseColor));
		token = `--md-sys-color-${getToken(color)}`;
		for (const tone of TONES) {
			const prop = `${token}-${tone.toString().padStart(2, '0')}`;
			const hex = hexFromArgb(palette.tone(tone));
			for (const target of targets) {
				target.style.setProperty(prop, hex);
			}
		}
	}
}

/* Remove palette */
export async function unsetPalette(colors: string[], targets: HTMLElement[]) {
	for (const color of colors) {
		const token = `--md-sys-color-${getToken(color)}`;
		for (const tone of TONES) {
			const prop = `${token}-${tone.toString().padStart(2, '0')}`;
			for (const target of targets) {
				target.style.removeProperty(prop);
			}
		}
	}
}
