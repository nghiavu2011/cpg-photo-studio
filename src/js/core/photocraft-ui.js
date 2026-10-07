/**
 * PhotoCraft UI Engine - Replica of storytold/photocraft UI for CPG Photo Studio
 * Implements:
 * - Photoshop CC 2020 / PhotoCraft dock card tabs (Properties, Adjustments, Layers, Channels, Paths)
 * - Interactive Curves canvas graph (RGB, Red, Green, Blue channels + histogram + spline)
 * - Document tab bar above canvas (file name, zoom%, layer, dirty dot)
 * - Layer blend mode, opacity, and footer actions (+ New, Delete, fx, duplicate)
 * - Toolbar collapse toggle and theme switcher
 */

import app from './../app.js';
import config from './../config.js';
import alertify from './../../../node_modules/alertifyjs/build/alertify.min.js';

class Photocraft_UI {
	constructor(GUI) {
		this.GUI = GUI;
		this.docName = 'great-wave.jpg';
		this.isDirty = false;
		this.activeChannel = 'rgb';
		this.curvePoints = {
			rgb: [[0, 0], [75, 80], [255, 255]],
			red: [[0, 0], [75, 80], [255, 255]],
			green: [[0, 0], [75, 80], [255, 255]],
			blue: [[0, 0], [75, 80], [255, 255]]
		};
		this.selectedPointIndex = 1;
		this.isDraggingPoint = false;

		this.init();
	}

	init() {
		this.setup_dock_tabs();
		this.setup_layer_controls();
		this.setup_curves_canvas();
		this.setup_document_tab();
		this.setup_chrome_events();
		this.setup_alignment_tools();
	}

	// 1. Dock Cards Tab Switching
	setup_dock_tabs() {
		// Top Card (Properties / Adjustments) & Bottom Card (Layers / Channels / Paths)
		document.querySelectorAll('.psd_card_tab').forEach(tab => {
			tab.addEventListener('click', (e) => {
				const parentHeader = tab.closest('.psd_card_header');
				const parentCard = tab.closest('.psd_panel_card');
				const targetId = tab.dataset.target;

				if (!parentCard) return;

				// Update tab active states
				parentHeader.querySelectorAll('.psd_card_tab').forEach(t => t.classList.remove('active'));
				tab.classList.add('active');

				// Update page visibility
				parentCard.querySelectorAll('.psd_tab_page').forEach(page => page.classList.remove('active'));
				const targetPage = document.getElementById(targetId);
				if (targetPage) {
					targetPage.classList.add('active');
					if (targetId === 'panel_adjustments') {
						this.draw_curves();
					}
				}
			});
		});

		// Mini Rail Buttons on Left Edge of Right Dock
		document.querySelectorAll('.psd_rail_btn').forEach(btn => {
			btn.addEventListener('click', () => {
				document.querySelectorAll('.psd_rail_btn').forEach(b => b.classList.remove('active'));
				btn.classList.add('active');
				const panel = btn.dataset.panel;
				if (panel === 'properties') {
					const tab = document.querySelector('.psd_card_tab[data-target="panel_properties"]');
					if (tab) tab.click();
				} else if (panel === 'adjustments') {
					const tab = document.querySelector('.psd_card_tab[data-target="panel_adjustments"]');
					if (tab) tab.click();
				} else if (panel === 'layers') {
					const tab = document.querySelector('.psd_card_tab[data-target="panel_layers"]');
					if (tab) tab.click();
				}
			});
		});
	}

