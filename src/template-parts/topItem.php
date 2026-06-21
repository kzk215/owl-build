<?php
global $site_url;
$taxonomy = 'product-category';
$term = get_term_by('slug', $args, $taxonomy);
$thumb = get_field('thumb','term_' . $term -> term_id);
$lead = get_field('detail','term_' . $term -> term_id);
?>
<div class="c-img"><img src="<?= $thumb['sizes']['large'];?>" alt="<?= $term -> name;?>" loading="lazy" width="593" height="539"></div>
<hgroup class="c-grid-lowerlinks__item__head">
  <h2 class="hl-common-item"><a href="<?= $site_url?>/category/?cat=<?= $args?>"><?= $term -> name;?><span class="-arrow_circle_line"></span></a></h2>
  <p><?= $lead?></p>
</hgroup>
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
      <li><a href="<?php the_permalink(); ?>"><span><?php the_title() ?><?= get_field('sub-title') ?></span></a></li>
    <?php
    endforeach;
    wp_reset_postdata();
  endif; ?>
</ul>