import { setCardType } from '../../utils/handlers/cards';
import { setTheme } from '../../utils/handlers/colors';
import { setCSSFromFile } from '../../utils/handlers/css';
import { harmonize } from '../../utils/handlers/harmonize';
import { setBaseColorFromImage } from '../../utils/handlers/image';
import { hideNavbar } from '../../utils/handlers/navbar';
import { IInputInfo, InputDomain, InputField } from '../interfaces/Input';
import { schemes } from './colors';

export const services: Record<InputDomain, string> = {
	input_text: 'set_value',
	input_number: 'set_value',
	input_select: 'select_option',
	input_boolean: 'toggle',
};

export const inputs: Record<InputField, IInputInfo> = {
	// Theme options
	base_color: {
		domain: 'input_text',
		default: '#4C5C92',
		name: 'Base Color',
		init: {
			config: {
				icon: 'mdi:palette',
				min: 3,
				max: 9,
			},
		},
		card: { config: {}, tabBarIndex: 0, resetButton: true },
		handler: setTheme,
	},
	scheme: {
		domain: 'input_select',
		default: 'tonalspot',
		name: 'Scheme Name',
		init: {
			config: {
				icon: 'mdi:palette-advanced',
				options: [...schemes.map((scheme) => scheme.value)],
			},
		},
		card: {
			config: {
				select: {
					mode: 'dropdown',
					options: schemes,
				},
			},
			tabBarIndex: 0,
		},
		handler: setTheme,
	},
	spec: {
		domain: 'input_select',
		default: '2021',
		name: 'Specification Version',
		init: {
			config: {
				icon: 'mdi:calendar-multiple',
				options: ['2021', '2025'],
			},
		},
		card: {
			config: {
				select: {
					mode: 'box',
					options: ['2021', '2025'],
				},
			},
			tabBarIndex: 0,
		},
		handler: setTheme,
	},
	platform: {
		domain: 'input_select',
		default: 'phone',
		name: 'Platform',
		init: {
			config: {
				icon: 'mdi:devices',
				options: ['phone', 'watch'],
			},
		},
		card: {
			config: {
				select: {
					mode: 'box',
					options: [
						{ value: 'phone', label: 'Phone' },
						{ value: 'watch', label: 'Watch' },
					],
				},
			},
			tabBarIndex: 0,
		},
		handler: setTheme,
	},
	contrast: {
		domain: 'input_number',
		default: 0,
		name: 'Contrast Level',
		init: {
			config: {
				icon: 'mdi:contrast-circle',
				min: -1,
				max: 1,
				step: 0.1,
			},
		},
		card: {
			config: {
				number: {
					min: -1,
					max: 1,
					step: 0.1,
					mode: 'slider',
					slider_ticks: true,
				},
			},
			tabBarIndex: 0,
		},
		handler: setTheme,
	},

	// Style options
	styles: {
		domain: 'input_boolean',
		default: 'on',
		name: 'Style Upgrades',
		init: {
			config: {
				icon: 'mdi:material-design',
			},
		},
		card: {
			config: {
				boolean: {},
			},
			tabBarIndex: 1,
		},
		handler: async (_args) => {},
	},
	card_type: {
		domain: 'input_select',
		default: 'elevated',
		name: 'Card Type',
		init: {
			config: {
				icon: 'mdi:card',
				options: ['elevated', 'filled', 'outlined', 'transparent'],
			},
		},
		card: {
			config: {
				select: {
					mode: 'dropdown',
					options: [
						{ value: 'elevated', label: 'Elevated' },
						{ value: 'filled', label: 'Filled' },
						{ value: 'outlined', label: 'Outlined' },
						{ value: 'transparent', label: 'Transparent' },
					],
				},
			},
			tabBarIndex: 1,
		},
		handler: setCardType,
	},
	navbar: {
		domain: 'input_boolean',
		default: 'on',
		name: 'Show Navigation Bar',
		init: {
			config: {
				icon: 'mdi:navigation',
			},
		},
		card: {
			config: {
				boolean: {},
			},
			tabBarIndex: 1,
		},
		handler: hideNavbar,
	},

	// Color options
	harmonize: {
		domain: 'input_boolean',
		default: 'off',
		name: 'Harmonize Semantic Colors',
		init: {
			config: {
				icon: 'mdi:palette-swatch',
			},
		},
		card: {
			config: {
				boolean: {},
			},
			tabBarIndex: 2,
		},
		handler: harmonize,
	},
	image_url: {
		domain: 'input_text',
		default: '',
		name: 'Base Color Source Image Path/URL',
		init: {
			config: {
				icon: 'mdi:image',
				min: 0,
				max: 255,
			},
		},
		card: {
			config: {
				text: {},
			},
			tabBarIndex: 2,
		},
		handler: setBaseColorFromImage,
	},
	css_file: {
		domain: 'input_text',
		default: '',
		name: 'CSS Path/URL',
		init: {
			config: {
				icon: 'mdi:language-css3',
				min: 0,
				max: 255,
			},
		},
		card: {
			config: {
				text: {},
			},
			tabBarIndex: 2,
		},
		handler: setCSSFromFile,
	},
};
