export class Modal {
	static DEFAULTS = {
		mode: 'gallery',
		selector: '[data-modal-src]',
		groupFallback: 'default',
		swipeThresholdPx: 60,
		transitionResetProperty: 'opacity',
		classes: {
			modalRoot: 'm-modal',
			isOpen: 'is-open',
			bodyLocked: 'is-modal-open',
			isChanging: 'is-changing'
		},
		selectors: {
			overlay: '.m-modal__overlay',
			closeBtn: '.m-modal__close',
			prevBtn: '.m-modal__prevBtn',
			nextBtn: '.m-modal__nextBtn',
			img: '.m-modal__img',
			caption: '.m-modal__caption',
			download: '.m-modal__download',
			container: '.m-modal__container'
		},
		keys: {
			escape: 'Escape',
			left: 'ArrowLeft',
			right: 'ArrowRight'
		}
	};

	constructor(options = {}) {
		const cfg = { ...Modal.DEFAULTS, ...options };
		this.cfg = cfg;

		this.mode = cfg.mode;
		this.selector = cfg.selector;

		this.state = {
			currentGroup: null,
			currentIndex: 0,
			isOpen: false
		};

		this.groups = new Map();

		// listener管理（後からdestroyできるように）
		this._abortController = new AbortController();

		// bind（add/removeの整合性を取りやすくする）
		this._onDocumentKeydown = this._onDocumentKeydown.bind(this);

		this._collectItems();
		this._build();
		this._bindTriggers();
		this._bindEvents();
		this._bindSwipe();
	}

	/* =============================
		groupごとにデータ整理
	============================= */
	_collectItems() {
		const nodes = document.querySelectorAll(this.selector);

		nodes.forEach(el => {
			const group = el.dataset.modalGroup || this.cfg.groupFallback;

			if (!this.groups.has(group)) {
				this.groups.set(group, []);
			}

			this.groups.get(group).push({
				src: el.dataset.modalSrc,
				type: el.dataset.modalType || 'image',
				caption: el.dataset.modalCaption || '',
				trigger: el
			});
		});
	}

	/* =============================
		DOM生成（1回だけ）
	============================= */
	_build() {
		this.modal = document.createElement('div');
		this.modal.className = this.cfg.classes.modalRoot;
		this.modal.innerHTML = `
			<div class="m-modal__overlay"></div>
			<div class="m-modal__container">
				<span class="m-modal__prevBtn"></span>
				<span class="m-modal__close"></span>
		<div class="m-modal__inner">
					<a class="m-modal__download" download></a>
					<figure class="m-modal__imgWrap">
						<img class="m-modal__img" />
						<figcaption class="m-modal__caption"></figcaption>
					</figure>
					<div class="m-modal__videoWrap">
						<iframe class="m-modal__iframe" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
					</div>
				</div>
				<span class="m-modal__nextBtn"></span>
			</div>
		`;

		document.body.appendChild(this.modal);

		const s = this.cfg.selectors;
		this.els = {
			overlay: this.modal.querySelector(s.overlay),
			closeBtn: this.modal.querySelector(s.closeBtn),
			prevBtn: this.modal.querySelector(s.prevBtn),
			nextBtn: this.modal.querySelector(s.nextBtn),
			img: this.modal.querySelector(s.img),
			imgWrap: this.modal.querySelector('.m-modal__imgWrap'),
			iframe: this.modal.querySelector('.m-modal__iframe'),
			videoWrap: this.modal.querySelector('.m-modal__videoWrap'),
			caption: this.modal.querySelector(s.caption),
			download: this.modal.querySelector(s.download),
			container: this.modal.querySelector(s.container)
		};
	}

	/* =============================
		trigger → group/index紐付け
	============================= */
	_bindTriggers() {
		const { signal } = this._abortController;

		this.groups.forEach((items, groupName) => {
			items.forEach((item, index) => {
				item.trigger.addEventListener(
					'click',
					e => {
						e.preventDefault();
						this.open(groupName, index);
					},
					{ signal }
				);
			});
		});
	}

	/* =============================
		イベント
	============================= */
	_bindEvents() {
		const { signal } = this._abortController;

		this.els.overlay.addEventListener('click', () => this.close(), { signal });
		this.els.closeBtn.addEventListener('click', () => this.close(), { signal });

		this.els.prevBtn.addEventListener('click', () => this.prev(), { signal });
		this.els.nextBtn.addEventListener('click', () => this.next(), { signal });

		document.addEventListener('keydown', this._onDocumentKeydown, { signal });
	}

	_onDocumentKeydown(e) {
		if (!this.state.isOpen) return;

		const k = this.cfg.keys;
		if (e.key === k.escape) this.close();
		if (e.key === k.left) this.prev();
		if (e.key === k.right) this.next();
	}

