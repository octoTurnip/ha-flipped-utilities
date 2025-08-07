import {
	argbFromHex,
	hexFromArgb,
	TonalPalette,
} from '@material/material-color-utilities';

const TONES = [5, 10, 20, 30, 40, 50, 60, 70, 80, 90, 95];

/* Set palette based on color */
export async function setPalette(name: string, targets: HTMLElement[]) {
	const color = getComputedStyle(targets[0]).getPropertyValue(
		`--md-sys-color-${name}`,
	);
	const palette = TonalPalette.fromInt(argbFromHex(color));
	for (const tone of TONES) {
		const hex = hexFromArgb(palette.tone(tone));
		for (const target of targets) {
			target.style.setProperty(
				`--md-sys-color-${name}-${tone.toString().padStart(2, '0')}`,
				hex,
			);
		}
	}
}

/* Remove palette */
export async function unsetPalette(name: string, targets: HTMLElement[]) {
	for (const tone of TONES) {
		for (const target of targets) {
			target.style.removeProperty(
				`--md-sys-color-${name}-${tone.toString().padStart(2, '0')}`,
			);
		}
	}
}
