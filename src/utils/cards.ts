import { cardTypes } from '../css';
import { inputs, THEME_NAME } from '../models/constants/inputs';
import { HassElement } from '../models/interfaces';
import { getTargets } from './colors';
import { debugToast, mdLog } from './logging';
import { loadStyles } from './styles';

/** Change ha-card styles to match the selected card type */
export async function setCardType(
	target: HTMLElement | ShadowRoot,
	id?: string,
) {
	const hass = (document.querySelector('home-assistant') as HassElement).hass;

	try {
		const themeName = hass?.themes?.theme ?? '';
		if (themeName.includes(THEME_NAME)) {
			let hasStyleTag = true;
			let style = target.querySelector('#material-you-card-type');
			if (!style) {
				hasStyleTag = false;
				style = document.createElement('style');
				style.id = 'material-you-card-type';
			}

			// Get value
			let value = '';
			let ids: (string | undefined)[];
			if (id != undefined) {
				ids = [id];
			} else {
				ids = [
					window.browser_mod?.browserID?.replace(/-/g, '_'),
					hass.user?.id,
					'',
				];
			}
			for (const id of ids) {
				if (id == undefined) {
					continue;
				}

				value =
					hass.states[
						`${inputs.card_type.input}${id ? `_${id}` : ''}`
					]?.state;

				if (value in cardTypes) {
					break;
				}
			}

			if (!(value in cardTypes)) {
				if (hasStyleTag) {
					target.removeChild(style);
					mdLog(
						target instanceof ShadowRoot
							? (target.host as HTMLElement)
							: target,
						'Material design card type set to default (elevated).',
						true,
					);
				}
				return;
			}

			style.textContent = loadStyles(cardTypes[value]);
			if (!hasStyleTag) {
				target.appendChild(style);
			}

			mdLog(
				target instanceof ShadowRoot
					? (target.host as HTMLElement)
					: target,
				`Material design card type set to ${value}.`,
				true,
			);
		} else {
			if (id == undefined) {
				await unsetCardType();
			}
		}
	} catch (e) {
		console.error(e);
		debugToast(String(e));
		if (id == undefined) {
			await unsetCardType();
		}
	}
}

/** Call setCardType on all valid available targets */
export async function setCardTypeAll() {
	const targets = await getTargets();
	for (const target of targets) {
		setCardType(target);
	}
}

export async function unsetCardType() {
	const targets = await getTargets();
	for (const target of targets) {
		const style = target.querySelector('#material-you-card-type');
		if (style) {
			document.removeChild(style);
		}
	}
	mdLog(targets[0], 'Material design card type unset.', true);
}
