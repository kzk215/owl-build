<?php
  global $wp_path;
  $post = $args;
  $industry_terms = get_the_terms( $post->ID, 'industry' );
	$facility_terms = get_the_terms( $post->ID, 'facility' );
  $thumb_img = get_the_post_thumbnail_url();
  $title = get_field('title');
	$text = textLimit(get_field('detail'),60);
  if(empty($thumb_img)){
    $thumb_img = $wp_path.'/assets/img/common/dummy.jpg';
  }
?>
<div class="c-cardBtn l-caseArchive__boxItem m-inView --bottom">
	<a class="c-cardBtn__img" href="<?php the_permalink();?>">
		<img class="c-cardBtn__imgItem" src="<?= $thumb_img?>" alt="<?php the_title();?>様">
		<div class="c-cardBtn__category">
			<?php foreach ($industry_terms as $term):?>
				<span class="c-cardBtn__categoryItem"><?= $term -> name?></span>
			<?php endforeach;?>
			<?php foreach ($facility_terms as $term):?>
				<span class="c-cardBtn__categoryItem"><?= $term -> name?></span>
			<?php endforeach;?>
		</div>
	</a>
	<div class="c-cardBtn__detail">
		<p class="c-cardBtn__company"><?php the_title();?></p>
		<p class="c-cardBtn__title">
			<?= $title?>
		</p>
		<p class="c-cardBtn__text">
			<?= $text;?>
		</p>
		<a class="c-cardBtn__btn c-btnSquare" href="<?php the_permalink();?>">詳しくはこちら</a>
	</div>
</div>