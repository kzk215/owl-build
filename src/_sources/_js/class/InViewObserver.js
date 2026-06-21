/**
 * InViewObserver クラス
 * ビューポート内に要素が入ったときにクラスを付与するオブザーバー
 */
export class InViewObserver {
	constructor(options = {}) {
		const {
			selector = '.m-inView', // ターゲットセレクタ
			stateClass = 'js-inView', // 付与するクラス名
			offset = 0, // 追加発火を早めるための下端オフセット(px)
			exitOffset = 0, // ビューポートから離れる際のオフセット(px)
			removeOnExit = false // falseでビューポート外で state を外す
		} = options;

		this.selector = selector;
		this.stateClass = stateClass;
		this.offset = offset;
		this.exitOffset = exitOffset;
		this.removeOnExit = removeOnExit;
		this.targets = [];
		this.enterIO = null;
		this.exitIO = null;
		this.onScroll = null;
		this.check = null;
		this.pending = null;

		this.init();
	}

	init() {
		this.targets = Array.from(document.querySelectorAll(this.selector));

		if (this.targets.length === 0) {
			console.warn(`[InViewObserver] No elements found with selector: ${this.selector}`);
			return;
		}

		console.log(`[InViewObserver] Found ${this.targets.length} target(s) with selector: ${this.selector}`);

		if ('IntersectionObserver' in window) {
			this.setupIntersectionObserver();
		} else {
			this.setupFallback();
		}
	}

	setupIntersectionObserver() {
		this.enterIO = new IntersectionObserver((entries) => {
			for (const entry of entries) {
				if (entry.isIntersecting) {
					this.addState(entry.target);
					if (!this.removeOnExit) {
						this.enterIO.unobserve(entry.target);
					}
				}
			}
		}, {
			root: null,
			rootMargin: `0px 0px -${this.offset}px 0px`,
			threshold: 0
		});

		if (this.removeOnExit) {
			this.exitIO = new IntersectionObserver((entries) => {
				for (const entry of entries) {
					if (!entry.isIntersecting) {
						this.removeState(entry.target);
					}
				}
			}, {
				root: null,
				rootMargin: `${this.exitOffset}px 0px ${this.exitOffset}px 0px`,
				threshold: 0
			});

			this.targets.forEach((el) => {
				this.enterIO.observe(el);
				this.exitIO.observe(el);
			});
		} else {
			this.targets.forEach((el) => this.enterIO.observe(el));
		}
	}

	setupFallback() {
		const isInViewportForEnter = (rect) => {
			const vpBottom = window.innerHeight - this.offset;
			return rect.top < vpBottom && rect.bottom > 0;
		};

		const isInViewportForExit = (rect) => {
			return rect.top < (window.innerHeight + this.exitOffset) && rect.bottom > -this.exitOffset;
		};

		if (this.removeOnExit) {
			this.check = () => {
				for (const el of this.targets) {
					const rect = el.getBoundingClientRect();
					if (isInViewportForEnter(rect)) {
						this.addState(el);
					} else if (!isInViewportForExit(rect)) {
						this.removeState(el);
					}
				}
			};

			this.onScroll = () => requestAnimationFrame(this.check);
			window.addEventListener('scroll', this.onScroll, {passive: true});
			window.addEventListener('resize', this.check.bind(this));
			window.addEventListener('load', this.check.bind(this));
			this.check();
		} else {
			this.pending = new Set(this.targets);
			this.check = () => {
				for (const el of Array.from(this.pending)) {
					const rect = el.getBoundingClientRect();
					if (isInViewportForEnter(rect)) {
						this.addState(el);
						this.pending.delete(el);
					}
				}
				if (this.pending.size === 0) {
					this.destroy();
				}
			};

			this.onScroll = () => requestAnimationFrame(this.check);
			window.addEventListener('scroll', this.onScroll, {passive: true});
			window.addEventListener('resize', this.check.bind(this));
			window.addEventListener('load', this.check.bind(this));
			this.check();
		}
	}

	addState(el) {
		el.classList.add(this.stateClass);
	}

	removeState(el) {
		el.classList.remove(this.stateClass);
	}

	destroy() {
		if (this.enterIO) {
			this.enterIO.disconnect();
			this.enterIO = null;
		}
		if (this.exitIO) {
			this.exitIO.disconnect();
			this.exitIO = null;
		}
		if (this.onScroll) {
			window.removeEventListener('scroll', this.onScroll, {passive: true});
			window.removeEventListener('resize', this.check.bind(this));
			window.removeEventListener('load', this.check.bind(this));
			this.onScroll = null;
		}
	}
}

// 後方互換性のため、関数形式でのエクスポートも残す
export function inViewObserver(options = {}) {
	return new InViewObserver(options);
}