import Dialog_class from './../../libs/popup.js';
import config from './../../config.js';

class Help_shortcuts_class {

	constructor() {
		this.POP = new Dialog_class();
	}

	shortcuts() {
		const isVi = config.LANG === 'vi';
		var settings = {
			title: isVi ? 'Bảng Phím Tắt Adobe Photoshop CC 2020' : 'Adobe Photoshop CC 2020 Keyboard Shortcuts',
			className: 'shortcuts',
			params: [
				{title: "V", value: isVi ? 'Công cụ Di chuyển / Chọn (Move Tool)' : 'Move Tool'},
				{title: "M", value: isVi ? 'Vùng chọn hình chữ nhật / elip (Marquee)' : 'Marquee Selection Tool'},
				{title: "C", value: isVi ? 'Cắt cúp ảnh (Crop Tool • Enter/Esc)' : 'Crop Tool (Enter commit / Esc cancel)'},
				{title: "I", value: isVi ? 'Chấm màu / Hút màu (Eyedropper Tool)' : 'Eyedropper Tool'},
				{title: "B", value: isVi ? 'Cọ vẽ (Bấm B để đổi Bút chì/Cọ vẽ)' : 'Brush Tool (Press B to cycle Brush / Pencil)'},
				{title: "N", value: isVi ? 'Bút chì (Pencil Tool)' : 'Pencil Tool'},
				{title: "E", value: isVi ? 'Cục tẩy (Bấm E để đổi Tẩy/Tẩy ma thuật)' : 'Eraser Tool (Press E to cycle Eraser / Magic Eraser)'},
				{title: "W", value: isVi ? 'Đũa thần / Tẩy thông minh (Magic Wand / Eraser)' : 'Magic Wand / Eraser Tool'},
				{title: "G", value: isVi ? 'Đổ màu / Gradient (Bấm G để đổi Thùng sơn/Gradient)' : 'Paint Bucket / Gradient (Press G to cycle)'},
				{title: "T", value: isVi ? 'Viết chữ (Type / Text Tool)' : 'Horizontal Type Tool'},
				{title: "U", value: isVi ? 'Vẽ hình học (Rectangle / Shapes)' : 'Shapes Tool'},
				{title: "S", value: isVi ? 'Đóng dấu nhân bản (Clone Stamp Tool)' : 'Clone Stamp Tool'},
				{title: "R", value: isVi ? 'Làm mờ ảnh (Bấm R để đổi Làm mờ/Làm nét)' : 'Blur Tool (Press R to cycle Blur / Sharpen)'},
				{title: "O", value: isVi ? 'Làm sáng / tối ảnh (Dodge / Burn / Sponge)' : 'Dodge / Burn / Sponge Tool'},
				{title: "Z", value: isVi ? 'Kính lúp phóng to (Zoom Tool)' : 'Zoom Tool'},
				{title: "Space + Drag", value: isVi ? 'Bàn tay cuộn khung hình (Hand / Pan Tool)' : 'Hand / Pan Tool (Hold Space to drag)'},
				{title: "Arrow Keys", value: isVi ? 'Dịch chuyển Layer 1px (Giữ Shift: 10px)' : 'Layer Nudge 1px (Hold Shift: 10px)'},
				{title: "X", value: isVi ? 'Hoán đổi màu vẽ Trước / Sau (Swap Colors)' : 'Swap Foreground / Background Colors'},
				{title: "D", value: isVi ? 'Khôi phục màu Đen / Trắng mặc định (Default B&W)' : 'Default Colors (Black & White)'},
				{title: "[ / ]", value: isVi ? 'Thu nhỏ / Phóng to kích thước cọ (Brush Size)' : 'Decrease / Increase Brush Size'},
				{title: "Ctrl + Z", value: isVi ? 'Hoàn tác bước trước (Undo)' : 'Undo'},
				{title: "Ctrl + Shift + Z", value: isVi ? 'Làm lại bước sau (Redo)' : 'Redo (Ctrl+Shift+Z)'},
				{title: "Ctrl + S", value: isVi ? 'Xuất file ảnh (Export)' : 'Export Image'},
				{title: "Ctrl + Shift + S", value: isVi ? 'Lưu dự án đầy đủ layer (Save Project JSON)' : 'Save Project JSON'},
				{title: "Ctrl + Shift + E", value: isVi ? 'Xuất nhanh PNG 1-click (Quick Export PNG)' : 'Quick Export as PNG'},
				{title: "Ctrl + O", value: isVi ? 'Mở file ảnh (Open File)' : 'Open File'},
				{title: "Ctrl + N", value: isVi ? 'Tạo tài liệu mới (New Document)' : 'New Document'},
				{title: "Ctrl + J", value: isVi ? 'Nhân đôi Layer đang chọn (Duplicate Layer)' : 'Duplicate Layer'},
				{title: "Ctrl + A", value: isVi ? 'Chọn toàn bộ canvas (Select All)' : 'Select All'},
				{title: "Ctrl + D", value: isVi ? 'Hủy chọn (Deselect)' : 'Deselect'},
				{title: "Ctrl + T", value: isVi ? 'Biến đổi tự do (Free Transform / Move)' : 'Free Transform'},
				{title: "Ctrl + R", value: isVi ? 'Bật / Tắt thước đo (Ruler)' : 'Toggle Rulers'},
				{title: "Ctrl + '", value: isVi ? 'Bật / Tắt lưới tọa độ (Grid)' : 'Toggle Grid'},
				{title: "Ctrl + (+) / (-)", value: isVi ? 'Phóng to / Thu nhỏ vùng nhìn' : 'Zoom In / Out'},
				{title: "Ctrl + 0", value: isVi ? 'Hiển thị vừa vặn màn hình (Fit to Window)' : 'Fit on Screen'},
				{title: "Ctrl + 1", value: isVi ? 'Hiển thị tỷ lệ 100% chuẩn pixel' : 'Actual Pixels (100%)'}
			],
		};
		this.POP.show(settings);
	}

}

export default Help_shortcuts_class;
