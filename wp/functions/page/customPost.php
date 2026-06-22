<?php
/**
 * カスタム投稿タイプ
 */

function create_post_type() {
  // Post
  /*---------------------------------------------*/
  register_post_type(
    'column',
    array(
      'label' => 'コラム',
      'public' => true,
      'has_archive' => true,
      'menu_position' => 4,
      'show_in_rest' => true,
      'show_ui' => true,
      'supports' => array(
        'thumbnail',
        'title',
				'editor',
      ),
    )
  );
	register_post_type(
		'case',
		array(
			'label' => '導入事例',
			'public' => true,
			'has_archive' => true,
			'menu_position' => 4,
			'show_in_rest' => true,
			'show_ui' => true,
			'supports' => array(
				'thumbnail',
				'title',
			),
		)
	);
	register_post_type(
		'products',
		array(
//			'label' => '熱中症対策の製品紹介',
			'labels' => array(
				'name'               => '熱中症対策の製品紹介',
				'menu_name'          => '製品紹介',
			),
			'public' => true,
			'has_archive' => true,
			'menu_position' => 4,
			'show_in_rest' => true,
			'show_ui' => true,
			'supports' => array(
				'thumbnail',
				'title',
			),
		)
	);
}
add_action( 'init', 'create_post_type' );
?>