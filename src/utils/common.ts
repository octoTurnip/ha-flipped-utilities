import { schemes } from '../models/constants/colors';
import { inputs } from '../models/constants/inputs';
import { HassElement } from '../models/interfaces';
import { IScheme } from '../models/interfaces/Scheme';
import { getAsync, querySelectorAsync } from './async';

/**
 * Get scheme class and name using user input name
 * @param {string} name user provided scheme name
 * @returns {IScheme} Scheme name and class
 */
export function getSchemeInfo(
	name: string = inputs.scheme.default as string,
): IScheme {
	name = name?.toLowerCase()?.replace(/ |-|_/g, '')?.trim();
	return (
		schemes.filter((scheme) => scheme.value == name)[0] ??
		schemes.filter((scheme) => scheme.value == inputs.scheme.default)[0]
	);
}

/**
 * Get theme color token
 * @param {string} color Material Dynamic Color key
 * @returns {string} Material Dynamic Color token
 */
export function getToken(color: string): string {
	return color.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
}

/**
 * Wait for home-assistant-main shadow-root to load, then return home-assistant-main
 * @returns {ShadowRoot} home-assistant-main element
 */
export async function getHomeAssistantMainAsync(): Promise<HassElement> {
	const ha = (await querySelectorAsync(
		await getAsync(
			await querySelectorAsync(document, 'home-assistant'),
			'shadowRoot',
		),
		'home-assistant-main',
	)) as HassElement;
	await getAsync(ha, 'shadowRoot');
	return ha;
}
