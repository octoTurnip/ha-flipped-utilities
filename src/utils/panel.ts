import { HomeAssistant, IConfirmation } from '../models/interfaces';
import { InputType } from '../models/interfaces/Panel';

/**
 * Create an input entity
 * @param {HomeAssistant} hass Home Assistant HASS object
 * @param {InputType} type Input element type to create
 * @param {Record<string, any>} config Input helper init config
 * @returns {Promise<Record<string, any>>}  Input helper init config, with default values for fields not provided
 */
export async function createInput(
	hass: HomeAssistant,
	type: InputType,
	config: Record<string, any>,
): Promise<Record<string, any>> {
	return hass.callWS({
		type: `input_${type}/create`,
		...config,
	});
}

/**
 * Update an input entity
 * @param {HomeAssistant} hass Home Assistant HASS object
 * @param {InputType} type Input element type to create
 * @param {string} id Element ID, not including domain
 * @returns {Promise<Record<string, any>>}  Input helper update config, replaces current config
 */
export async function updateInput(
	hass: HomeAssistant,
	type: InputType,
	id: string,
	config: Record<string, any>,
): Promise<Record<string, any>> {
	return hass.callWS({
		type: `input_${type}/update`,
		[`input_${type}_id`]: id,
		...config,
	});
}

/**
 * Delete an input entity
 * @param {HomeAssistant} hass Home Assistant HASS object
 * @param {InputType} type Input element type to create
 * @param {string} id Element ID, not including domain
 */
export async function deleteInput(
	hass: HomeAssistant,
	type: InputType,
	id: string,
) {
	hass.callWS({
		type: `input_${type}/delete`,
		[`input_${type}_id`]: id,
	});
}

/**
 * Use a hass-action event to call a confirmation, and use ll-custom and dialog-closed listeners to determine the result
 * @param {Node} node Node to fire the event on
 * @param {boolean | IConfirmation} confirmation Confirmation config or boolean
 * @returns {Promise<boolean>} The result of the confirmation
 */
export async function handleConfirmation(
	node: HTMLElement,
	confirmation: boolean | IConfirmation,
): Promise<boolean> {
	// Short circuit if confirmation is false
	if (!confirmation) {
		return true;
	}

	// Use hass-action to fire a dom event with a confirmation
	const event = new Event('hass-action', {
		bubbles: true,
		composed: true,
	});
	event.detail = {
		action: 'tap',
		config: {
			tap_action: {
				action: 'fire-dom-event',
				confirmation,
			},
		},
	};
	node.dispatchEvent(event);

	return new Promise((resolve) => {
		// Cleanup timeout and event listeners
		let cancelTimeout: ReturnType<typeof setTimeout>;
		const cleanup = () => {
			clearTimeout(cancelTimeout);
			window.removeEventListener('ll-custom', confirmTrue);
			window.removeEventListener('dialog-closed', confirmFalse);
		};

		// ll-custom event is fired when the user accepts the confirmation
		const confirmTrue = () => {
			cleanup();
			resolve(true);
		};
		window.addEventListener('ll-custom', confirmTrue);

		// dialog-closed event is always fired
		// The timeout allows the ll-custom listener to resolve true before this one resolves false
		const confirmFalse = () => {
			cancelTimeout = setTimeout(() => {
				cleanup();
				resolve(false);
			}, 100);
		};
		window.addEventListener('dialog-closed', confirmFalse);
	});
}
