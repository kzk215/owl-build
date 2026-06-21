<?php
/**************************************************/
/* BLOCK LAYOUT */
/**************************************************/

add_action('init', 'my_acf_init_block_types');

function my_acf_init_block_types() {

	if (function_exists('register_block_type')) {
		register_block_type(__DIR__ . '/postRelated/block.json');
		register_block_type(__DIR__ . '/customBtn/block.json');
	}
}

// 自作カテゴリ
function my_plugin_block_categories( $categories ) {
  return array_merge(
    $categories,
    array(
      array(
        'slug'  => 'hp-original',
        'title' => '追加ブロック',
        'icon'  => 'wordpress',
      ),
    )
  );
}
add_filter( 'block_categories_all', 'my_plugin_block_categories', 10 );
?>
