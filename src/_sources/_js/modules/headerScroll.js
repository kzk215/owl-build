/**
 * headerScroll
 * @param {number} scrollAmount - スクロール量のしきい値
 * @param {string} selector - 対象要素のセレクタ (デフォルト: '.l-header')
 * @param {string} className - 付与するクラス名 (デフォルト: 'js-scroll')
 * @param {number} offset - 上へのスクロール時のオフセット (デフォルト: 0)
 */
export function headerScroll(scrollAmount, selector = '.l-header', className = 'js-scroll',offset= 5) {
	const element = document.querySelector(selector);
	// 要素がなければ無視
	if (!element) return;

	let lastScrollY = 0;
	const hiddenClass = 'js-hidden';

	window.addEventListener('scroll', () => {
		const currentScrollY = window.scrollY;
		// スクロール量のしきい値でクラスを付与/削除
		if (currentScrollY >= scrollAmount) {
			element.classList.add(className);
		} else {
			element.classList.remove(className);
		}

		// 一番上に戻ったら js-hidden を強制削除
		if (currentScrollY <= 80) {
			element.classList.remove(hiddenClass);
		}
		// 下にスクロールしたら js-hidden を付与（ページ最上部付近は除外）
		else if (currentScrollY > lastScrollY && currentScrollY > 0) {
			element.classList.add(hiddenClass);
		}
		// 上にスクロールしたら js-hidden を削除（オフセット分を考慮）
		else if (currentScrollY < lastScrollY - offset) {
			element.classList.remove(hiddenClass);
		}

		lastScrollY = Math.max(0, currentScrollY);
	});
}