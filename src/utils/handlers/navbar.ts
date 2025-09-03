import { hideNavigationBar } from '../../css';
import { THEME_NAME, THEME_TOKEN } from '../../models/constants/theme';
import { HassElement } from '../../models/interfaces';
import { IHandlerArguments } from '../../models/interfaces/Input';
import { getEntityIdAndValue } from '../common';
import { debugToast, mdLog } from '../logging';
import { applyStyles, loadStyles } from './styles';

const STYLE_ID = `${THEME_TOKEN}-navbar`;

/** Hide the navigation bar */
export async function hideNavbar(args: IHandlerArguments) {
	const hass = (document.querySelector('home-assistant') as HassElement).hass;

	try {
		const themeName = hass?.themes?.theme ?? '';
		if (themeName.includes(THEME_NAME)) {
			const value = getEntityIdAndValue('navbar', args.id).value || 'on';
			if (value == 'on') {
				showNavbar();
				return;
			}

			const html = document.querySelector('html') as HTMLElement;
			applyStyles(html, STYLE_ID, loadStyles(hideNavigationBar));

			mdLog(html, 'Navigation bar hidden.', true);
		} else {
			showNavbar();
		}
	} catch (e) {
		console.error(e);
		debugToast(String(e));
		showNavbar();
	}
}

async function showNavbar() {
	const html = document.querySelector('html') as HTMLElement;
	const style = html?.querySelector(`#${STYLE_ID}`);
	if (style) {
		html?.removeChild(style);
		mdLog(html, 'Navigation bar unhidden.', true);
	}
}
