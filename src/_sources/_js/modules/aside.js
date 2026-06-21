/**
 * aside周りの関数
 */
export function aside() {
	// ... existing code ...
	const root = document.querySelector('.l-sideNav');
	if (!root) return;

	// ===== 設定（上部に集約）=====
	const ACTIVE_CLASS = 'js-active';
	const TOGGLE_CLASS = 'js-toggle';

	// スクロール判定
	const SCROLL_OFFSET_PX = 8; // このpx以上動いたら「スクロールした」とみなす
	const SCROLL_STOP_DELAY_MS = 180; // このmsスクロールが止まったら「停止」とみなす

	const overlay = document.querySelector('.c-asideOverlay');
	const sns = root.querySelector('.l-sideNav__sns');

	const modals = Array.from(root.querySelectorAll('.l-sideNav__modal'));
	const btns = Array.from(root.querySelectorAll('.l-sideNav__btn'));

	const closeBtn = root.querySelector('.l-sideNav__modalClose');

	const spNav = root.querySelector('.l-sideNav__spNav');
	const toggleBtn = root.querySelector('.l-sideNav__toggle');

	const openModal = (key) => {
		if (!key) return;

		modals.forEach((m) => {
			const isTarget = m.getAttribute('data-modal') === key;
			m.classList.toggle(ACTIVE_CLASS, isTarget);
		});

		if (overlay) overlay.classList.add(ACTIVE_CLASS);
		if (sns) sns.classList.add(ACTIVE_CLASS);
	};

	const closeAll = () => {
		modals.forEach((m) => m.classList.remove(ACTIVE_CLASS));
		if (overlay) overlay.classList.remove(ACTIVE_CLASS);
		if (sns) sns.classList.remove(ACTIVE_CLASS);
	};

	// 2. l-sideNav__btn クリック → 対応 modal に js-active
	btns.forEach((btn) => {
		btn.addEventListener('click', () => {
			const modifier = Array.from(btn.classList).find((c) => c.startsWith('--'));
			const key = modifier ? modifier.replace(/^--/, '') : '';
			openModal(key);
		});
	});

	// 4. overlay or close button クリック → js-active を外す
	if (overlay) overlay.addEventListener('click', closeAll);
	if (closeBtn) closeBtn.addEventListener('click', closeAll);

	// 5. toggle クリック → spNav に js-toggle トグル
	if (toggleBtn && spNav) {
		toggleBtn.addEventListener('click', () => {
			spNav.classList.toggle(TOGGLE_CLASS);
		});
	}

	// URLコピー機能
	const copyBtn = root.querySelector('.js-copy-url');
	if (copyBtn) {
		const feedback = copyBtn.querySelector('.l-sideNav__copyFeedback');
		let timer = null;

		copyBtn.addEventListener('click', () => {
			const url = copyBtn.getAttribute('data-url');
			if (url) {
				navigator.clipboard
					.writeText(url)
					.then(() => {
						if (feedback) {
							feedback.classList.add(ACTIVE_CLASS);
							if (timer) clearTimeout(timer);
							timer = setTimeout(() => {
								feedback.classList.remove(ACTIVE_CLASS);
							}, 2000);
						}
					})
					.catch((err) => {
						console.error('URLのコピーに失敗しました: ', err);
					});
			}
		});
	}

	// 6,7. スクロール中は js-toggle を外す（オフセットあり）→ 止まったら js-toggle を付ける
	if (spNav) {
		let lastY = window.scrollY || 0;
		let timerId = null;

		// 初期状態は「止まっている」扱いにする
		spNav.classList.add(TOGGLE_CLASS);

		window.addEventListener(
			'scroll',
			() => {
				const y = window.scrollY || 0;
				const moved = Math.abs(y - lastY);

				if (moved >= SCROLL_OFFSET_PX) {
					spNav.classList.remove(TOGGLE_CLASS);
					lastY = y;
				}

				if (timerId) window.clearTimeout(timerId);
				timerId = window.setTimeout(() => {
					spNav.classList.add(TOGGLE_CLASS);
				}, SCROLL_STOP_DELAY_MS);
			},
			{ passive: true }
		);
	}
	// ... existing code ...
}