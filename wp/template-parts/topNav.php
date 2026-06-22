<?php
global $wp_path;
$taxonomy = 'product-category';
$term = get_term_by('slug', $args, $taxonomy);
$thumb = get_field('thumb','term_' . $term -> term_id);
?>
<picture>
  <source srcset="<?= $thumb['sizes']['large'];?>" media="(min-width: 913px)" />
  <img src="<?= $thumb['sizes']['medium'];?>" alt="<?= $term -> name;?>" width="274" height="274" loading="lazy" />
</picture>
<div class="c-anchor_name"><span><?= $term -> name;?></span></div>