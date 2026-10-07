import app from './../../app.js';
import config from './../../config.js';
import Dialog_class from './../../libs/popup.js';
import alertify from './../../../../node_modules/alertifyjs/build/alertify.min.js';
import Base_layers_class from './../../core/base-layers.js';

var instance = null;

class Cpg_stamp_class {

	constructor() {
		if (instance) {
			return instance;
		}
		instance = this;

		this.POP = new Dialog_class();
		this.Base_layers = new Base_layers_class();

		this.logo_white_src = 'images/cpg_logo_white_opt.png';
		this.logo_color_src = 'images/cpg_logo_color_opt.png';
	}

	quick_stamp() {
		this.apply_stamp({
			variant: 'white',
			position: 'bottom-right',
			scale_percent: 20,
			opacity: 90
		});
	}

	stamp_dialog() {
		var _this = this;

		var settings = {
			title: 'Gắn Logo Thương Hiệu CPG (Watermark)',
			params: [
				{
					title: "Loại Logo:",
					name: "variant",
					type: "select",
					values: ["Logo Trắng (Khuyên dùng)", "Logo Màu Nguyên Bản"],
					value: "Logo Trắng (Khuyên dùng)"
				},
				{
					title: "Vị trí gắn:",
					name: "position",
					type: "select",
					values: ["Góc Dưới - Phải", "Góc Dưới - Trái", "Góc Trên - Phải", "Góc Trên - Trái", "Chính Giữa"],
					value: "Góc Dưới - Phải"
				},
				{
					title: "Tỷ lệ kích thước (%):",
					name: "scale_percent",
					type: "select",
					values: ["12% (Nhỏ gọn)", "18% (Vừa chuẩn PSD)", "25% (Rõ ràng)", "35% (Lớn)"],
					value: "18% (Vừa chuẩn PSD)"
				},
				{
					title: "Độ trong suốt (Opacity %):",
					name: "opacity",
					type: "select",
					values: ["100% (Rõ tuyệt đối)", "90% (Tiêu chuẩn)", "75% (Mờ nhẹ)", "50% (Watermark mờ)"],
					value: "90% (Tiêu chuẩn)"
				}
			],
			on_finish: function (params) {
				var variant = params.variant.includes('Màu') ? 'color' : 'white';
				
				var pos = 'bottom-right';
				if (params.position.includes('Dưới - Trái')) pos = 'bottom-left';
				else if (params.position.includes('Trên - Phải')) pos = 'top-right';
				else if (params.position.includes('Trên - Trái')) pos = 'top-left';
				else if (params.position.includes('Chính Giữa')) pos = 'center';

				var scale = 18;
				if (params.scale_percent.includes('12%')) scale = 12;
				else if (params.scale_percent.includes('18%')) scale = 18;
				else if (params.scale_percent.includes('25%')) scale = 25;
				else if (params.scale_percent.includes('35%')) scale = 35;

				var opacity = 90;
				if (params.opacity.includes('100%')) opacity = 100;
				else if (params.opacity.includes('90%')) opacity = 90;
				else if (params.opacity.includes('75%')) opacity = 75;
				else if (params.opacity.includes('50%')) opacity = 50;

				_this.apply_stamp({
					variant: variant,
					position: pos,
					scale_percent: scale,
					opacity: opacity
				});
			}
		};
		this.POP.show(settings);
	}

	apply_stamp(options) {
		var _this = this;
		var src = options.variant === 'color' ? this.logo_color_src : this.logo_white_src;

		var img = new Image();
		img.crossOrigin = 'Anonymous';
		img.onload = function () {
			var canvasW = config.WIDTH || 1000;
			var canvasH = config.HEIGHT || 800;

			// Desired width based on percentage of canvas width
			var targetW = Math.round(canvasW * (options.scale_percent / 100));
			if (targetW < 80) targetW = 80;
			if (targetW > canvasW * 0.9) targetW = Math.round(canvasW * 0.9);

			var aspectRatio = img.width / img.height;
			var targetH = Math.round(targetW / aspectRatio);

			var margin = Math.round(Math.min(canvasW, canvasH) * 0.03);
			if (margin < 15) margin = 15;

			var posX = 0;
			var posY = 0;

			switch (options.position) {
				case 'bottom-right':
					posX = canvasW - targetW - margin;
					posY = canvasH - targetH - margin;
					break;
				case 'bottom-left':
					posX = margin;
					posY = canvasH - targetH - margin;
					break;
				case 'top-right':
					posX = canvasW - targetW - margin;
					posY = margin;
					break;
				case 'top-left':
					posX = margin;
					posY = margin;
					break;
				case 'center':
					posX = Math.round((canvasW - targetW) / 2);
					posY = Math.round((canvasH - targetH) / 2);
					break;
			}

			var new_layer = {
				name: 'CPG Logo',
				type: 'image',
				data: src,
				x: Math.max(0, posX),
				y: Math.max(0, posY),
				width: targetW,
				height: targetH,
				opacity: options.opacity || 90
			};

			app.State.do_action(
				new app.Actions.Insert_layer_action(new_layer, false)
			).then(() => {
				alertify.success('★ Đã gắn Logo CPG lên ảnh thành công!');
			});
		};

		img.onerror = function () {
			alertify.error('Không tìm thấy file ảnh logo CPG');
		};

		img.src = src;
	}

	about_cpg() {
		var settings = {
			title: 'CPG Photo Studio (PSD CC 2020)',
			params: [
				{
					title: "",
					html: '<div style="text-align:center; padding: 10px;"><img style="max-height:90px; filter: drop-shadow(0 2px 8px rgba(0,0,0,0.5));" alt="CPG" src="' + this.logo_white_src + '" /></div>'
				},
				{
					title: "Thương hiệu:",
					html: '<strong style="color:#38a8ff; font-size:16px;">CPG Photo Studio</strong>'
				},
				{
					title: "Giao diện:",
					value: "Adobe Photoshop CC 2020 Cleanroom Edition"
				},
				{
					title: "Tính năng nổi bật:",
					html: '<ul style="margin:0; padding-left:18px; line-height:1.5;">' +
						'<li>Chuẩn phím tắt Photoshop (V, M, C, I, B, E, W, G, T, U, Z, H...)</li>' +
						'<li>Gắn Logo CPG 1-click watermark bản quyền sắc nét</li>' +
						'<li>Quản lý Layer, Filter, Blend modes, Cắt ghép, Chữ, Màu sắc</li>' +
						'<li>Chạy thuần HTML5 Canvas mượt mà, độc lập, bảo mật dữ liệu</li>' +
						'</ul>'
				},
				{
					title: "Bản quyền:",
					value: "© CPG Corporation - All Rights Reserved."
				}
			]
		};
		this.POP.show(settings);
	}
}

export default Cpg_stamp_class;
