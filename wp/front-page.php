<?php
global $wp_path;
global $site_url;
get_template_part('./include/head');
get_template_part('./include/header');

?>
<main>
	<div class="l-keyVisual"></div>
	<section class="l-topIntro">
		<div class="c-inner">
			<a class="c-card" href="">
				<img class="c-card__img" src="<?= $wp_path;?>/assets/img/dummy/640x480.jpg" alt="">
				<div class="c-card__detail">
					testtest
				</div>
			</a>
			<a class="c-card" href="">
				<img class="c-card__img" src="<?= $wp_path;?>/assets/img/dummy/640x480.jpg" alt="">
				<div class="c-card__detail">
					testtest
				</div>
			</a>
			<a class="c-card" href="">
				<img class="c-card__img" src="<?= $wp_path;?>/assets/img/dummy/640x480.jpg" alt="">
				<div class="c-card__detail">
					testtest
				</div>
			</a>
		</div>
	</section>
	<section class="l-topAbout"></section>
	<section class="l-topColumn"></section>
	<section class="l-topFaq"></section>
</main>

<?php
get_template_part('./include/footer');
?>
