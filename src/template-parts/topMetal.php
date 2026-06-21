<?php
global $site_url;
$taxonomy = 'product-category';
$term = get_term_by('slug', $args, $taxonomy);
$thumb = get_field('thumb','term_' . $term -> term_id);
$lead = get_field('detail','term_' . $term -> term_id);
?>
<div class="c-grid-lowerlinks-row3__item">
<div class="c-img"><img src="<?= $thumb['sizes']['large'];?>" alt="<?= $term -> name;?>" loading="lazy" width="462" height="420"></div>
<h3 class="hl-common-item_u"><?= $term -> name;?></h3>
<ul class="c-list-links">

  <?php
  $post_type = 'category';
  $args = array(
    'post_type' => $post_type,
    'post_status' => 'publish',
    'posts_per_page' => -1,
    'tax_query' => array(
      array(
        'taxonomy' => $taxonomy,
        'field' => 'slug',
        'terms' => $args
      )
    )
  );
  $posts = get_posts($args);
  if ($posts) :
    foreach ($posts as $post):
      setup_postdata($post);
      $post_id = $post -> ID;
      $thumb_img = get_the_post_thumbnail_url();
      ?>
      <li><a href="<?php the_permalink(); ?>"><span><?php the_title() ?><span><?= get_field('sub-title') ?></span></span></a></li>
    <?php
    endforeach;
    wp_reset_postdata();
  endif; ?>
</ul>
</div>