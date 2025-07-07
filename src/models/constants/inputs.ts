import { InputDomain, InputField, InputInfo } from '../interfaces/Panel';
import { schemes } from './colors';

export const THEME_NAME = 'Material You';
export const THEME = 'material_you';

export const INPUT_TEXT_PREFIX = 'input_text.${THEME}';
export const INPUT_SELECT_PREFIX = 'input_select.${THEME}';
export const INPUT_NUMBER_PREFIX = 'input_number.${THEME}';
export const INPUT_BOOLEAN_PREFIX = 'input_boolean.${THEME}';

export const inputs: Record<InputField, InputInfo> = {
	// Color options
	base_color: {
		domain: 'input_text',
		default: '#4C5C92',
		name: 'Base Color',
		config: {
			icon: 'mdi:palette',
			min: 3,
			max: 9,
		},
	},
	image_url: {
		domain: 'input_text',
		default: '',
		name: 'Image URL',
		config: {
			icon: 'mdi:image',
			min: 0,
			max: 255,
		},
	},
	scheme: {
		domain: 'input_select',
		default: 'tonalspot',
		name: 'Scheme Name',
		config: {
			icon: 'mdi:palette-advanced',
			options: [...schemes.map((scheme) => scheme.value)],
		},
	},
	contrast: {
		domain: 'input_number',
		default: 0,
		name: 'Contrast Level',
		config: {
			icon: 'mdi:contrast-circle',
			min: -1,
			max: 1,
			step: 0.1,
		},
	},
	spec: {
		domain: 'input_select',
		default: '2021',
		name: 'Specification Version',
		config: {
			icon: 'mdi:calendar-multiple',
			options: ['2021', '2025'],
		},
	},
	platform: {
		domain: 'input_select',
		default: 'phone',
		name: 'Platform',
		config: {
			icon: 'mdi:devices',
			options: ['phone', 'watch'],
		},
	},

	// Style options
	styles: {
		domain: 'input_boolean',
		default: 'on',
		name: 'Style Upgrades',
		config: {
			icon: 'mdi:material-design',
		},
	},
	card_type: {
		domain: 'input_select',
		default: 'elevated',
		name: 'Card Type',
		config: {
			icon: 'mdi:card',
			options: ['elevated', 'filled', 'outlined', 'transparent'],
		},
	},
	navbar: {
		domain: 'input_boolean',
		default: 'on',
		name: 'Show Navigation Bar',
		config: {
			icon: 'mdi:navigation',
		},
	},
};

export const services: Record<InputDomain, string> = {
	input_text: 'set_value',
	input_number: 'set_value',
	input_select: 'select_option',
	input_boolean: 'toggle',
};
