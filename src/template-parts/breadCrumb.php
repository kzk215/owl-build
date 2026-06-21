
<?php
$array = $args;
$breadcrumb_items = array();

// ホームを最初に追加
$breadcrumb_items[] = array(
	'title' => 'TOP',
	'url'   => home_url( '/' ),
	'is_current' => false,
);
// トップページの場合は処理終了
if ( ! is_home() && ! is_front_page() ) {
	// 固定ページの場合
	if ( is_page() ) {
		$page_id = get_queried_object_id();
		$page_title = get_the_title( $page_id );

		// 親ページがあれば取得
		$parent_id = wp_get_post_parent_id( $page_id );
		if ( $parent_id ) {
			$parent_title = get_the_title( $parent_id );
			$breadcrumb_items[] = array(
				'title' => $parent_title,
				'url'   => get_permalink( $parent_id ),
				'is_current' => false,
			);
		}

		// 現在のページを最後に追加
		$breadcrumb_items[] = array(
			'title' => $page_title,
			'url'   => '',
			'is_current' => true,
		);
	}
	// 投稿またはカスタムポストの場合
	elseif ( is_single() ) {
		$post_id = get_queried_object_id();
		$post_title = get_the_title( $post_id );
		$post_type = get_post_type( $post_id );

		// カスタムポストのアーカイブページを取得
		$post_type_obj = get_post_type_object( $post_type );
		if ( $post_type_obj && $post_type_obj->has_archive ) {
			$breadcrumb_items[] = array(
				'title' => $post_type_obj->label,
				'url'   => get_post_type_archive_link( $post_type ),
				'is_current' => false,
			);
		}

		// タクソノミーを取得（カスタムポストに紐づいている場合）
		$taxonomies = get_object_taxonomies( $post_type, 'objects' );

		if ( ! empty( $taxonomies ) && !$array['exclude_tax'] ) {
			foreach ( $taxonomies as $taxonomy ) {
				$terms = get_the_terms( $post_id, $taxonomy->name );
				if ( ! empty( $terms ) && ! is_wp_error( $terms ) ) {
					$term = $terms[0];
					$breadcrumb_items[] = array(
						'title' => $term->name,
						'url'   => get_term_link( $term ),
						'is_current' => false,
					);
					break; // 最初のタクソノミーのみ使用
				}
			}
		}

		// 現在の投稿を最後に追加
		$breadcrumb_items[] = array(
			'title' => $post_title,
			'url'   => '',
			'is_current' => true,
		);
	}
	// カテゴリーページの場合
	elseif ( is_category() ) {
		$cat_obj = get_queried_object();

		// 通常の投稿（post）のアーカイブページがある場合に追加
		$post_type_obj = get_post_type_object( 'post' );
		if ( $post_type_obj && $post_type_obj->has_archive ) {
			$breadcrumb_items[] = array(
				'title' => $post_type_obj->label,
				'url'   => get_post_type_archive_link( 'post' ),
				'is_current' => false,
			);
		}

		$breadcrumb_items[] = array(
			'title' => $cat_obj->name,
			'url'   => '',
			'is_current' => true,
		);
	}
	// カスタムタクソノミーアーカイブの場合
	elseif ( is_tax() ) {
		$term = get_queried_object();
		$taxonomy = get_taxonomy( $term->taxonomy );

		// 関連付けられた投稿タイプのアーカイブを追加
		if ( ! empty( $taxonomy->object_type ) ) {
			$post_type = $taxonomy->object_type[0];
			$post_type_obj = get_post_type_object( $post_type );

			if ( $post_type_obj && $post_type_obj->has_archive ) {
				$breadcrumb_items[] = array(
					'title' => $post_type_obj->label,
					'url'   => get_post_type_archive_link( $post_type ),
					'is_current' => false,
				);
			}
		}

		$breadcrumb_items[] = array(
			'title' => $term->name,
			'url'   => '',
			'is_current' => true,
		);
	}
	// カスタムポストアーカイブの場合
	elseif ( is_post_type_archive() ) {
		$post_type = get_queried_object();
		$breadcrumb_items[] = array(
			'title' => $post_type->label,
			'url'   => '',
			'is_current' => true,
		);
	}
}
?>

<ul class="c-breadcrumb c-inner">
	<?php foreach ( $breadcrumb_items as $item ) : ?>
		<li class="c-breadcrumb__item<?php echo $item['is_current'] ? ' --current' : ''; ?>">
			<?php if ( $item['is_current'] ) : ?>
				<?php echo esc_html( $item['title'] ); ?>
			<?php else : ?>
				<a class="c-breadcrumb__link" href="<?php echo esc_url( $item['url'] ); ?>">
					<?php echo esc_html( $item['title'] ); ?>
				</a>
			<?php endif; ?>
		</li>
	<?php endforeach; ?>
</ul>