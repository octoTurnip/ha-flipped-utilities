import { getEntityIdAndValue } from '.';
import { cardTypes } from '../../css';
import { THEME_NAME, THEME_TOKEN } from '../../models/constants/theme';
import { HassElement } from '../../models/interfaces';
import { IHandlerArguments } from '../../models/interfaces/Input';
import { debugToast, mdLog } from '../logging';
import { getTargets } from './colors';
import { loadStyles } from './styles';

const styleId = `${THEME_TOKEN}-card-type`;

/** Change ha-card styles to match the selected card type */
export async function setCardType(args: IHandlerArguments) {
	const hass = (document.querySelector('home-assistant') as HassElement).hass;
	const targets = args.targets ?? (await getTargets());

	try {
		const themeName = hass?.themes?.theme ?? '';
		if (themeName.includes(THEME_NAME)) {
			const value = getEntityIdAndValue('card_type', args.id)[1];
			if (!(value in cardTypes)) {
				unsetCardType(args);
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
			await unsetCardType(args);
		}
	} catch (e) {
		console.error(e);
		debugToast(String(e));
		await unsetCardType(args);
	}
}

async function unsetCardType(args: IHandlerArguments) {
	const targets = args.targets ?? (await getTargets());
	let log = false;
	for (const target0 of targets) {
		const target = target0.shadowRoot || target0;
		const style = target.querySelector(`#${styleId}`);
		if (style) {
			log = true;
			target.removeChild(style);
		}
	}
	if (log) {
		mdLog(targets[0], 'Material design card type unset.', true);
	}
}
