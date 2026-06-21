<?php
global $site_url;
global $wp_path;
$array = $args;
?>
<div class="c-product">
	<div class="c-product__box m-inView --bottom">
		<?php

		$post_type = 'products';
		$args = array(
			'post_type' => $post_type,
			'post_status' => 'publish',
		);
		$products_post = get_posts($args);
		foreach ($products_post as $post_item):
			$product_title = split_title_parentheses($post_item -> post_title);
			$product_thumb = get_the_post_thumbnail_url($post_item -> ID, 'full');
			$publish = get_field('publish',$post_item -> ID);
			if(!$publish):
			?>
				<div class="c-product__item ">
					<figure class="c-product__figure --hidden">
						<img class="c-product__img" src="<?= $product_thumb ?>" alt="<?= $product_title['sub']?>">
					</figure>
					<h3 class="c-product__title"><?= $product_title['sub'];?><br><small>(準備中)</small></h3>
				</div>
		<?php else:?>
			<a class="c-product__item" href="<?= $site_url;?>/products/<?= $post_item -> post_name;?>">
				<figure class="c-product__figure">
					<img class="c-product__img" src="<?= $product_thumb ?>" alt="<?= $product_title['sub']?>">
				</figure>
				<h3 class="c-product__title"><?= $product_title['sub'];?></h3>
			</a>
		<?php
		endif;
		endforeach;
		?>
	</div>
	<?php if(!$array['exclude_btn']):?>
	<div class="u-mt60 m-inView --bottom">
		<a class="c-btn --wh u-mx_auto" href="<?= $site_url?>/products/">製品一覧を見る</a>
	</div>
	<?php endif;?>
</div>
