import { cardTypes } from '../css';
import { inputs } from '../models/constants/inputs';
import { HassElement } from '../models/interfaces';
import { getTargets } from './colors';
import { debugToast, mdLog } from './logging';
import { loadStyles } from './styles';

/** Change ha-card styles to match the selected card type */
export async function setCardType(target: HTMLElement) {
	const hass = (document.querySelector('home-assistant') as HassElement).hass;

	try {
		let hasStyleTag = true;
		let style = target.querySelector('#material-you-card-type');
		if (!style) {
			hasStyleTag = false;
			style = document.createElement('style');
			style.id = 'material-you-card-type';
		}

		// Get value
		let value = '';
		const ids = [window.browser_mod?.browserID, hass.user?.id, ''];
		for (const id of ids) {
			if (id == undefined) {
				continue;
			}

			value =
				hass.states[`${inputs.card_type.input}${id ? `_${id}` : ''}`]
					?.state;

			if (value in cardTypes) {
				break;
			}
		}

		if (!(value in cardTypes)) {
			if (hasStyleTag) {
				target.removeChild(style);
				const message =
					'Material design card type set to default (elevated).';
				mdLog(message, true);
			}
			return;
		}

		style.textContent = loadStyles(cardTypes[value]);
		if (!hasStyleTag) {
			target.appendChild(style);
		}

		const message = `Material design card type set to ${value}.`;
		mdLog(message, true);
	} catch (e) {
		console.error(e);
		debugToast(String(e));
	}
}

/** Call setCardType on all valid available targets */
export async function setCardTypeAll() {
	const targets = await getTargets();
	for (const target of targets) {
		setCardType(target);
	}
}
