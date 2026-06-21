/**
 * refineSearch
 *
 */

export function refineSearch() {
	const refineSearchEl = document.querySelector('.c-refineSearch');
	if (!refineSearchEl) return;

	const checkboxes = refineSearchEl.querySelectorAll('.c-checkbox');
	const submitBtn = refineSearchEl.querySelector('.c-btnSquare.--submit');
	const clearBtn = document.getElementById('refineClear');

	function toggleSubmitBtn() {
		const hasChecked = Array.from(checkboxes).some((el) => el.checked);
		submitBtn.classList.toggle('--hidden', !hasChecked);
	}


	// 初期状態を反映（ページ読み込み時にチェック済みがあればボタン表示）
	toggleSubmitBtn();

	// 各チェックボックスの変更を監視
	checkboxes.forEach((el) => {
		el.addEventListener('change', toggleSubmitBtn);
	});

	// リセットボタン
	clearBtn?.addEventListener('click', () => {
		checkboxes.forEach((el) => {
			el.checked = false;
		});
		toggleSubmitBtn();
	});
}