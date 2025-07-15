import { getEntityIdAndValue, loadStyles } from '.';
import { THEME_NAME, THEME_TOKEN } from '../../models/constants/theme';
import { HassElement } from '../../models/interfaces';
import { IHandlerArguments } from '../../models/interfaces/Input';
import { debugToast, mdLog } from '../logging';
import { getTargets } from './colors';

const styleId = `${THEME_TOKEN}-user-styles`;

export async function setCSSFromFile(args: IHandlerArguments) {
	const hass = (document.querySelector('home-assistant') as HassElement).hass;
	const targets = args.targets ?? (await getTargets());

	try {
		const themeName = hass?.themes?.theme ?? '';
		if (themeName.includes(THEME_NAME)) {
			// Do not fetch if no path/url is set
			let url = getEntityIdAndValue('css_file', args.id)[1];
			if (!url) {
				unsetCSSFromFile(args);
				return;
			}

			// Get full URL if local path given
			let r: Response;
			if (url.includes('://')) {
				r = await hass.fetchWithAuth(url, { mode: 'cors' });
			} else {
				r = await fetch(url, { mode: 'cors' });
			}
			const styles = loadStyles(await r.text());

			// Add style link to targets
			for (const target0 of targets) {
				const target = target0.shadowRoot || target0;

				let hasStyleTag = true;
				let style = target.querySelector(
					`#${styleId}`,
				) as HTMLStyleElement;
				if (!style) {
					hasStyleTag = false;
					style = document.createElement('style');
					style.id = styleId;
				}

				style.textContent = styles;
				if (!hasStyleTag) {
					target.appendChild(style);
				}
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
	const targets = args.targets ?? (await getTargets());
	let log = false;
	for (const target0 of targets) {
		const target = target0.shadowRoot || target0;
		const link = target.querySelector(`#${styleId}`);
		if (link) {
			log = true;
			target.removeChild(link);
		}
	}
	if (log) {
		mdLog(targets[0], 'CSS styles from file removed.', true);
	}
}
