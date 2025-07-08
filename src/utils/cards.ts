import { cardTypes } from '../css';
import { THEME_NAME } from '../models/constants/inputs';
import { HassElement } from '../models/interfaces';
import { IHandlerArguments } from '../models/interfaces/Input';
import { getTargets } from './colors';
import { getEntityId } from './common';
import { debugToast, mdLog } from './logging';
import { loadStyles } from './styles';

const styleId = 'material-you-card-type';

/** Change ha-card styles to match the selected card type */
export async function setCardType(args: IHandlerArguments) {
	const hass = (document.querySelector('home-assistant') as HassElement).hass;
	const targets = args.targets ?? (await getTargets());

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

				value = hass.states[getEntityId('card_type', id)]?.state;
				if (value in cardTypes) {
					break;
				}
			}

			if (!(value in cardTypes)) {
				for (const target0 of targets) {
					const target = target0.shadowRoot || target0;

					let style = target.querySelector(`#${styleId}`);
					if (style) {
						target.removeChild(style);
						mdLog(
							target,
							'Material design card type set to default (elevated).',
							true,
						);
					}
				}
				return;
			}

			for (const target0 of targets) {
				const target = target0.shadowRoot || target0;

				let hasStyleTag = true;
				let style = target.querySelector(`#${styleId}`);
				if (!style) {
					hasStyleTag = false;
					style = document.createElement('style');
					style.id = styleId;
				}

				style.textContent = loadStyles(cardTypes[value]);
				if (!hasStyleTag) {
					target.appendChild(style);
				}
			}

			mdLog(
				targets[0],
				`Material design card type set to ${value}.`,
				true,
			);
		} else {
			if (args.id == undefined) {
				await unsetCardType();
			}
		}
	} catch (e) {
		console.error(e);
		debugToast(String(e));
		if (args.id == undefined) {
			await unsetCardType();
		}
	}
}

export async function unsetCardType() {
	const targets = await getTargets();
	for (const target of targets) {
		const style = target.querySelector(`#${styleId}`);
		if (style) {
			document.removeChild(style);
		}
	}
	mdLog(targets[0], 'Material design card type unset.', true);
}
