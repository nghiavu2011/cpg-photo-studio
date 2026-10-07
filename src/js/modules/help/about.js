import config from './../../config.js';
import Dialog_class from './../../libs/popup.js';

class Help_about_class {

	constructor() {
		this.POP = new Dialog_class();
	}

	about() {
		var settings = {
			title: 'Giới Thiệu CPG Photo Studio 2020',
			params: [
				{
					title: "",
					html: '<div style="text-align:center; padding: 12px;"><img style="max-height:85px; filter: drop-shadow(0 4px 10px rgba(0,0,0,0.6));" alt="CPG Logo" src="images/cpg_logo_white_opt.png" /></div>'
				},
				{
					title: "Tên ứng dụng:",
					html: '<strong style="color:#38a8ff; font-size:16px;">CPG Photo Studio (PSD CC 2020 Edition)</strong>'
				},
				{
					title: "Phiên bản:",
					value: "v2020.1.0 Pro"
				},
				{
					title: "Mục đích:",
					value: "Trình chỉnh sửa ảnh đồ họa chuyên nghiệp giao diện chuẩn Photoshop CC 2020, tích hợp công cụ đóng dấu bản quyền thương hiệu CPG."
				},
				{
					title: "Nền tảng:",
					value: "HTML5 Canvas Engine (MIT License Core & CPG Design System)"
				},
				{
					title: "Bản quyền:",
					html: '<span style="color:#8bdb8b;">© CPG Corporation - Đẳng cấp & Khẳng định thương hiệu.</span>'
				}
			],
		};
		this.POP.show(settings);
	}

}

export default Help_about_class;
