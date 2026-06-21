/**
 * PostIndex
 * - 指定範囲内の h2/h3 から目次を自動生成
 * - 固定ヘッダー分のオフセットを考慮してスムーススクロール
 * - タイトルクリックで activeClass をトグル
 * - observerライクに new するだけで動作（init呼び出し不要）
 */

export class PostIndex {
	/**
	 * @param {Object} options
	 * @param {string} [options.tocSelector='#postIndex'] 目次コンテナのセレクタ（複数可）
	 * @param {string} [options.searchRootSelector='#postIndexSearch'] 見出しを探す範囲のセレクタ
	 * @param {string} [options.titleSelector='.m-postIndex__title'] タイトル要素のセレクタ（既存があれば利用）
	 * @param {string} [options.listSelector='.m-postIndex__list'] リストラッパーのセレクタ（既存があれば利用）
	 * @param {string} [options.activeClass='js-active'] タイトルに付与するアクティブクラス
	 * @param {number|function():number} [options.scrollOffset=0] スクロール時のオフセット（ヘッダー高）
	 * @param {string} [options.titleText='目次'] タイトル表示テキスト
	 * @param {boolean} [options.showH3=true] h3 を目次に含めるかどうか
	 * @param {number} [options.minH2ForDisplay=2] 表示に必要な h2 の最小数
	 */
	constructor(options = {}) {
		this.settings = {
			tocSelector: '#postIndex',
			searchRootSelector: '#postIndexSearch',
			titleSelector: '.m-postIndex__title',
			listSelector: '.m-postIndex__list',
			activeClass: 'js-postIndex',
			scrollOffset: 0,
			titleText: '目次',
			showH3: true,
			minH2ForDisplay: 2,
			...options
		};

		this._buildAll();
	}

	_buildAll() {
		const searchRoot = document.querySelector(this.settings.searchRootSelector);
		if (!searchRoot) return;

		const containers = document.querySelectorAll(this.settings.tocSelector);
		if (!containers.length) return;

		containers.forEach((tocRoot) => this._buildOne(tocRoot, searchRoot));
	}

	_buildOne(tocRoot, searchRoot) {
		// 表示条件: h2 が既定数未満なら非表示
		const h2Count = searchRoot.querySelectorAll('h2').length;
		if (h2Count < this.settings.minH2ForDisplay) {
			tocRoot.style.display = 'none';
			return;
		}

		// ここから目次を構築
		let titleEl = tocRoot.querySelector(this.settings.titleSelector);
		let listEl = tocRoot.querySelector(this.settings.listSelector);

		if (!titleEl) {
			titleEl = document.createElement('span');
			titleEl.className = this._classFromSelector(this.settings.titleSelector) || 'm-postIndex__title';
			titleEl.textContent = this.settings.titleText;

			// アイコン
			const icon = document.createElement('span');
			icon.className = 'm-postIndex__icon';
			titleEl.appendChild(icon);

			tocRoot.appendChild(titleEl);
		}

		if (!listEl) {
			listEl = document.createElement('div');
			listEl.className = this._classFromSelector(this.settings.listSelector) || 'm-postIndex__list';
			tocRoot.appendChild(listEl);
		}

		// クリックで開閉
		titleEl.addEventListener('click', () => {
			titleEl.classList.toggle(this.settings.activeClass);
		});

		// リスト初期化と可視化
		listEl.innerHTML = '';
		tocRoot.style.removeProperty('display');

		// 見出し収集（showH3に応じて切替）
		const selector = this.settings.showH3 ? 'h2, h3' : 'h2';
		const headings = Array.from(searchRoot.querySelectorAll(selector));
		if (headings.length === 0) {
			tocRoot.style.display = 'none';
			return;
		}

		let currentChildWrap = null;
		let h2Index = 0;
		let h3Index = 0;

		headings.forEach((h) => {
			const level = h.tagName.toLowerCase();
			const text = (h.textContent || '').trim();
			if (!text) return;

			if (level === 'h2') {
				h2Index += 1;
				h3Index = 0;
				const base = `anker${h2Index}`;
				h.id = this._ensureUniqueId(base);

				const link = this._createLink('m-postIndex__listItem', text, h.id);
				listEl.appendChild(link);
				// h3 は来た時にだけ子ラッパーを作る
				currentChildWrap = null;
				return;
			}

			if (level === 'h3' && this.settings.showH3) {
				// 直前にh2が無い場合はスキップ
				if (!listEl.lastElementChild) return;

				h3Index += 1;
				const base = `anker${h2Index}-${h3Index}`;
				h.id = this._ensureUniqueId(base);

				if (!currentChildWrap) {
					currentChildWrap = document.createElement('div');
					currentChildWrap.className = 'm-postIndex__listChild';
					listEl.appendChild(currentChildWrap);
				}
				const link = this._createLink('m-postIndex__listChildItem', text, h.id);
				currentChildWrap.appendChild(link);
			}
		});
	}

	_getOffset() {
		const v = (typeof this.settings.scrollOffset === 'function')
			? this.settings.scrollOffset()
			: this.settings.scrollOffset;
		return Number(v) || 0;
	}

	_slugify(text) {
		return String(text || '')
			.trim()
			.toLowerCase()
			.replace(/[\s　]+/g, '-')
			.replace(/[^\w\-ぁ-んァ-ン一-龥]/g, '')
			.replace(/\-+/g, '-')
			.replace(/^\-|\-$/g, '');
	}

	_ensureUniqueId(baseId) {
		let id = baseId || 'section';
		let i = 2;
		while (document.getElementById(id)) {
			id = `${baseId}-${i}`;
			i += 1;
		}
		return id;
	}

	_createLink(className, text, targetId) {
		const a = document.createElement('a');
		a.className = className;
		a.href = `#${encodeURIComponent(targetId)}`;
		a.textContent = text;

		a.addEventListener('click', (e) => {
			const target = document.getElementById(targetId);
			if (!target) return;

			e.preventDefault();
			if (typeof e.stopImmediatePropagation === 'function') {
				e.stopImmediatePropagation();
			}

			const y = target.getBoundingClientRect().top + window.pageYOffset - this._getOffset();
			window.scrollTo({ top: y, behavior: 'smooth' });

			history.replaceState(null, '', `#${encodeURIComponent(targetId)}`);
		});

		return a;
	}

	_classFromSelector(sel) {
		// '.foo.bar' -> 'foo bar' 先頭の '.' をクラス名に変換
		if (!sel || typeof sel !== 'string') return '';
		const m = sel.match(/^(\.[A-Za-z0-9\-\_\.]+)$/);
		if (!m) return '';
		return sel
			.split('.')
			.filter(Boolean)
			.join(' ');
	}
}