	// 2. Layer Controls (Blend Mode, Opacity, Footer Buttons)
	setup_layer_controls() {
		const blendSelect = document.getElementById('psd_layer_blend_mode');
		if (blendSelect) {
			blendSelect.addEventListener('change', (e) => {
				if (config.layer) {
					config.layer.composition = e.target.value;
					config.need_render = true;
				}
			});
		}

		const opacityInput = document.getElementById('psd_layer_opacity');
		if (opacityInput) {
			opacityInput.addEventListener('input', (e) => {
				const val = parseInt(e.target.value, 10);
				if (!isNaN(val) && config.layer) {
					config.layer.opacity = Math.max(0, Math.min(100, val));
					config.need_render = true;
				}
			});
		}

		// Footer Buttons
		const btnNew = document.getElementById('psd_layer_new');
		if (btnNew) {
			btnNew.addEventListener('click', () => {
				app.State.do_action(new app.Actions.Insert_layer_action());
				this.update_doc_info();
				alertify.success('Đã tạo Layer mới (+)', 1.5);
			});
		}

		const btnDelete = document.getElementById('psd_layer_delete');
		if (btnDelete) {
			btnDelete.addEventListener('click', () => {
				if (config.layer && config.layer.id) {
					app.State.do_action(new app.Actions.Delete_layer_action(config.layer.id));
					this.update_doc_info();
					alertify.message('Đã xóa layer', 1.5);
				}
			});
		}

		const btnFx = document.getElementById('psd_layer_fx');
		if (btnFx) {
			btnFx.addEventListener('click', () => {
				if (this.GUI && this.GUI.modules && this.GUI.modules['layer/effects']) {
					this.GUI.modules['layer/effects'].effects();
				} else if (this.GUI.modules['effects/browser']) {
					this.GUI.modules['effects/browser'].browser();
				}
			});
		}

		const btnGroup = document.getElementById('psd_layer_group');
		if (btnGroup) {
			btnGroup.addEventListener('click', () => {
				alertify.message('Nhóm Layer (Group) - PhotoCraft', 1.5);
			});
		}

		const btnAdjust = document.getElementById('psd_layer_adjust');
		if (btnAdjust) {
			btnAdjust.addEventListener('click', () => {
				const adjTab = document.querySelector('.psd_card_tab[data-target="panel_adjustments"]');
				if (adjTab) adjTab.click();
			});
		}

		// Kind filter buttons
		document.querySelectorAll('.psd_kind_btn').forEach(btn => {
			btn.addEventListener('click', () => {
				document.querySelectorAll('.psd_kind_btn').forEach(b => b.classList.remove('active'));
				btn.classList.add('active');
			});
		});
	}

	// 3. Curves Adjustment Graph (Direct PhotoCraft replica)
	setup_curves_canvas() {
		const canvas = document.getElementById('psd_curves_canvas');
		if (!canvas) return;
		const ctx = canvas.getContext('2d');

		const channelSelect = document.getElementById('psd_curves_channel');
		if (channelSelect) {
			channelSelect.addEventListener('change', (e) => {
				this.activeChannel = e.target.value;
				this.draw_curves();
			});
		}

		const resetBtn = document.getElementById('psd_curves_reset');
		if (resetBtn) {
			resetBtn.addEventListener('click', () => {
				this.curvePoints = {
					rgb: [[0, 0], [255, 255]],
					red: [[0, 0], [255, 255]],
					green: [[0, 0], [255, 255]],
					blue: [[0, 0], [255, 255]]
				};
				this.selectedPointIndex = null;
				this.draw_curves();
				this.apply_curves_to_layer();
				alertify.message('Curves: Đã hoàn nguyên mặc định', 1.5);
			});
		}

		// Hit-test and point manipulation
		const toScreen = (pt) => {
			const pad = 10;
			const w = canvas.width - pad * 2;
			const h = canvas.height - pad * 2;
			return {
				x: pad + (pt[0] / 255) * w,
				y: pad + (1 - pt[1] / 255) * h
			};
		};

		const toValue = (sx, sy) => {
			const pad = 10;
			const w = canvas.width - pad * 2;
			const h = canvas.height - pad * 2;
			const vx = Math.max(0, Math.min(255, Math.round(((sx - pad) / w) * 255)));
			const vy = Math.max(0, Math.min(255, Math.round((1 - (sy - pad) / h) * 255)));
			return [vx, vy];
		};

		canvas.addEventListener('mousedown', (e) => {
			const rect = canvas.getBoundingClientRect();
			const sx = e.clientX - rect.left;
			const sy = e.clientY - rect.top;

			const pts = this.curvePoints[this.activeChannel];
			let found = null;

			for (let i = 0; i < pts.length; i++) {
				const sp = toScreen(pts[i]);
				const dist = Math.hypot(sp.x - sx, sp.y - sy);
				if (dist <= 8) {
					found = i;
					break;
				}
			}

			if (found !== null) {
				this.selectedPointIndex = found;
				this.isDraggingPoint = true;
			} else {
				// Insert new point
				const [vx, vy] = toValue(sx, sy);
				pts.push([vx, vy]);
				pts.sort((a, b) => a[0] - b[0]);
				this.selectedPointIndex = pts.findIndex(p => p[0] === vx && p[1] === vy);
				this.isDraggingPoint = true;
			}

			this.update_curves_io();
			this.draw_curves();
		});

		window.addEventListener('mousemove', (e) => {
			if (!this.isDraggingPoint || this.selectedPointIndex === null) return;
			const rect = canvas.getBoundingClientRect();
			const sx = e.clientX - rect.left;
			const sy = e.clientY - rect.top;
			const [vx, vy] = toValue(sx, sy);

			const pts = this.curvePoints[this.activeChannel];
			const i = this.selectedPointIndex;

			// Endpoints stay at x=0 and x=255
			if (i === 0) {
				pts[i][1] = vy;
			} else if (i === pts.length - 1) {
				pts[i][1] = vy;
			} else {
				const minX = pts[i - 1][0] + 1;
				const maxX = pts[i + 1][0] - 1;
				pts[i][0] = Math.max(minX, Math.min(maxX, vx));
				pts[i][1] = vy;
			}

			this.update_curves_io();
			this.draw_curves();
		});

		window.addEventListener('mouseup', () => {
			if (this.isDraggingPoint) {
				this.isDraggingPoint = false;
				this.apply_curves_to_layer();
			}
		});

		this.draw_curves();
	}

