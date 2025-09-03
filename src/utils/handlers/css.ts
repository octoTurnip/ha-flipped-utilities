import { unset } from '.';
import { THEME_NAME, THEME_TOKEN } from '../../models/constants/theme';
import { HassElement } from '../../models/interfaces';
import { IHandlerArguments } from '../../models/interfaces/Input';
import { getEntityIdAndValue, getTargets } from '../common';
import { debugToast } from '../logging';
import { harmonize } from './harmonize';
import { applyStyles, loadStyles } from './styles';

const STYLE_ID = `${THEME_TOKEN}-user-styles`;

export async function setCSSFromFile(args: IHandlerArguments) {
	const hass = (document.querySelector('home-assistant') as HassElement).hass;
	const targets = args.targets ?? (await getTargets());

	try {
		const themeName = hass?.themes?.theme ?? '';
		if (themeName.includes(THEME_NAME)) {
			// Do not fetch if no path/url is set
			let url = getEntityIdAndValue('css_file', args.id).value as string;
			if (!url) {
				unsetCSSFromFile(args);
				return;
			}

			// Get full URL if local path given
			let r: Response;
			if (url.includes('://')) {
				r = await fetch(url, { mode: 'cors' });
			} else {
				r = await hass.fetchWithAuth(url, { mode: 'cors' });
			}
			if (!r.ok) {
				throw new Error(await r.text());
			}
			const styles = loadStyles(await r.text());

			// Add style link to targets
			for (const target of targets) {
				applyStyles(target, STYLE_ID, styles);
			}

			// Harmonize if styles includes changes to primary color
			if (
				styles.includes('--primary-color') ||
				styles.includes('--md-sys-color-primary')
			) {
				harmonize(args);
			}
		} else {
			unsetCSSFromFile(args);
		}
	} catch (e) {
		console.error(e);
		debugToast(String(e));
		unsetCSSFromFile(args);
	}
}

async function unsetCSSFromFile(args: IHandlerArguments) {
	await unset(args, STYLE_ID, 'CSS styles from file removed.');
	await harmonize(args);
}
