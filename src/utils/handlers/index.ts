import { HassElement } from '../../models/interfaces';
import { IHandlerArguments, InputField } from '../../models/interfaces/Input';
import { querySelectorAsync } from '../async';
import { getEntityId, getHomeAssistantMainAsync } from '../common';
import { mdLog } from '../logging';

export * from './cards';
export * from './colors';
export * from './image';
export * from './navbar';
export * from './styles';

/**
 * Get the highest priority entity ID and its value for a given field
 * @param {InputField} field
 * @param {string} id
 * @returns { entityId: string; value: string | number | boolean }
 */
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

		if (value != undefined && value != 'unknown') {
			result.entityId = entityId;
			result.value = value;
			break;
		}
	}

	return result;
}

/**
 * Get targets to apply or remove theme colors to/from
 * @returns {HTMLElement[]} HTML Elements to apply/remove theme to/from
 */
export async function getTargets(): Promise<HTMLElement[]> {
	const targets: HTMLElement[] = [
		(await querySelectorAsync(document, 'html')) as HTMLElement,
	];

	// Add-ons and HACS iframe
	const ha = await getHomeAssistantMainAsync();
	const iframe = ha.shadowRoot
		?.querySelector('iframe')
		?.contentWindow?.document?.querySelector('body');
	if (iframe) {
		targets.push(iframe);
	}
	return targets;
}

/**
 * Remove style tags from targets
 * @param {IHandlerArguments} args Handler arguments with targets
 * @param {string} id ID of the style tag to remove
 */
export async function unset(args: IHandlerArguments, id: string, log?: string) {
	const targets = args.targets ?? (await getTargets());
	let removed = false;
	for (const target0 of targets) {
		const target = target0.shadowRoot || target0;
		const style = target.querySelector(`#${id}`);
		if (style) {
			removed = true;
			target.removeChild(style);
		}
	}
	if (removed && log) {
		mdLog(targets[0], log, true);
	}
}