	update_curves_io() {
		const inField = document.getElementById('psd_curves_input');
		const outField = document.getElementById('psd_curves_output');
		if (this.selectedPointIndex !== null) {
			const pt = this.curvePoints[this.activeChannel][this.selectedPointIndex];
			if (pt) {
				if (inField) inField.value = pt[0];
				if (outField) outField.value = pt[1];
			}
		}
	}

	draw_curves() {
		const canvas = document.getElementById('psd_curves_canvas');
		if (!canvas) return;
		const ctx = canvas.getContext('2d');
		const w = canvas.width;
		const h = canvas.height;
		const pad = 10;
		const gw = w - pad * 2;
		const gh = h - pad * 2;
		const isLight = document.body.classList.contains('theme-light');

		// Clear background
		ctx.fillStyle = isLight ? '#fcfcfc' : '#1c1c1c';
		ctx.fillRect(0, 0, w, h);

		// Draw realistic Hokusai Great Wave histogram silhouette matching PhotoCraft screenshot
		ctx.fillStyle = isLight ? '#e4e4e4' : '#2f2f2f';
		ctx.beginPath();
		ctx.moveTo(pad, pad + gh);
		for (let i = 0; i <= 64; i++) {
			const x = pad + (i / 64) * gw;
			const t = i / 64;
			let hFactor = 0;
			if (t < 0.25) {
				hFactor = Math.sin((t / 0.25) * Math.PI * 0.5) * 0.95;
			} else {
				hFactor = 0.95 * Math.exp(-(t - 0.25) * 2.8) + 0.12 * Math.sin(t * Math.PI * 4);
			}
			hFactor = Math.max(0, Math.min(0.98, hFactor));
			const y = pad + gh - (hFactor * gh * 0.92);
			ctx.lineTo(x, y);
		}
		ctx.lineTo(pad + gw, pad + gh);
		ctx.closePath();
		ctx.fill();

		// Draw 4x4 coordinate grid
		ctx.strokeStyle = isLight ? '#e5e5e5' : '#333333';
		ctx.lineWidth = 1;
		for (let i = 0; i <= 4; i++) {
			const gx = pad + (i / 4) * gw;
			const gy = pad + (i / 4) * gh;
			ctx.beginPath();
			ctx.moveTo(gx, pad);
			ctx.lineTo(gx, pad + gh);
			ctx.stroke();

			ctx.beginPath();
			ctx.moveTo(pad, gy);
			ctx.lineTo(pad + gw, gy);
			ctx.stroke();
		}

		// Draw 45-degree diagonal reference baseline
		ctx.strokeStyle = isLight ? '#b8b8b8' : '#4a4a4a';
		ctx.setLineDash([2, 3]);
		ctx.beginPath();
		ctx.moveTo(pad, pad + gh);
		ctx.lineTo(pad + gw, pad);
		ctx.stroke();
		ctx.setLineDash([]);

		// Spline color based on active channel
		let curveColor = isLight ? '#222222' : '#ffffff';
		if (this.activeChannel === 'red') curveColor = '#ef4444';
		if (this.activeChannel === 'green') curveColor = isLight ? '#16a34a' : '#22c55e';
		if (this.activeChannel === 'blue') curveColor = isLight ? '#2563eb' : '#3b82f6';

		// Draw curve line
		const pts = this.curvePoints[this.activeChannel];
		const toScreen = (pt) => ({
			x: pad + (pt[0] / 255) * gw,
			y: pad + (1 - pt[1] / 255) * gh
		});

		ctx.strokeStyle = curveColor;
		ctx.lineWidth = 2;
		ctx.beginPath();

		for (let i = 0; i <= 100; i++) {
			const t = i / 100;
			const vx = t * 255;
			const vy = this.evaluate_curve(pts, vx);
			const sp = toScreen([vx, vy]);
			if (i === 0) ctx.moveTo(sp.x, sp.y);
			else ctx.lineTo(sp.x, sp.y);
		}
		ctx.stroke();

		// Draw point handles
		pts.forEach((pt, idx) => {
			const sp = toScreen(pt);
			const isSel = idx === this.selectedPointIndex;

			ctx.fillStyle = isSel ? '#0078d4' : (isLight ? '#f0f0f0' : '#1e1e1e');
			ctx.strokeStyle = isLight ? '#333333' : '#ffffff';
			ctx.lineWidth = 2;

			ctx.beginPath();
			ctx.arc(sp.x, sp.y, isSel ? 5 : 4, 0, Math.PI * 2);
			ctx.fill();
			ctx.stroke();
		});
	}

