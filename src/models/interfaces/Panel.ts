import { HassEntity } from 'home-assistant-js-websocket';

export interface IUserPanelSettings {
	id: string;
	settings: Record<InputField, string | number | undefined>;
	stateObj?: HassEntity;
}

export type InputDomain =
	| 'input_text'
	| 'input_select'
	| 'input_number'
	| 'input_boolean';

export type InputField =
	| 'base_color'
	| 'image_url'
	| 'scheme'
	| 'contrast'
	| 'spec'
	| 'platform'
	| 'styles'
	| 'card_type'
	| 'navbar';

export interface InputInfo {
	domain: InputDomain;
	default: string | number;
	name: string;
	config: Record<string, any>;
}
