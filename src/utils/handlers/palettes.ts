import {
	argbFromHex,
	hexFromArgb,
	TonalPalette,
} from '@material/material-color-utilities';
import { getTargets, unset } from '.';
import { THEME_TOKEN } from '../../models/constants/theme';
import { IHandlerArguments } from '../../models/interfaces/Input';
import { getToken } from '../common';
import { applyStyles, buildStylesString } from './styles';

const TONES = [5, 10, 20, 30, 40, 50, 60, 70, 80, 90, 95];
const STYLE_ID = `${THEME_TOKEN}-palettes`;

/* Set palette based on color */
export async function setPalette(args: IHandlerArguments, colors: string[]) {
	const targets = args.targets ?? (await getTargets());
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
export async function unsetPalette(args: IHandlerArguments) {
	await unset(args, STYLE_ID);
}
