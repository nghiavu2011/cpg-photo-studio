/*
 * CPG Photo Studio - Photoshop CC 2020 Keyboard Shortcuts & Navigation Engine
 * Fully compatible with Adobe Photoshop CC 2020 workflows
 */

import config from './../config.js';
import app from './../app.js';
import Helper_class from './../libs/helpers.js';
import alertify from './../../../node_modules/alertifyjs/build/alertify.min.js';

var instance = null;

class Psd_shortcuts_class {

	constructor(GUI_class) {
		if (instance) {
			return instance;
		}
		instance = this;

		this.GUI = GUI_class;
		this.Helper = new Helper_class();

		// Background secondary color (PSD style)
		config.COLOR_BG = '#ffffff';

		// Spacebar pan state
		this.is_space_down = false;
		this.is_space_dragging = false;
		this.space_drag_start = { x: 0, y: 0 };

		this.init();
	}

	init() {
		this.bind_keyboard_events();
		this.bind_space_pan_events();
	}

	bind_keyboard_events() {
		document.addEventListener('keydown', (event) => {
			if (this.Helper.is_input(event.target)) {
				return;
			}

			const key = (event.key || '').toLowerCase();
			const isCtrl = event.ctrlKey || event.metaKey;
			const isShift = event.shiftKey;
			const isAlt = event.altKey;

			// Handle commands with Ctrl/Cmd
			if (isCtrl && !isAlt) {
				// Ctrl + D: Deselect
				if (key === 'd') {
					event.preventDefault();
					this.deselect();
					return;
				}

				// Ctrl + T: Free Transform / Select tool
				if (key === 't') {
					event.preventDefault();
					this.activate_tool('select');
					alertify.message('Transform / Move tool active (Ctrl+T)', 2);
					return;
				}

				// Ctrl + + / Ctrl + = : Zoom In
				if (key === '+' || key === '=') {
					event.preventDefault();
					if (this.GUI && this.GUI.GUI_preview) {
						this.GUI.GUI_preview.zoom(1);
					}
					return;
				}

				// Ctrl + - : Zoom Out
				if (key === '-' || key === '_') {
					event.preventDefault();
					if (this.GUI && this.GUI.GUI_preview) {
						this.GUI.GUI_preview.zoom(-1);
					}
					return;
				}

				// Ctrl + 0 : Fit Window
				if (key === '0') {
					event.preventDefault();
					if (this.GUI && this.GUI.GUI_preview) {
						this.GUI.GUI_preview.zoom_auto();
					}
					return;
				}

				// Ctrl + 1 : 100% Zoom
				if (key === '1') {
					event.preventDefault();
					if (this.GUI && this.GUI.GUI_preview) {
						this.GUI.GUI_preview.zoom(100);
					}
					return;
				}

				// Ctrl + Shift + E : Quick Export as PNG (PhotoCraft feature)
				if (isShift && key === 'e') {
					event.preventDefault();
					this.quick_export_png();
					return;
				}
			}

			// Single key tool switching & Photoshop navigation
			if (!isCtrl && !isAlt) {
				switch (key) {
					// V: Move / Select tool
					case 'v':
						event.preventDefault();
						this.activate_tool('select');
						break;

					// M: Marquee Selection
					case 'm':
						event.preventDefault();
						this.activate_tool('selection');
						break;

					// C: Crop tool
					case 'c':
						event.preventDefault();
						this.activate_tool('crop');
						break;

					// I: Eyedropper (Pick Color)
					case 'i':
						event.preventDefault();
						this.activate_tool('pick_color');
						break;

					// B: Brush tool / Pencil tool cycling (PhotoCraft style)
					case 'b':
						event.preventDefault();
						if (config.TOOL.name === 'brush') {
							this.activate_tool('pencil');
							alertify.message('Pencil Tool (N)', 1);
						} else {
							this.activate_tool('brush');
							alertify.message('Brush Tool (B)', 1);
						}
						break;

					// N: Pencil tool
					case 'n':
						event.preventDefault();
						this.activate_tool('pencil');
						break;

					// E: Eraser tool / Magic Eraser cycling (PhotoCraft style)
					case 'e':
						event.preventDefault();
						if (config.TOOL.name === 'erase') {
							this.activate_tool('magic_erase');
							alertify.message('Magic Eraser (W)', 1);
						} else {
							this.activate_tool('erase');
							alertify.message('Eraser Tool (E)', 1);
						}
						break;

					// W: Magic Wand / Magic Eraser
					case 'w':
						event.preventDefault();
						this.activate_tool('magic_erase');
						break;

					// G: Paint Bucket / Gradient cycling (PhotoCraft style)
					case 'g':
						event.preventDefault();
						if (config.TOOL.name === 'fill') {
							this.activate_tool('gradient');
							alertify.message('Gradient Tool (G)', 1);
						} else {
							this.activate_tool('fill');
							alertify.message('Paint Bucket (G)', 1);
						}
						break;

					// T: Type / Text tool
					case 't':
						event.preventDefault();
						this.activate_tool('text');
						break;

					// U: Shapes tool
					case 'u':
						event.preventDefault();
						this.activate_tool('shape');
						break;

					// S: Clone Stamp tool
					case 's':
						event.preventDefault();
						this.activate_tool('clone');
						break;

					// R: Blur / Sharpen cycling (PhotoCraft style)
					case 'r':
						event.preventDefault();
						if (config.TOOL.name === 'blur') {
							this.activate_tool('sharpen');
							alertify.message('Sharpen Tool', 1);
						} else {
							this.activate_tool('blur');
							alertify.message('Blur Tool (R)', 1);
						}
						break;

					// O: Dodge / Burn / Desaturate
					case 'o':
						event.preventDefault();
						this.activate_tool('desaturate');
						break;

					// Z: Zoom In tool
					case 'z':
						event.preventDefault();
						if (this.GUI && this.GUI.GUI_preview) {
							this.GUI.GUI_preview.zoom(1);
						}
						break;

					// X: Swap Foreground and Background colors
					case 'x':
						event.preventDefault();
						this.swap_colors();
						break;

					// D: Default Colors (Black & White)
					case 'd':
						event.preventDefault();
						this.reset_default_colors();
						break;

					// [: Decrease brush / tool size
					case '[':
						event.preventDefault();
						this.adjust_tool_size(-1);
						break;

					// ]: Increase brush / tool size
					case ']':
						event.preventDefault();
						this.adjust_tool_size(1);
						break;

					// Enter: Commit Crop (PhotoCraft behavior)
					case 'enter':
						if (config.TOOL.name === 'crop') {
							event.preventDefault();
							if (this.GUI && this.GUI.GUI_tools && this.GUI.GUI_tools.tools_modules['crop']) {
								this.GUI.GUI_tools.tools_modules['crop'].object.crop();
								alertify.success('Đã cắt ảnh (Crop committed)!', 1.5);
							}
						}
						break;

					// Escape: Cancel Crop (PhotoCraft behavior)
					case 'escape':
						if (config.TOOL.name === 'crop') {
							event.preventDefault();
							this.activate_tool('select');
							alertify.message('Đã hủy cắt (Crop canceled)', 1.5);
						}
						break;

					// Arrow keys: Layer Nudge (1px, or 10px with Shift)
					case 'arrowup':
					case 'arrowdown':
					case 'arrowleft':
					case 'arrowright':
						if (config.layer && config.layer.id) {
							event.preventDefault();
							const delta = isShift ? 10 : 1;
							let dx = 0, dy = 0;
							if (key === 'arrowup') dy = -delta;
							if (key === 'arrowdown') dy = delta;
							if (key === 'arrowleft') dx = -delta;
							if (key === 'arrowright') dx = delta;

							config.layer.x += dx;
							config.layer.y += dy;
							config.need_render = true;
						}
						break;
				}
			}
		}, false);
	}

