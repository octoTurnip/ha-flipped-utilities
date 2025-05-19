import { InputField, InputInfo } from '../interfaces/Panel';

export const THEME_NAME = 'Material You';
export const THEME = 'material_you';

export const INPUT_TEXT_PREFIX = `input_text.${THEME}`;
export const INPUT_SELECT_PREFIX = `input_select.${THEME}`;
export const INPUT_NUMBER_PREFIX = `input_number.${THEME}`;
export const INPUT_BOOLEAN_PREFIX = `input_boolean.${THEME}`;

export const inputs: Record<InputField, InputInfo> = {
	base_color: {
		type: 'text',
		default: '#4C5C92',
		name: `${THEME_NAME} Base Color`,
		input: `${INPUT_TEXT_PREFIX}_base_color`,
		action: 'input_text.set_value',
		icon: 'mdi:palette',
	},
	scheme: {
		type: 'select',
		default: 'tonalspot',
		name: `${THEME_NAME} Scheme Name`,
		input: `${INPUT_SELECT_PREFIX}_scheme`,
		action: 'input_select.select_option',
		icon: 'mdi:palette-advanced',
	},
	contrast: {
		type: 'number',
		default: 0,
		name: `${THEME_NAME} Contrast Level`,
		input: `${INPUT_NUMBER_PREFIX}_contrast`,
		action: 'input_number.set_value',
		icon: 'mdi:contrast-circle',
	},
	styles: {
		type: 'boolean',
		default: 'on',
		name: `${THEME_NAME} Style Upgrades`,
		input: `${INPUT_BOOLEAN_PREFIX}_styles`,
		action: 'input_boolean.turn_on',
		icon: 'mdi:material-design',
	},
};
