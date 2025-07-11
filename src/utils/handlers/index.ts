import { HassElement } from '../../models/interfaces';
import { InputField } from '../../models/interfaces/Input';
import { getEntityId } from '../common';

export * from './cards';
export * from './colors';
export * from './image';
export * from './navbar';
export * from './styles';

export function getEntityIdAndValue(
	field: InputField,
	id?: string,
): [string, string] {
	const hass = (document.querySelector('home-assistant') as HassElement).hass;

	const ids = [
		id,
		window.browser_mod?.browserID?.replace(/-/g, '_'),
		hass.user?.id,
		'',
	];
	let entityId = '';
	let value = '';
	for (const id of ids) {
		if (id == undefined) {
			continue;
		}

		entityId = getEntityId(field as InputField, id);
		value = hass.states[entityId]?.state?.trim();

		if (value != undefined) {
			break;
		}
	}

	return [entityId, value];
}
