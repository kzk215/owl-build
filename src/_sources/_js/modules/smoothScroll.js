/**
 * smoothScroll
 * @param options
 */
export function smoothScroll(options = {}) {
	const {
		offset = 0,
		duration = 500,
		updateURL = 'replace'// 'replace' | 'push' | false
	} = options;

	// 数値 or 関数（数値を返す）のみに対応して評価
	const resolveOffset = () => {
		if (typeof offset === 'function') {
			const v = Number(offset());
			return Number.isFinite(v) ? v : 0;
		}
		const v = Number(offset);
		return Number.isFinite(v) ? v : 0;
	};

	// Safari向け対策: UAでSafariを判定し、ネイティブスムースは使わない
	const ua = navigator.userAgent;
	const isSafari = /^((?!chrome|android).)*safari/i.test(ua);
	const prefersReduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
	const supportsNativeSmooth = !isSafari && ('scrollBehavior' in document.documentElement.style);

	const root = document.scrollingElement || document.documentElement;

	const getY = (el) => {
		const rect = el.getBoundingClientRect();
		const current = window.pageYOffset || root.scrollTop || 0;
		const y = current + rect.top - resolveOffset();
		// ドキュメント範囲にクランプ（Safari含む各ブラウザで安定）
		const maxScroll = Math.max(0, (document.documentElement.scrollHeight || document.body.scrollHeight) - window.innerHeight);
		return Math.min(maxScroll, Math.max(0, Math.round(y)));
	};

	const animateScroll = (toY) => {
		// ユーザーが動きを減らす設定の場合は即時ジャンプ
		if (prefersReduced) {
			window.scrollTo(0, toY);
			root.scrollTop = toY; // 念のため
			return;
		}

		// Safari以外でネイティブスムース対応時はそのまま使用
		if (supportsNativeSmooth) {
			window.scrollTo({ top: toY, behavior: 'smooth' });
			return;
		}

		// フォールバック（Safari含む）
		const startY = window.pageYOffset || root.scrollTop || 0;
		const diff = toY - startY;
		if (diff === 0) return;

		const start = performance.now();
		const dur = Math.max(0, duration);
		const easeInOutCubic = (t) =>
			t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

		const step = (now) => {
			const elapsed = now - start;
			const t = dur === 0 ? 1 : Math.min(1, elapsed / dur);
			const eased = easeInOutCubic(t);
			const y = Math.round(startY + diff * eased);
			window.scrollTo(0, y);
			root.scrollTop = y; // Safariでの互換確保
			if (t < 1) requestAnimationFrame(step);
		};
		requestAnimationFrame(step);
	};

	// ハッシュ更新を一元化
	const updateLocationHash = (hash) => {
		if (!hash && hash !== '') return; // undefined/nullは無視。空文字は許可（トップの#）
		if (updateURL === 'push') history.pushState(null, '', `#${hash}`);
		else if (updateURL === 'replace') history.replaceState(null, '', `#${hash}`);
	};

	// フォーカス処理を一元化
	const focusTarget = (el) => {
		setTimeout(() => el && el.focus && el.focus({ preventScroll: true }), 300);
	};

	const scrollToTarget = (el, hash) => {
		if (!el) return;
		animateScroll(getY(el));
		if (hash) updateLocationHash(hash);
		focusTarget(el);
	};

	// トップへスクロール（「#」単独リンク）
	const scrollToTop = () => {
		animateScroll(0);
		updateLocationHash(''); // URLの末尾を「#」に（元の挙動を踏襲）
	};

	// 同一ページ内リンクかを判定
	const isSamePageLink = (a) =>
		a && a.pathname === location.pathname && a.origin === location.origin;

	// クリックイベント（ページ内ハッシュリンク）
	document.addEventListener('click', (e) => {
		const a = e.target.closest('a[href^="#"]');
		if (!a) return;

		const href = a.getAttribute('href') || '';
		const trimmed = href.trim();

		// 無効リンクを除外（空、#!）
		if (trimmed === '' || trimmed === '#!') return;

		// 「#」だけ → トップへスムーススクロール
		if (trimmed === '#') {
			e.preventDefault();
			scrollToTop();
			return;
		}

		// 同一ページ以外は除外
		if (!isSamePageLink(a)) return;

		// id解決してスクロール
		const id = decodeURIComponent(trimmed.slice(1));
		if (!id) return;
		const targetEl = document.getElementById(id);
		if (!targetEl) return;

		e.preventDefault();
		scrollToTarget(targetEl, id);
	});

	// 初回読込時にハッシュがある場合もスクロール
	window.addEventListener('load', () => {
		const raw = window.location.hash;
		if (!raw || raw === '#' || raw === '#!') return;
		const id = decodeURIComponent(raw.slice(1));
		const el = document.getElementById(id);
		if (!el) return;
		// レイアウト確定待ち
		requestAnimationFrame(() => scrollToTarget(el, id));
	});
}