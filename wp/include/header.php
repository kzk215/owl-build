<?php
global $wp_path;
global $site_url;
?>
<!-- header -->
<header class="l-header">
	<a class="l-header__logo" href="<?= $site_url;?>/">
		<picture class="l-header__logoItem">
<!--			<source srcset="<?= $wp_path?>/assets/img/common/site_logo_sp.svg" media="(max-width: 1200px)" />-->
			<img class="l-header__logoImg" src="<?= $wp_path?>/assets/img/common/site_logo.svg" alt="" />
		</picture>
	</a>
	<div class="l-globalNav__open c-hamburgerBtn"></div>
	<nav class="l-globalNav">

	</nav>
</header>
<div class="c-overlay"></div>
<!-- // header -->