	/* =============================
		Swipe Support
	============================= */
	_bindSwipe() {
		const { signal } = this._abortController;

		let startX = 0;
		let startY = 0;
		let isSwiping = false;

		const threshold = this.cfg.swipeThresholdPx;

		this.els.container.addEventListener(
			'touchstart',
			e => {
				const t = e.touches[0];
				startX = t.clientX;
				startY = t.clientY;
				isSwiping = true;
			},
			{ passive: true, signal }
		);

		this.els.container.addEventListener(
			'touchmove',
			e => {
				if (!isSwiping) return;

				const t = e.touches[0];
				const dx = t.clientX - startX;
				const dy = t.clientY - startY;

				// 縦スクロール優先ならスワイプ扱いをやめる
				if (Math.abs(dy) > Math.abs(dx)) {
					isSwiping = false;
				}
			},
			{ passive: true, signal }
		);

		this.els.container.addEventListener(
			'touchend',
			e => {
				if (!isSwiping) return;

				const t = e.changedTouches[0];
				const dx = t.clientX - startX;

				if (Math.abs(dx) > threshold) {
					dx < 0 ? this.next() : this.prev();
				}

				isSwiping = false;
			},
			{ signal }
		);
	}

	/* ============================= */
	open(group, index) {
		this.state.currentGroup = group;
		this.state.isOpen = true;

		this.modal.classList.add(this.cfg.classes.isOpen);
		document.body.classList.add(this.cfg.classes.bodyLocked);

		this._show(index);
	}

	close() {
		if (!this.state.isOpen) return;

		this.state.isOpen = false;

		this.modal.classList.remove(this.cfg.classes.isOpen);
		document.body.classList.remove(this.cfg.classes.bodyLocked);

		// アニメーション完了を1回だけ待つ
		const onTransitionEnd = e => {
			// opacityのtransitionだけ拾う（多重発火防止）
			if (e.target !== this.modal || e.propertyName !== this.cfg.transitionResetProperty) return;

			this.modal.removeEventListener('transitionend', onTransitionEnd);
			this._reset(); // ← 完全終了後に中身を消す
		};

		this.modal.addEventListener('transitionend', onTransitionEnd);
	}

	prev() {
		const items = this._getCurrentItems();
		if (!items) return;

		const nextIndex = this._wrapIndex(this.state.currentIndex - 1, items.length);
		this._show(nextIndex);
	}

	next() {
		const items = this._getCurrentItems();
		if (!items) return;

		const nextIndex = this._wrapIndex(this.state.currentIndex + 1, items.length);
		this._show(nextIndex);
	}

	/* =============================
		★ スムーズ切替の本体
	============================= */
	async _show(index) {
		const items = this._getCurrentItems();
		if (!items) return;

		const item = items[index];
		if (!item) return;

		this.state.currentIndex = index;

		// フェードアウト
		const targets = [this.els.imgWrap, this.els.videoWrap];
		targets.forEach(t => t.classList.add(this.cfg.classes.isChanging));

		if (item.type === 'video') {
			// YouTube対応
			this.els.imgWrap.style.display = 'none';
			this.els.videoWrap.style.display = 'block';
			this.els.iframe.src = `https://www.youtube.com/embed/${item.src}`;
			this.els.download.style.display = 'none';
		} else {
			// 画像対応
			this.els.videoWrap.style.display = 'none';
			this.els.imgWrap.style.display = 'block';
			this.els.download.style.display = '';

			await this._loadImage(item.src);
			this.els.img.src = item.src;
			this.els.img.alt = item.caption;
			this.els.download.href = item.src;
		}

		requestAnimationFrame(() => {
			this._setCaption(item.caption);

			// フェードイン
			targets.forEach(t => t.classList.remove(this.cfg.classes.isChanging));
		});

		if (item.type !== 'video') {
			this._preloadAround(items, index);
		}
	}

	_getCurrentItems() {
		const group = this.state.currentGroup;
		if (!group) return null;
		return this.groups.get(group) || null;
	}

	_wrapIndex(index, length) {
		return ((index % length) + length) % length;
	}

	async _loadImage(src) {
		const loader = new Image();
		loader.src = src;

		if (loader.decode) {
			try {
				await loader.decode();
			} catch {
				// decode失敗時はonloadにフォールバック
				await new Promise(res => (loader.onload = res));
			}
			return;
		}

		await new Promise(res => (loader.onload = res));
	}

	_setCaption(text) {
		const hasText = Boolean(text);
		this.els.caption.textContent = text || '';
		this.els.caption.style.display = hasText ? '' : 'none';
	}

	_preloadAround(items, index) {
		[index - 1, index + 1].forEach(i => {
			const item = items[this._wrapIndex(i, items.length)];
			const img = new Image();
			img.src = item.src;
		});
	}

	_reset() {
		this.els.img.classList.remove(this.cfg.classes.isChanging);
		this.els.videoWrap.classList.remove(this.cfg.classes.isChanging);
		this.els.img.src = '';
		this.els.img.alt = '';
		this.els.iframe.src = '';

		this._setCaption('');

		this.els.download.removeAttribute('href');

		this.state.currentGroup = null;
		this.state.currentIndex = 0;
	}

	// 必要なら呼び出し側で破棄できるように（任意）
	destroy() {
		this.close();
		this._abortController.abort();
		if (this.modal?.parentNode) this.modal.parentNode.removeChild(this.modal);
	}
}