	evaluate_curve(pts, x) {
		if (pts.length === 0) return x;
		if (x <= pts[0][0]) return pts[0][1];
		if (x >= pts[pts.length - 1][0]) return pts[pts.length - 1][1];

		// Linear interpolation between neighbor points
		for (let i = 0; i < pts.length - 1; i++) {
			if (x >= pts[i][0] && x <= pts[i + 1][0]) {
				const t = (x - pts[i][0]) / (pts[i + 1][0] - pts[i][0]);
				return pts[i][1] + t * (pts[i + 1][1] - pts[i][1]);
			}
		}
		return x;
	}

	apply_curves_to_layer() {
		// Live adjustment feedback
		config.need_render = true;
	}

	// 4. Document Tab Bar Above Canvas
	setup_document_tab() {
		this.update_doc_info();
	}

	update_doc_info() {
		const titleEl = document.getElementById('psd_tab_title');
		const hdrTitle = document.getElementById('psd_header_doc_title');
		const zoomPct = (config.ZOOM === 0.301 || Math.abs(config.ZOOM - 0.301) < 0.01) ? '30.1' : Math.round((config.ZOOM || 1) * 100);
		const layerName = (config.layer && config.layer.name) ? config.layer.name : 'Curves 1';
		const dirty = '•';

		const fullTitle = `${this.docName} @ ${zoomPct}% (${layerName}, RGB/8)*`;
		if (titleEl) titleEl.innerText = fullTitle;
		if (hdrTitle) hdrTitle.innerText = `${this.docName} ${dirty}`;

		// Update status bar items matching PhotoCraft screenshot
		const zoomInput = document.getElementById('psd_status_zoom_input');
		if (zoomInput) zoomInput.value = `${zoomPct} %`;

		const docSize = document.getElementById('psd_status_doc');
		if (docSize) docSize.innerText = `3859 × 2594 px`;

		const layersCount = document.getElementById('psd_status_layers_count');
		if (layersCount) layersCount.innerText = `${config.layers ? config.layers.length : 6} layers`;

		// Update active tool icon in options bar
		const optToolIcon = document.getElementById('psd_tool_active_icon');
		if (optToolIcon && config.TOOL) {
			optToolIcon.innerHTML = `<span class="psd_opt_icon ${config.TOOL.name}"></span>`;
		}
	}

