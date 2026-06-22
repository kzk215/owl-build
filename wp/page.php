<?php
global $wp_path;
global $site_url;
get_template_part('./include/head');
get_template_part('./include/header');

?>
<main>
	<?php get_template_part('./template-parts/breadCrumb');?>
	<section class="p-page">
		<div class="c-inner">
			<h1 class="l-columnSingle__title"><?php the_title();?></h1>
			<div class="c-edit">
				<?php if (have_posts()) : while (have_posts()) : the_post(); ?>
					<?php the_content(); ?>
				<?php endwhile;endif;?>
			</div>
		</div>
	</section>
</main>

<?php
get_template_part('./include/footer');
?>
