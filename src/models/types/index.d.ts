export {};

declare global {
	interface Window {
		externalApp?: {
			externalBus: (msg: string) => void;
		};
		webkit?: {
			messageHandlers: {
				externalBus: {
					postMessage: (msg: any) => void;
				};
			};
		};
		MaterialYouInit?: boolean;
		browser_mod?: {
			browserID?: string;
			browsers?: Record<string, Record<string, any>>;
		};
	}

	interface Event {
		// eslint-disable-next-line
		detail?: any;
	}

	declare module '*.css' {
		const classes: string;
		export default classes;
	}
}
