import { HassEntity } from 'home-assistant-js-websocket';

export interface IUserPanelSettings {
	id: string;
	settings: Record<InputField, string | number | undefined>;
	stateObj?: HassEntity;
}

export type InputType = 'text' | 'select' | 'number' | 'boolean';

export type InputField =
	| 'base_color'
	| 'image_url'
	| 'scheme'
	| 'contrast'
	| 'spec'
	| 'platform'
	| 'styles'
	| 'card_type';

export interface InputInfo {
	type: InputType;
	default: string | number;
	name: string;
	input: string;
	action: string;
	icon: string;
}
