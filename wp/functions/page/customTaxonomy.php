<?php
/**
 * カスタムタクソノミー
 */

register_taxonomy(
  'industry',
  array('case'),
  array(
    'label' => '業種タイプ',
    'public' => true,'show_ui' => true,
    'hierarchical' => true,
    'query_var' => true,
    'show_in_rest' => true,
    'show_admin_column' => true,
  )
);
register_taxonomy(
	'facility',
	array('case'),
	array(
		'label' => '施設タイプ',
		'public' => true,'show_ui' => true,
		'hierarchical' => true,
		'query_var' => true,
		'show_in_rest' => true,
		'show_admin_column' => true,
	)
);

register_taxonomy(
	'products_tax',
	array('products'),
	array(
		'label' => '製品タイプ',
		'public' => true,'show_ui' => true,
		'hierarchical' => true,
		'query_var' => true,
		'show_in_rest' => true,
		'show_admin_column' => true,
	)
);
register_taxonomy(
	'column_category',
	array('column'),
	array(
		'label' => '記事カテゴリ',
		'public' => true,'show_ui' => true,
		'hierarchical' => true,
		'query_var' => true,
		'show_in_rest' => true,
		'show_admin_column' => true,
	)
);
register_taxonomy(
	'keywords',
	array('column'),
	array(
		'label' => 'キーワード',
		'public' => true,'show_ui' => true,
		'hierarchical' => false,
		'query_var' => true,
		'show_in_rest' => true,
		'show_admin_column' => true,
	)
);
?>