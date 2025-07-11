import { getEntityIdAndValue } from '.';
import { hideNavigationBar } from '../../css';
import { THEME_NAME } from '../../models/constants/inputs';
import { HassElement } from '../../models/interfaces';
import { IHandlerArguments } from '../../models/interfaces/Input';
import { debugToast, mdLog } from '../logging';
import { loadStyles } from './styles';

const styleId = 'material-you-navbar';

/** Hide the navigation bar */
export async function hideNavbar(args: IHandlerArguments) {
	const hass = (document.querySelector('home-assistant') as HassElement).hass;

	try {
		const themeName = hass?.themes?.theme ?? '';
		if (themeName.includes(THEME_NAME)) {
			const value = getEntityIdAndValue('navbar', args.id)[1];
			if ((value ?? 'on') == 'on') {
				showNavbar();
				return;
			}

			const html = document.querySelector('html') as HTMLElement;
			let style = html.querySelector(`#${styleId}`);
			if (!style) {
				style = document.createElement('style');
				style.id = styleId;
				html.appendChild(style);
			}
			style.textContent = loadStyles(hideNavigationBar);

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

export async function showNavbar() {
	const html = document.querySelector('html') as HTMLElement;
	const style = html?.querySelector(`#${styleId}`);
	if (style) {
		html?.removeChild(style);
		mdLog(html, 'Navigation bar unhidden.', true);
	}
}
