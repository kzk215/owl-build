<?php
  global $wp_path;
  $post = $args;
  $terms = get_the_terms( $post->ID, 'blog-tax' );
  $tags = get_the_terms( $post->ID, 'blog-tag' );
  $thumb_img = get_the_post_thumbnail_url();
  $text = textLimit(get_the_title(),45);
  if(empty($thumb_img)){
    $thumb_img = $wp_path.'/assets/img/common/dummy.jpg';
  }
?>

<div class="c-card">
  <a class="c-card__img" href="<?php the_permalink();?>">
    <img class="c-card__imgItem" src="<?= $thumb_img?>" alt="">
  </a>
  <div class="c-card__detail">
    <div class="c-card__group">
      <!--<?php if(get_field('pr')):?>
        <p style="width: 100%; margin-bottom: -8px;"><span style="border: 1px solid #999; border-radius: 4px; background:#f8f8f8;padding:2px 10px; font-weight: bold; font-size: 1.2rem;">PR</span></p>
      <?php endif;?>-->
      <time class="c-card__time">
        <?php if(get_the_time('Y.m.d') == get_the_modified_date('Y.m.d')): ?>
          <?php the_time('Y.m.d') ?>
        <?php else:?>
          <?php the_modified_date('Y.m.d') ?>
        <?php endif;?>
      </time>
      <?php
      if($terms):?>
        <div class="c-card__categoryList">
          <?php foreach ($terms as $term):?>
          <a class="c-card__categoryItem" href="/blog/?category=<?= $term -> slug?>"><?= $term -> name?></a>
          <?php endforeach;?>
        </div>
      <?php endif;?>
    </div>
    <h3>
      <a class="c-card__title" href="<?php the_permalink();?>">
        <?= $text ?>
      </a>
    </h3>
    <?php
    if($tags):?>
      <div class="c-card__tagList" style="align-items: center; width: 100%">
        <?php foreach ($tags as $tag):?>
          <a class="c-card__tagItem" href="/?s=%23<?= $tag -> name?>"><?= $tag -> name?></a>
        <?php endforeach;?>
      <?php if(get_field('pr')):?>
      <p style="display: flex; align-items: center;"><span style="border: 1px solid #999; border-radius: 4px; background:#f8f8f8;padding:2px 10px; font-weight: bold; font-size: 1.2rem; line-height: normal;">PR</span></p>
      <?php endif;?>
      </div>
    <?php endif;?>
  </div>
</div>