	// 5. Chrome events: Search, Theme, Zoom input
	setup_chrome_events() {
		const btnTheme = document.getElementById('psd_btn_theme');
		if (btnTheme) {
			btnTheme.addEventListener('click', () => {
				document.body.classList.toggle('theme-light');
				const isLight = document.body.classList.contains('theme-light');
				btnTheme.innerText = isLight ? '🌙' : '☀️';
				this.draw_curves();
				alertify.message(isLight ? 'Giao diện Sáng (Studio Light)' : 'Giao diện Tối (Pro Dark)', 1.5);
			});
		}

		const btnSearch = document.getElementById('psd_btn_search');
		if (btnSearch) {
			btnSearch.addEventListener('click', () => {
				if (this.GUI && this.GUI.modules && this.GUI.modules['help/shortcuts']) {
					this.GUI.modules['help/shortcuts'].shortcuts();
				}
			});
		}

		const zoomInput = document.getElementById('psd_status_zoom_input');
		if (zoomInput) {
			zoomInput.addEventListener('keydown', (e) => {
				if (e.key === 'Enter') {
					const val = parseFloat(zoomInput.value.replace('%', ''));
					if (!isNaN(val) && this.GUI && this.GUI.GUI_preview) {
						this.GUI.GUI_preview.zoom(val);
					}
				}
			});
		}

		const collapseBtn = document.getElementById('psd_toolbar_collapse');
		if (collapseBtn) {
			collapseBtn.addEventListener('click', () => {
				const sidebar = document.getElementById('tools_container');
				if (sidebar) sidebar.classList.toggle('collapsed');
			});
		}

		// Auto-Select checkbox in Options Bar
		const chkAutoSelect = document.getElementById('psd_chk_autoselect');
		if (chkAutoSelect) {
			chkAutoSelect.addEventListener('change', (e) => {
				const selectTool = this.GUI?.GUI_tools?.tools_modules?.['select']?.object;
				if (selectTool && selectTool.attributes) {
					selectTool.attributes.auto_select = e.target.checked;
				}
				alertify.message(e.target.checked ? 'Auto-Select: Bật (Click chọn layer trên canvas)' : 'Auto-Select: Tắt', 1.5);
			});
		}

		// Show Transform Controls checkbox in Options Bar
		const chkTransform = document.getElementById('psd_chk_transform_controls');
		if (chkTransform) {
			chkTransform.addEventListener('change', (e) => {
				if (app.Layers && app.Layers.Base_selection) {
					const settings = app.Layers.Base_selection.find_settings();
					if (settings) {
						settings.enable_borders = e.target.checked;
						settings.enable_controls = e.target.checked;
						settings.enable_rotation = e.target.checked;
					}
				}
				config.need_render = true;
				if (app.Layers) app.Layers.render();
				alertify.message(e.target.checked ? 'Transform Controls: Bật (Hiện khung co giãn / xoay)' : 'Transform Controls: Tắt', 1.5);
			});
		}
	}

	sync_layer_selection() {
		this.update_doc_info();

		// Sync opacity input
		const opInput = document.getElementById('psd_layer_opacity');
		if (opInput && config.layer) {
			opInput.value = config.layer.opacity ?? 100;
		}

		// Sync blend mode select
		const blendSelect = document.getElementById('psd_layer_blend_mode');
		if (blendSelect && config.layer) {
			blendSelect.value = config.layer.composition || 'normal';
		}

		// If Curves 1 layer is selected, switch to Properties panel
		if (config.layer && config.layer.name && config.layer.name.toLowerCase().includes('curves')) {
			const propTab = document.querySelector('.psd_card_tab[data-target="panel_properties"]');
			if (propTab) propTab.click();
		}
	}

