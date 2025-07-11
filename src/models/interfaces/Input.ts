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

export interface IHandlerArguments {
	field?: InputField;
	targets?: HTMLElement[];
	id?: string;
}

export type Handler = (args: IHandlerArguments) => Promise<void>;

export interface IInputInfo {
	domain: InputDomain;
	default: string | number;
	name: string;
	config: Record<string, any>;
	handler: Handler;
}

export interface ISubscription {
	inputs: InputField[];
	handler: Handler;
}
