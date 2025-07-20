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
): { entityId: string; value: string | number | boolean } {
	const hass = (document.querySelector('home-assistant') as HassElement).hass;

	const ids = [
		id,
		window.browser_mod?.browserID?.replace(/-/g, '_'),
		hass.user?.id,
		'',
	];
	const result = {
		entityId: '',
		value: '',
	};
	for (const id of ids) {
		if (id == undefined) {
			continue;
		}

		const entityId = getEntityId(field, id);
		const value = hass.states[entityId]?.state?.trim();

		if (value != undefined) {
			result.entityId = entityId;
			result.value = value;
			break;
		}
	}

	return result;
}
