import Swal, { SweetAlertOptions, type SweetAlertResult } from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

const MySwal = withReactContent(Swal);

// Custom styled SweetAlert2 instances
const customSwal = MySwal.mixin({
	heightAuto: false,
	scrollbarPadding: false,
	customClass: {
		popup:
			"rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 p-6 font-sans",
		title: "text-base font-bold text-slate-900 dark:text-slate-100 mb-2",
		htmlContainer:
			"text-xs font-medium text-slate-600 dark:text-slate-400 mb-4",
		confirmButton:
			"px-4 py-2 rounded-xl text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white transition-all shadow-md mx-1 cursor-pointer",
		cancelButton:
			"px-4 py-2 rounded-xl text-xs font-semibold bg-slate-200 hover:bg-slate-300 text-slate-800 transition-all mx-1 cursor-pointer",
		denyButton:
			"px-4 py-2 rounded-xl text-xs font-semibold bg-rose-500 hover:bg-rose-600 text-white transition-all mx-1 cursor-pointer",
	},
	buttonsStyling: false,
});

export interface AlertOptions {
	title: string;
	text?: string;
	html?: string | HTMLElement;
	icon?: "success" | "error" | "warning" | "info" | "question";
	confirmButtonText?: string;
	cancelButtonText?: string;
	showConfirmButton?: boolean;
	showCancelButton?: boolean;
	timer?: number;
	timerProgressBar?: boolean;
}

/**
 * Standard Alert Dialog (Success / Error / Info)
 */
export function showAlert(options: AlertOptions): Promise<SweetAlertResult> {
	return customSwal.fire({
		title: options.title,
		text: options.text,
		html: options.html,
		icon: options.icon || "info",
		confirmButtonText: options.confirmButtonText || "ตกลง",
		cancelButtonText: options.cancelButtonText || "ยกเลิก",
		showConfirmButton:
			options.showConfirmButton !== undefined
				? options.showConfirmButton
				: true,
		showCancelButton: options.showCancelButton || false,
		timer: options.timer,
		timerProgressBar: options.timerProgressBar || false,
	});
}

/**
 * Confirmation Dialog for Action Verification (e.g. Delete, Archive)
 */
export function showConfirm(
	title: string,
	text: string = "",
	confirmText: string = "ยืนยัน",
	cancelText: string = "ยกเลิก",
): Promise<SweetAlertResult> {
	return customSwal.fire({
		title,
		text,
		icon: "warning",
		showCancelButton: true,
		confirmButtonText: confirmText,
		cancelButtonText: cancelText,
		focusCancel: true,
	});
}

/**
 * Success Toast Alert Alert
 */
export function showSuccessAlert(
	title: string,
	text?: string,
): Promise<SweetAlertResult> {
	return showAlert({ title, text, icon: "success" });
}

/**
 * Error Alert
 */
export function showErrorAlert(
	title: string,
	text?: string,
): Promise<SweetAlertResult> {
	return showAlert({ title, text, icon: "error" });
}

export { customSwal };
