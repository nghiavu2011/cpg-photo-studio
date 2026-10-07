/*
 * CPG Photo Studio - Photoshop CC 2020 Complete Keyboard Shortcuts & Navigation Engine
 * 100% Compatible with Adobe Photoshop CC 2020 standard workflows
 */

import config from './../config.js';
import app from './../app.js';
import Helper_class from './../libs/helpers.js';
import zoomView from './../libs/zoomView.js';
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

			// ====================================================================
			// 1. Ctrl / Cmd Combinations (Photoshop CC Standard)
			// ====================================================================
			if (isCtrl && !isAlt) {
				// Ctrl + D : Deselect
				if (key === 'd') {
					event.preventDefault();
					this.deselect();
					alertify.message('Bỏ chọn (Deselect - Ctrl+D)', 1.5);
					return;
				}

				// Ctrl + A : Select All
				if (key === 'a') {
					event.preventDefault();
					this.activate_tool('selection');
					if (this.GUI && this.GUI.GUI_tools && this.GUI.GUI_tools.tools_modules['selection']) {
						this.GUI.GUI_tools.tools_modules['selection'].object.select_all();
					}
					alertify.message('Chọn tất cả (Select All - Ctrl+A)', 1.5);
					return;
				}

				// Ctrl + T : Free Transform
				if (key === 't') {
					event.preventDefault();
					this.activate_tool('select');
					const chkTransform = document.getElementById('psd_chk_transform_controls');
					if (chkTransform) chkTransform.checked = true;
					if (app.Layers && app.Layers.Base_selection) {
						const settings = app.Layers.Base_selection.find_settings();
						if (settings) {
							settings.enable_borders = true;
							settings.enable_controls = true;
							settings.enable_rotation = true;
						}
					}
					config.need_render = true;
					if (app.Layers) app.Layers.render();
					alertify.message('Free Transform (Ctrl+T): Co giãn / xoay đối tượng', 2);
					return;
				}

				// Ctrl + J : Duplicate Active Layer
				if (key === 'j') {
					event.preventDefault();
					if (config.layer && config.layer.id) {
						if (this.GUI && this.GUI.modules && this.GUI.modules['layer/duplicate']) {
							this.GUI.modules['layer/duplicate'].duplicate();
						} else {
							const clone = JSON.parse(JSON.stringify(config.layer));
							delete clone.id;
							clone.name = config.layer.name + ' copy';
							clone.order = config.layer.order + 0.5;
							app.State.do_action(new app.Actions.Insert_layer_action(clone));
						}
						alertify.success(`Nhân đôi Layer (Ctrl+J): ${config.layer ? config.layer.name : ''}`, 1.5);
					}
					return;
				}

				// Ctrl + Shift + N : Create New Layer
				if (isShift && key === 'n') {
					event.preventDefault();
					app.State.do_action(new app.Actions.Insert_layer_action());
					alertify.success('Đã tạo Layer mới (Ctrl+Shift+N)', 1.5);
					return;
				}

				// Ctrl + [ and Ctrl + ] : Reorder Layer (Bring Forward / Send Backward)
				if (key === '[' || key === ']') {
					event.preventDefault();
					if (config.layer && config.layer.id) {
						const dir = key === ']' ? 1 : -1;
						if (isShift) {
							// Bring to Front / Send to Back
							if (dir === 1) {
								const maxOrder = Math.max(...config.layers.map(l => l.order));
								config.layer.order = maxOrder + 1;
								alertify.message('Đưa lên trên cùng (Bring to Front)', 1.5);
							} else {
								config.layer.order = 1.1;
								alertify.message('Đưa xuống dưới cùng (Send to Back)', 1.5);
							}
						} else {
							app.State.do_action(new app.Actions.Reorder_layer_action(config.layer.id, dir));
							alertify.message(dir === 1 ? 'Đưa layer lên một bậc (Ctrl+])' : 'Đưa layer xuống một bậc (Ctrl+[)', 1.5);
						}
						if (app.Layers) app.Layers.render();
						if (this.GUI && this.GUI.GUI_layers) this.GUI.GUI_layers.render_layers();
					}
					return;
				}

				// Ctrl + 0 : Fit Canvas to Screen
				if (key === '0') {
					event.preventDefault();
					if (this.GUI && this.GUI.GUI_preview) {
						this.GUI.GUI_preview.zoom_auto();
					}
					alertify.message('Fit to Screen (Ctrl+0)', 1);
					return;
				}

				// Ctrl + 1 : Actual Size 100% Zoom
				if (key === '1') {
					event.preventDefault();
					if (this.GUI && this.GUI.GUI_preview) {
						this.GUI.GUI_preview.zoom(100);
					}
					alertify.message('100% Actual Pixels (Ctrl+1)', 1);
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

				// Ctrl + S : Quick Export / Save
				if (key === 's') {
					event.preventDefault();
					this.quick_export_png();
					return;
				}

				// Ctrl + O : Open File
				if (key === 'o') {
					event.preventDefault();
					if (this.GUI && this.GUI.modules && this.GUI.modules['file/open']) {
						this.GUI.modules['file/open'].open_file();
					}
					return;
				}

				// Ctrl + Shift + E : Quick Export
				if (isShift && key === 'e') {
					event.preventDefault();
					this.quick_export_png();
					return;
				}
			}

			// ====================================================================
			// 2. Delete / Backspace (Delete Active Layer)
			// ====================================================================
			if ((key === 'delete' || key === 'backspace') && !isCtrl && !isAlt) {
				if (config.layer && config.layer.id && config.layer.name !== 'Background' && !config.layer.locked) {
					event.preventDefault();
					const name = config.layer.name;
					app.State.do_action(new app.Actions.Delete_layer_action(config.layer.id));
					alertify.message(`Đã xóa layer: ${name}`, 1.5);
					return;
				}
			}

			// ====================================================================
			// 3. Number keys 0-9 on Move Tool: Quick Layer Opacity (PSD Standard)
			// ====================================================================
			if (!isCtrl && !isAlt && !isShift && config.TOOL && config.TOOL.name === 'select') {
				if (/^[0-9]$/.test(key) && config.layer && !config.layer.locked) {
					event.preventDefault();
					const num = parseInt(key, 10);
					const opacity = num === 0 ? 100 : num * 10;
					config.layer.opacity = opacity;
					const opInput = document.getElementById('psd_layer_opacity');
					if (opInput) opInput.value = opacity;
					config.need_render = true;
					if (app.Layers) app.Layers.render();
					alertify.message(`Opacity: ${opacity}%`, 1);
					return;
				}
			}

			// ====================================================================
			// 4. Single Key Tool Shortcuts & Navigation (PSD CC 2020 Standard)
			// ====================================================================
			if (!isCtrl && !isAlt) {
				switch (key) {
					// V: Move Tool
					case 'v':
						event.preventDefault();
						this.activate_tool('select');
						alertify.message('Move Tool (V)', 1);
						break;

					// M: Marquee Selection
					case 'm':
						event.preventDefault();
						this.activate_tool('selection');
						alertify.message('Marquee Tool (M)', 1);
						break;

					// L: Lasso Tool
					case 'l':
						event.preventDefault();
						this.activate_tool('lasso');
						alertify.message('Lasso Tool (L)', 1);
						break;

					// W: Magic Wand / Magic Eraser
					case 'w':
						event.preventDefault();
						this.activate_tool('magic_erase');
						alertify.message('Magic Wand (W)', 1);
						break;

					// C: Crop Tool
					case 'c':
						event.preventDefault();
						this.activate_tool('crop');
						alertify.message('Crop Tool (C)', 1);
						break;

					// I: Eyedropper (Color Picker)
					case 'i':
						event.preventDefault();
						this.activate_tool('pick_color');
						alertify.message('Eyedropper Tool (I)', 1);
						break;

					// B: Brush Tool
					case 'b':
						event.preventDefault();
						this.activate_tool('brush');
						alertify.message('Brush Tool (B)', 1);
						break;

					// N: Pencil Tool
					case 'n':
						event.preventDefault();
						this.activate_tool('pencil');
						alertify.message('Pencil Tool (N)', 1);
						break;

					// S: Clone Stamp Tool
					case 's':
						event.preventDefault();
						this.activate_tool('clone');
						alertify.message('Clone Stamp (S)', 1);
						break;

					// E: Eraser Tool
					case 'e':
						event.preventDefault();
						this.activate_tool('erase');
						alertify.message('Eraser Tool (E)', 1);
						break;

					// G: Paint Bucket / Gradient Tool
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

					// T: Horizontal Type Tool
					case 't':
						event.preventDefault();
						this.activate_tool('text');
						alertify.message('Type Tool (T)', 1);
						break;

					// U: Shapes Tool
					case 'u':
						event.preventDefault();
						this.activate_tool('shape');
						alertify.message('Shapes Tool (U)', 1);
						break;

					// H: Hand Tool (Pan)
					case 'h':
						event.preventDefault();
						alertify.message('Hand Tool (H): Giữ phím Space để kéo vùng nhìn', 1.5);
						break;

					// Z: Zoom Tool
					case 'z':
						event.preventDefault();
						if (this.GUI && this.GUI.GUI_preview) {
							this.GUI.GUI_preview.zoom(1);
						}
						break;

					// R: Blur / Sharpen Tool
					case 'r':
						event.preventDefault();
						if (config.TOOL.name === 'blur') {
							this.activate_tool('sharpen');
							alertify.message('Sharpen Tool (R)', 1);
						} else {
							this.activate_tool('blur');
							alertify.message('Blur Tool (R)', 1);
						}
						break;

					// O: Dodge / Burn / Desaturate Tool
					case 'o':
						event.preventDefault();
						this.activate_tool('desaturate');
						alertify.message('Sponge / Desaturate (O)', 1);
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

					// Enter: Commit Crop
					case 'enter':
						if (config.TOOL && config.TOOL.name === 'crop') {
							event.preventDefault();
							if (this.GUI && this.GUI.GUI_tools && this.GUI.GUI_tools.tools_modules['crop']) {
								this.GUI.GUI_tools.tools_modules['crop'].object.crop();
								alertify.success('Đã cắt ảnh (Crop committed)!', 1.5);
							}
						}
						break;

					// Escape: Cancel Crop
					case 'escape':
						if (config.TOOL && config.TOOL.name === 'crop') {
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
						if (config.layer && config.layer.id && !config.layer.locked) {
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
							if (app.Layers) app.Layers.render();
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
		// Sync options bar tool icon
		const optToolIcon = document.getElementById('psd_tool_active_icon');
		if (optToolIcon) {
			optToolIcon.innerHTML = `<span class="psd_opt_icon ${toolName}"></span>`;
		}
	}

	deselect() {
		if (app.Layers && app.Layers.Base_selection) {
			app.Layers.Base_selection.reset_selection();
		}
		if (this.GUI && this.GUI.modules && this.GUI.modules['edit/selection']) {
			this.GUI.modules['edit/selection'].delete();
		}
		config.need_render = true;
		if (app.Layers) app.Layers.render();
	}

	swap_colors() {
		const temp = config.COLOR;
		config.COLOR = config.COLOR_BG || '#ffffff';
		config.COLOR_BG = temp;

		this.update_color_ui();
		alertify.message(`Đổi màu vẽ: ${config.COLOR}`, 1.5);
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
			alertify.message(`Kích thước cọ: ${next}px`, 1);
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

					zoomView.move(dx, dy);
					config.need_render = true;
					if (app.Layers) {
						app.Layers.render();
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
			a.download = 'CPG-Studio-' + Date.now() + '.png';
			a.href = URL.createObjectURL(blob);
			document.body.appendChild(a);
			a.click();
			document.body.removeChild(a);
			URL.revokeObjectURL(a.href);
			alertify.success('★ Đã xuất nhanh ảnh PNG (Ctrl+S)!', 2);
		}, 'image/png');
	}
}

export default Psd_shortcuts_class;
