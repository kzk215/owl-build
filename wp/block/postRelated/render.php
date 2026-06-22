<?php
/**
 * Post Related Block Template.
 *
 * @param   array $block The block settings and attributes.
 * @param   string $content The block inner HTML (empty).
 * @param   bool $is_preview True during AJAX preview.
 * @param   (int|string) $post_id The post ID this block is saved to.
 */

global $wp_path;
// ACF fields
$related_posts = get_field('related_posts');

if ($related_posts) :
	foreach ($related_posts as $post) :
		setup_postdata($post);
		$permalink = get_permalink($post->ID);
		$title = get_the_title($post->ID);
		$date = get_the_date('Y.n.j', $post->ID);
		$excerpt = get_the_excerpt($post->ID);
		$thumb_id = get_post_thumbnail_id($post->ID);
		$thumb_url = $thumb_id ? wp_get_attachment_image_url($thumb_id, 'full') : $wp_path . '/assets/img/column/related.png';
		?>
		<a class="b-postRelated" href="<?php echo esc_url($permalink); ?>">
			<div class="b-postRelated__detail">
				<div class="b-postRelated__titleWrap">
					<span class="b-postRelated__sub">関連記事</span>
					<time class="b-postRelated__date"><?php echo esc_html($date); ?></time>
					<h4 class="b-postRelated__title"><?php echo esc_html($title); ?></h4>
				</div>

				<p class="b-postRelated__text"><?php echo esc_html($excerpt); ?></p>
			</div>
			<img class="b-postRelated__img" src="<?php echo esc_url($thumb_url); ?>" alt="<?php echo esc_attr($title); ?>">
		</a>
	<?php
	endforeach;
	wp_reset_postdata();
endif;
?>
