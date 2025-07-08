import { hideNavigationBar } from '../css';
import { THEME_NAME } from '../models/constants/inputs';
import { HassElement } from '../models/interfaces';
import { IHandlerArguments } from '../models/interfaces/Input';
import { getEntityId } from './common';
import { debugToast, mdLog } from './logging';
import { loadStyles } from './styles';

const styleId = 'material-you-navbar';

/** Hide the navigation bar */
export async function hideNavbar(args: IHandlerArguments) {
	const hass = (document.querySelector('home-assistant') as HassElement).hass;

	try {
		const themeName = hass?.themes?.theme ?? '';
		if (themeName.includes(THEME_NAME)) {
			// Get value
			let value = '';
			const ids = [
				args.id,
				window.browser_mod?.browserID?.replace(/-/g, '_'),
				hass.user?.id,
				'',
			];
			for (const id of ids) {
				if (id == undefined) {
					continue;
				}

				value = hass.states[getEntityId('navbar', id)]?.state;
				if (value) {
					break;
				}
			}

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