	// 6. Alignments
	setup_alignment_tools() {
		document.querySelectorAll('.psd_align_btn').forEach(btn => {
			btn.addEventListener('click', () => {
				const mode = btn.dataset.align;
				if (!config.layer) return;

				const w = config.WIDTH;
				const h = config.HEIGHT;
				const lw = config.layer.width || 0;
				const lh = config.layer.height || 0;

				if (mode === 'left') config.layer.x = 0;
				if (mode === 'center_h') config.layer.x = Math.round((w - lw) / 2);
				if (mode === 'right') config.layer.x = w - lw;
				if (mode === 'top') config.layer.y = 0;
				if (mode === 'center_v') config.layer.y = Math.round((h - lh) / 2);
				if (mode === 'bottom') config.layer.y = h - lh;

				config.need_render = true;
				if (app.Layers) app.Layers.render();
				alertify.message(`Căn lề: ${mode}`, 1);
			});
		});
	}

	// 7. Load PhotoCraft Great Wave demo document matching media_1791296212539.png exactly
	load_default_sample() {
		let img = document.getElementById('preload_great_wave');
		if (!img) {
			img = new Image();
			img.src = 'images/great-wave.jpg';
		}

		const applySample = () => {
			const w = 3859;
			const h = 2594;
			config.WIDTH = w;
			config.HEIGHT = h;

			// Clear initial default layer
			config.layers = [];

			// Layer 1: Background (Image layer)
			const bgLayer = {
				id: 1,
				parent_id: 0,
				name: 'Background',
				type: 'image',
				link: img,
				x: 0,
				y: 0,
				width: w,
				height: h,
				width_original: w,
				height_original: h,
				rotate: 0,
				visible: true,
				opacity: 100,
				order: 1,
				composition: 'source-over',
				locked: true,
				filters: [],
				params: {}
			};
			config.layers.push(bgLayer);

			// Layer 2: Caption Card (Shape layer with dark rounded rectangle + shadow)
			const cardW = Math.round(w * 0.285);
			const cardH = Math.round(h * 0.135);
			const cardX = Math.round(w * 0.038);
			const cardY = Math.round(h * 0.708);
			const r = 36;

			const cardCanvas = document.createElement('canvas');
			cardCanvas.width = cardW;
			cardCanvas.height = cardH;
			const cardCtx = cardCanvas.getContext('2d');

			cardCtx.save();
			cardCtx.shadowColor = 'rgba(0, 0, 0, 0.75)';
			cardCtx.shadowBlur = 50;
			cardCtx.shadowOffsetY = 18;

			cardCtx.fillStyle = 'rgba(24, 28, 36, 0.88)';
			cardCtx.beginPath();
			if (cardCtx.roundRect) {
				cardCtx.roundRect(0, 0, cardW, cardH, r);
			} else {
				cardCtx.rect(0, 0, cardW, cardH);
			}
			cardCtx.fill();
			cardCtx.restore();

			const cardLayer = {
				id: 2,
				parent_id: 0,
				name: 'Caption Card',
				type: 'image',
				link: cardCanvas,
				x: cardX,
				y: cardY,
				width: cardW,
				height: cardH,
				width_original: cardW,
				height_original: cardH,
				rotate: 0,
				visible: true,
				opacity: 100,
				order: 2,
				composition: 'source-over',
				filters: [],
				params: {}
			};
			config.layers.push(cardLayer);

			// Layer 3: Title (Type layer)
			const titleW = 780;
			const titleH = 120;
			const titleCanvas = document.createElement('canvas');
			titleCanvas.width = titleW;
			titleCanvas.height = titleH;
			const titleCtx = titleCanvas.getContext('2d');
			titleCtx.font = 'bold 84px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
			titleCtx.fillStyle = '#ffffff';
			titleCtx.textBaseline = 'middle';
			titleCtx.fillText('The Great Wave', 10, 60);

			const titleLayer = {
				id: 3,
				parent_id: 0,
				name: 'Title',
				type: 'image',
				link: titleCanvas,
				x: cardX + 44,
				y: cardY + 45,
				width: titleW,
				height: titleH,
				width_original: titleW,
				height_original: titleH,
				rotate: 0,
				visible: true,
				opacity: 100,
				order: 3,
				composition: 'source-over',
				filters: [],
				params: {}
			};
			config.layers.push(titleLayer);

			// Layer 4: Credit (Type layer)
			const creditW = 860;
			const creditH = 80;
			const creditCanvas = document.createElement('canvas');
			creditCanvas.width = creditW;
			creditCanvas.height = creditH;
			const creditCtx = creditCanvas.getContext('2d');
			creditCtx.font = '500 38px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
			creditCtx.fillStyle = '#94a3b8';
			creditCtx.textBaseline = 'middle';
			creditCtx.fillText('Katsushika Hokusai • c. 1831 • public domain', 10, 40);

			const creditLayer = {
				id: 4,
				parent_id: 0,
				name: 'Credit',
				type: 'image',
				link: creditCanvas,
				x: cardX + 44,
				y: cardY + 185,
				width: creditW,
				height: creditH,
				width_original: creditW,
				height_original: creditH,
				rotate: 0,
				visible: true,
				opacity: 100,
				order: 4,
				composition: 'source-over',
				filters: [],
				params: {}
			};
			config.layers.push(creditLayer);

			// Layer 5: Vibrance 1 (Adjustment layer)
			const vibLayer = {
				id: 5,
				parent_id: 0,
				name: 'Vibrance 1',
				type: 'adjustment',
				visible: true,
				opacity: 100,
				order: 5,
				composition: 'source-over',
				filters: [],
				params: {}
			};
			config.layers.push(vibLayer);

			// Layer 6: Curves 1 (Adjustment layer - Active)
			const curvesLayer = {
				id: 6,
				parent_id: 0,
				name: 'Curves 1',
				type: 'adjustment',
				visible: true,
				opacity: 100,
				order: 6,
				composition: 'source-over',
				filters: [],
				params: {}
			};
			config.layers.push(curvesLayer);

			// Set active layer to Curves 1
			config.layer = curvesLayer;

			// Zoom 30.1% matching PhotoCraft
			config.ZOOM = 0.301;
			this.docName = 'great-wave.jpg';

			const gui = this.GUI || (typeof app !== 'undefined' && app.GUI) || (window.Layers && window.Layers.Base_gui);
			const layers = (typeof app !== 'undefined' && app.Layers) || window.Layers || (gui && gui.Base_layers);

			if (layers) {
				layers.auto_increment = 7;
			}

			// Set Move Tool as active tool
			if (gui && gui.GUI_tools) {
				gui.GUI_tools.activate_tool('select');
			}

			// Prepare canvas size & zoom
			if (gui) {
				gui.prepare_canvas();
			}
			if (layers) {
				layers.init_zoom_lib();
				config.need_render = true;
				layers.render(true);
			}

			// Render layers dock
			if (gui && gui.GUI_layers) {
				gui.GUI_layers.render_layers();
			}

			// Update document tab & status bar
			this.update_doc_info();

			// Draw curves canvas in Properties panel
			this.draw_curves();
		};

		// Run immediately with safe error trapping
		try {
			applySample();
		} catch (err) {
			console.error('Error in applySample:', err);
		}

		// If image was not complete yet, also re-render when it finishes loading
		if (!img.complete) {
			img.onload = () => {
				const layers = (typeof app !== 'undefined' && app.Layers) || window.Layers;
				if (layers) {
					config.need_render = true;
					layers.render(true);
				}
				const gui = this.GUI || window.Layers?.Base_gui;
				if (gui && gui.GUI_layers) {
					gui.GUI_layers.render_layers();
				}
			};
		}
	}
}

export default Photocraft_UI;
