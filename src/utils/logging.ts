import { INPUT_BOOLEAN_PREFIX } from '../models/constants/inputs';
import { HassElement } from '../models/interfaces';

export function mdLog(
	target: HTMLElement,
	message: string,
	toast: boolean = false,
) {
	const background =
		target?.style?.getPropertyValue('--md-sys-color-primary-light') ||
		'#4c5c92';
	const color =
		target?.style?.getPropertyValue('--md-sys-color-on-primary-light') ||
		'#ffffff';
	const styles = `color: ${color}; background: ${background}; font-weight: bold; border-radius: 32px; padding: 0 8px;`;

	console.info(`%c ${message} `, styles);
	if (toast) {
		debugToast(message);
	}
}

/**
 * Show a toast
 * @param {Node} node node to fire the event on
 * @param {string} message message to display
 */
export function showToast(node: Node, message: string) {
	const event = new Event('hass-notification', {
		bubbles: true,
		composed: true,
	});
	event.detail = {
		message,
	};
	node.dispatchEvent(event);
}

export async function debugToast(message: string) {
	const ha = document.querySelector('home-assistant') as HassElement;
	const hass = ha.hass;
	if (hass.states[`${INPUT_BOOLEAN_PREFIX}_debug_toast`]?.state == 'on') {
		showToast(ha, message);
	}
}
