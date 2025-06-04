import { DiskColorPicker } from 'disk-color-picker';

export class DiskOnlyColorPicker extends DiskColorPicker {
	protected root!: ShadowRoot;

	constructor() {
		super();

		this.root.innerHTML += `
			<style id="no-arc">
				#base {
					height: 180px;
					width: 180px;
					-webkit-tap-highlight-color: transparent;
				}
				#wheel,
				#wheelThumb {
					display: none;
				}
			</style>
		`;

		let timeout: ReturnType<typeof setTimeout>;
		this.addEventListener('change', () => {
			clearTimeout(timeout);
			timeout = setTimeout(() => {
				const event = new Event('value-changed');
				event.detail = { value: this.value };
				this.dispatchEvent(event);
			}, 100);
		});
	}

	updateColor() {
		super.updateColor();
		this._fire();
	}
}

if (!customElements.get('disk-only-color-picker')) {
	customElements.define('disk-only-color-picker', DiskOnlyColorPicker);
}
