/**
 * globalMenu
 */
export function globalMenuToggle() {
	const hamburger = document.querySelector('.c-hamburgerBtn');
	const navItem = document.querySelector('.l-globalNav a[href^="#"]');
	const nav = document.querySelector('.l-globalNav');
	const closeBtn = document.querySelector('.c-menuCloseBtn');
	const overlay = document.querySelector('.c-overlay');
	const active = 'js-active';
	const noScroll = 'js-noScroll';

	// 必要な要素が無ければ何もしない
	if (!hamburger || !nav || !overlay) return;

	const toggle = (ev) => {
		ev.preventDefault();
		nav.classList.toggle(active);
		overlay.classList.toggle(active);
		hamburger.classList.toggle(active);
		document.body.classList.toggle(noScroll)

	};

	const close = (ev) => {
		ev.preventDefault();
		nav.classList.remove(active);
		overlay.classList.remove(active);
		hamburger.classList.remove(active);
		document.body.classList.remove(noScroll)
		if (closeBtn) closeBtn.classList.remove(active);

	};

	hamburger.addEventListener('click', toggle);
	overlay.addEventListener('click', close);
	if (closeBtn) closeBtn.addEventListener('click', close);
	if (navItem) navItem.addEventListener('click', close);

	nav.addEventListener('click', (ev) => {
		const a = ev.target.closest('a[href^="#"]');
		if (a) close(ev);
	});
}