<?php
global $wp_path;
global $site_url;
?>
<!-- header -->
<header class="l-header">
	<a class="l-header__logo" href="<?= $site_url;?>/">
		<picture class="l-header__logoItem">
<!--			<source srcset="--><?php //= $wp_path?><!--/assets/img/common/site_logo_sp.svg" media="(max-width: 1200px)" />-->
			<img class="l-header__logoImg" src="<?= $wp_path?>/assets/img/common/site_logo.svg" alt="" />
		</picture>
	</a>
	<a class="l-globalNav__spContact" href="<?= $site_url;?>/contact/">お問い合わせ</a>
	<div class="l-globalNav__open c-hamburgerBtn"></div>
	<nav class="l-globalNav"></nav>
</header>
<div class="c-overlay"></div>
<!-- // header -->