	activate_tool(toolName) {
		if (this.GUI && this.GUI.GUI_tools) {
			this.GUI.GUI_tools.activate_tool(toolName);
		}
	}

	deselect() {
		// Deselect / clear active selection
		if (app.Layers && app.Layers.Base_selection) {
			app.Layers.Base_selection.reset_selection();
		}
		// Clear selection tool
		if (this.GUI && this.GUI.modules && this.GUI.modules['edit/selection']) {
			this.GUI.modules['edit/selection'].delete();
		}
		config.need_render = true;
	}

	swap_colors() {
		const temp = config.COLOR;
		config.COLOR = config.COLOR_BG || '#ffffff';
		config.COLOR_BG = temp;

		this.update_color_ui();
		alertify.message(`Đổi màu: ${config.COLOR}`, 1.5);
	}

	reset_default_colors() {
		config.COLOR = '#000000';
		config.COLOR_BG = '#ffffff';

		this.update_color_ui();
		alertify.message('Màu mặc định: Đen / Trắng (PSD standard)', 1.5);
	}

	update_color_ui() {
		const hexInput = document.getElementById('color_hex');
		if (hexInput) {
			hexInput.value = config.COLOR;
		}
		const colorSample = document.getElementById('selected_color_sample');
		if (colorSample) {
			colorSample.style.backgroundColor = config.COLOR;
		}
		const cpgFgChip = document.getElementById('cpg_color_fg');
		if (cpgFgChip) {
			cpgFgChip.style.backgroundColor = config.COLOR;
		}
		const cpgBgChip = document.getElementById('cpg_color_bg');
		if (cpgBgChip) {
			cpgBgChip.style.backgroundColor = config.COLOR_BG;
		}
	}

