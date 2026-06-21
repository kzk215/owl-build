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
<a class="l-topCase__item m-inView --bottom" href="<?php the_permalink();?>">
	<img class="l-topCase__itemThumb" src="<?= $thumb_img?>" alt="<?php the_title();?>様">
	<div class="l-topCase__itemDetail">
		<div class="l-topCase__itemBox">
			<span class="l-topCase__itemName"><?php the_title();?></span>
			<span class="l-topCase__itemCategory">
				<?php foreach ($industry_terms as $term):?>
					<?= $term -> name?>・
				<?php endforeach;?>
				<?php foreach ($facility_terms as $term):?>
					<?= $term -> name?>
				<?php endforeach;?>
			</span>
		</div>
		<h3 class="l-topCase__itemTitle"><?= $title?></h3>
		<p class="l-topCase__itemText c-text"><?= $text;?></p>
	</div>
</a>