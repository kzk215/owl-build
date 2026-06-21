/**
 * toggleClass
 * @param {Array} configs - 設定の配列 [{selector, className}, ...]
 */
export function toggleClass(configs) {
	configs.forEach(({ selector, className = 'js-toggle' }) => {
		const elements = document.querySelectorAll(selector);

		// 指定のセレクターがなければ無視
		if (elements.length === 0) return;

		elements.forEach((element) => {
			element.addEventListener('click', (ev) => {
				ev.currentTarget.classList.toggle(className);
			});
		});
	});
}