	adjust_tool_size(direction) {
		const activeTool = config.TOOL;
		if (!activeTool || !activeTool.attributes) return;

		let attrName = null;
		if ('size' in activeTool.attributes) {
			attrName = 'size';
		} else if ('border_size' in activeTool.attributes) {
			attrName = 'border_size';
		}

		if (attrName) {
			let current = activeTool.attributes[attrName];
			let delta = current < 15 ? 2 : (current < 40 ? 5 : 10);
			let next = Math.max(1, current + (direction * delta));
			activeTool.attributes[attrName] = next;

			// Refresh tool attributes bar
			if (this.GUI && this.GUI.GUI_tools) {
				this.GUI.GUI_tools.show_action_attributes();
			}
			config.need_render = true;
			alertify.message(`${activeTool.name} size: ${next}px`, 1);
		}
	}

	bind_space_pan_events() {
		const canvas = document.getElementById('canvas_minipaint');
		const wrapper = document.getElementById('main_wrapper');

		window.addEventListener('keydown', (e) => {
			if (e.code === 'Space' && !this.Helper.is_input(e.target) && !this.is_space_down) {
				this.is_space_down = true;
				if (wrapper) wrapper.style.cursor = 'grab';
				if (canvas) canvas.style.cursor = 'grab';
			}
		});

		window.addEventListener('keyup', (e) => {
			if (e.code === 'Space') {
				this.is_space_down = false;
				this.is_space_dragging = false;
				if (wrapper) wrapper.style.cursor = '';
				if (canvas) canvas.style.cursor = '';
			}
		});

		if (wrapper) {
			wrapper.addEventListener('mousedown', (e) => {
				if (this.is_space_down && (e.button === 0 || e.button === 1)) {
					this.is_space_dragging = true;
					this.space_drag_start = { x: e.clientX, y: e.clientY };
					wrapper.style.cursor = 'grabbing';
					if (canvas) canvas.style.cursor = 'grabbing';
					e.preventDefault();
				}
			});

			window.addEventListener('mousemove', (e) => {
				if (this.is_space_dragging) {
					const dx = e.clientX - this.space_drag_start.x;
					const dy = e.clientY - this.space_drag_start.y;
					this.space_drag_start = { x: e.clientX, y: e.clientY };

					if (app.Layers && app.Layers.zoomView) {
						app.Layers.zoomView.move(dx, dy);
						config.need_render = true;
					}
				}
			});

			window.addEventListener('mouseup', () => {
				if (this.is_space_dragging) {
					this.is_space_dragging = false;
					if (this.is_space_down) {
						wrapper.style.cursor = 'grab';
						if (canvas) canvas.style.cursor = 'grab';
					} else {
						wrapper.style.cursor = '';
						if (canvas) canvas.style.cursor = '';
					}
				}
			});
		}
	}

	quick_export_png() {
		var canvas = document.getElementById('canvas_minipaint');
		if (!canvas) return;
		canvas.toBlob(function (blob) {
			if (!blob) return;
			var a = document.createElement('a');
			a.download = 'CPG-Export-' + Date.now() + '.png';
			a.href = URL.createObjectURL(blob);
			document.body.appendChild(a);
			a.click();
			document.body.removeChild(a);
			URL.revokeObjectURL(a.href);
			alertify.success('★ Đã xuất nhanh ảnh PNG (Quick Export PNG)!');
		}, 'image/png');
	}
}

export default Psd_shortcuts_class;
