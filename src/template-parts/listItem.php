<?php
global $wp_path;
$args;
?>
<h2 class="hl-common-section"><?= $args['title']?></h2>
<ul class="c-related-list js-slider">
  <?php
  $post_type = 'category';
  $args = array(
    'post_type' => $post_type,
    'post_status' => 'publish',
    'posts_per_page' => -1,
    'tax_query' => array(
      array(
        'taxonomy' => 'product-category',
        'field' => 'slug',
        'terms' => $args['slug']
      )
    )
  );
  $posts = get_posts($args);
  if ($posts) :
    foreach ($posts as $post):
      setup_postdata($post);
      $post_id = $post -> ID;
      $thumb_img = get_the_post_thumbnail_url();
      if(!$thumb_img){
        $thumb_img = $wp_path.'/assets/img/common/dummy.jpg';
      }
      ?>
      <li class="c-related-list__item"><a href="<?php the_permalink(); ?>">
          <div class="blk-img"><img src="<?= $thumb_img;?>" alt="<?php the_title() ?><?= get_field('sub-title') ?>" loading="lazy" height="420" width="420"></div>
          <h3 class="hl-item_name_related -arrow_circle"><span><?php the_title() ?><span><?= get_field('sub-title') ?></span></span></h3>
        </a></li>
    <?php
    endforeach;
    wp_reset_postdata();
  endif; ?>
</ul>
<nav class="c-related-list-slider__nav">
  <button class="c-btn -border_circle -prev" aria-label="前の製品へ"></button>
  <button class="c-btn -border_circle -next" aria-label="次の製品へ"></button>
</nav>