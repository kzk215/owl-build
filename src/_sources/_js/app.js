import "../_scss/app.scss";

import {InViewObserver, inViewObserver} from "./class/InViewObserver.js";
import {PostIndex} from "./class/PostIndex.js";
import {Modal} from "./class/Modal.js";
import Swiper from 'swiper';
import {aside} from "./modules/aside.js";
import {smoothScroll} from "./modules/smoothScroll.js";
import {globalMenuToggle} from "./modules/globalMenuToggle.js";
import {toggleClass} from "./modules/toggleClass.js";
import {headerScroll} from "./modules/headerScroll.js";
import {refineSearch} from "./modules/refineSearch.js";


/**
 * 発火層
 */

document.addEventListener('DOMContentLoaded', () => {
	const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
	const isSP = window.matchMedia('(max-width: 768px)').matches;
	const modal = new Modal();
	const postIndex = new PostIndex({
		// tocSelector: '#postIndex',
		// searchRootSelector: '#postIndexSearch',
		activeClass: 'js-postIndex',
		titleText: '目次',
		showH3: false,
		minH2ForDisplay: 2,
		// scrollOffset: () => (window.matchMedia('(max-width: 768px)').matches ? 70 : 100)
	})

	loadInit();
	async function loadInit() {
		//if (isSP) {
			// await delay(200);
		//}
		smoothScroll({
			offset: () => window.matchMedia('(max-width: 768px)').matches ? 50 : 50,
			duration: 600,
			updateURL: 'replace'
		});
		globalMenuToggle();
		toggleClass([
			{selector: '.l-globalNav__link.--toggle'},
			{selector: '.l-footer__navItem.--toggle'},
			{selector: '.c-refineSearch__title'},
			{selector: '.l-productsArchiveIntro__boxTitle'}
		]);
		headerScroll(100);
		aside();
		refineSearch()
		const observer1 = new InViewObserver({
			offset: 200,
			exitOffset: 0,
			removeOnExit: true
		});
		const observer2 = new InViewObserver({
			selector: '.m-inView__marker',
			offset: 200,
			exitOffset: 0,
			removeOnExit: true
		});

	}

	// initAsideHiddenOnKeyVisual()
});


