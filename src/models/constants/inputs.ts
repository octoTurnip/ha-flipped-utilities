import { setCardType } from '../../utils/handlers/cards';
import { setTheme } from '../../utils/handlers/colors';
import { setBaseColorFromImage } from '../../utils/handlers/image';
import { hideNavbar } from '../../utils/handlers/navbar';
import { IInputInfo, InputDomain, InputField } from '../interfaces/Input';
import { schemes } from './colors';

export const THEME_NAME = 'Material You';
export const THEME = THEME_NAME.toLowerCase().replace(/ /g, '_');

export const services: Record<InputDomain, string> = {
	input_text: 'set_value',
	input_number: 'set_value',
	input_select: 'select_option',
	input_boolean: 'toggle',
};

export const inputs: Record<InputField, IInputInfo> = {
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
		handler: setTheme,
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
		handler: setBaseColorFromImage,
	},
	scheme: {
		domain: 'input_select',
		default: 'tonalspot',
		name: 'Scheme Name',
		config: {
			icon: 'mdi:palette-advanced',
			options: [...schemes.map((scheme) => scheme.value)],
		},
		handler: setTheme,
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
		handler: setTheme,
	},
	spec: {
		domain: 'input_select',
		default: '2021',
		name: 'Specification Version',
		config: {
			icon: 'mdi:calendar-multiple',
			options: ['2021', '2025'],
		},
		handler: setTheme,
	},
	platform: {
		domain: 'input_select',
		default: 'phone',
		name: 'Platform',
		config: {
			icon: 'mdi:devices',
			options: ['phone', 'watch'],
		},
		handler: setTheme,
	},

	// Style options
	styles: {
		domain: 'input_boolean',
		default: 'on',
		name: 'Style Upgrades',
		config: {
			icon: 'mdi:material-design',
		},
		handler: async (_args) => {},
	},
	card_type: {
		domain: 'input_select',
		default: 'elevated',
		name: 'Card Type',
		config: {
			icon: 'mdi:card',
			options: ['elevated', 'filled', 'outlined', 'transparent'],
		},
		handler: setCardType,
	},
	navbar: {
		domain: 'input_boolean',
		default: 'on',
		name: 'Show Navigation Bar',
		config: {
			icon: 'mdi:navigation',
		},
		handler: hideNavbar,
	},
};
