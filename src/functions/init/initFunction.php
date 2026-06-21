<?php
/**
 * WP初期設定関数群
 */
$version = '0.1.1';
$site_url = get_bloginfo('url');
$site_name = get_bloginfo('name');
$site_description = get_bloginfo('description');
$wp_path = get_template_directory_uri();
$site_title = get_bloginfo('title');

// WARNING全消し　苦肉の策
//error_reporting(0);

add_theme_support('post-thumbnails');
session_start();
/**
 * 現在のURLが特定のページの下層であるか判定する
 *
 * @param string $base_page_slug 基準となるページのスラッグ（例: 'mypage'）
 * @return bool trueの場合、下層ページである
 */
function is_subpage_of($base_page_slug) {
	// 現在のリクエストURIを取得
	$current_uri = $_SERVER['REQUEST_URI'];
	// URLデコードを行い、前後のスラッシュを削除
	$current_uri = trim(urldecode($current_uri), '/');

	// 基準ページのスラッグが現在のURIの先頭にあるかチェック
	return strpos($current_uri, $base_page_slug . '/') === 0;
}


/** テキスト省略
 * @return string
 */
function textLimit($text, $max_text_length = 30)
{
	// HTMLタグを除去したテキストを取得
	$clean_text = strip_tags($text);
	if (mb_strlen($clean_text, 'UTF-8') > $max_text_length) {
		$content = mb_substr($clean_text, 0, $max_text_length, 'UTF-8') . '…';
		return $content;
	} else {
		return $clean_text;
	}
}

function canonical_url() {
	global $post;
	if ( is_singular() ) { // 投稿ページまたは固定ページの場合
		$canonical_url = get_permalink( $post->ID );
	} elseif ( is_front_page() ) { // トップページの場合
		$canonical_url = home_url( '/' );
	} else { // その他のページの場合
		$canonical_url = null;
	}
	if ( $canonical_url ) {
		echo '<link rel="canonical" href="' . esc_url( $canonical_url ) . '" />' . "\n";
	}
}
add_action( 'wp_head', 'canonical_url' );

function disable_author_archive_query() {
	if( preg_match('/author=([0-9]*)/i', $_SERVER['QUERY_STRING']) ){
		wp_safe_redirect( home_url() );
		exit;
	}
}
add_action('init', 'disable_author_archive_query');
add_action('template_redirect', function () {
	if (is_author()) {
		wp_redirect(home_url(), 301);
		exit;
	}
});
// 管理メニューの一部非表示
function remove_menus()
{
  global $menu;
  remove_menu_page('edit.php'); // 投稿を非表示
  remove_menu_page('edit-comments.php'); // コメントを非表示
}
add_action('admin_menu', 'remove_menus');


// 日本語スラッグの禁止
function auto_post_slug( $slug, $post_ID, $post_status, $post_type ) {
  if ( preg_match( '/(%[0-9a-f]{2})+/', $slug ) ) {
    $slug = utf8_uri_encode( $post_type ) . '-' . $post_ID;
  }
  return $slug;
}
add_filter( 'wp_unique_post_slug', 'auto_post_slug', 10, 4 );



//固定ページエディタ非表示
function my_remove_post_editor_support(){
	if (!is_admin()) {
		return;
	}

	$page_id = $_GET['post'] ?? ($_POST['post_ID'] ?? 0);
	if (!$page_id) {
		return;
	}

	$post = get_post($page_id);
	if ($post && $post->post_name === 'faq') {
		remove_post_type_support('page', 'editor');
	}
}
add_action('admin_init', 'my_remove_post_editor_support');



// 固定ページ子階層の設定
// ex) page-{親slug}__{子slug}
function page_templates_slug($templates)
{
  global $wp_query;

  $template = get_page_template_slug();
  $pagename = $wp_query->query['pagename'];

  if ($pagename && !$template) {
    $pagename = str_replace('/', '__', $pagename);
    $decoded = urldecode($pagename);

    if ($decoded == $pagename) {
      array_unshift($templates, "page-{$pagename}.php");
    }
  }

  return $templates;
}

add_filter('page_template_hierarchy', 'page_templates_slug');

//　画像サイズ別自動生成のカット
/*function not_create_imgsize($sizes) {
  unset($sizes['thumbnail']);
  unset($sizes['medium']);
  unset($sizes['medium_large']);
  unset($sizes['large']);
  unset($sizes['1536x1536']);
  unset($sizes['2048x2048']);
  return $sizes;
}
add_filter('intermediate_image_sizes_advanced', 'not_create_imgsize');*/

// 特定ページでエディタ非表示
/*add_action( 'init', function() {
	remove_post_type_support( 'life', 'editor' );
	remove_post_type_support( 'other', 'editor' );
	remove_post_type_support( 'coupon', 'editor' );
}, 99);*/


function filter_search_query($query) {
  if (!is_admin() && $query->is_main_query() && $query->is_search()) {
    // カスタム投稿タイプを指定
    $query->set('post_type', 'blog');
    $query->set('posts_per_page', -1); // 全ての投稿を取得する

    // 検索キーワード
    $search_term = $query->query_vars['s'];

    // カスタムタクソノミーを含めるためのフィルタ
    $tax_query = array(
      'relation' => 'OR', // 複数の条件のうち1つでも満たせばOK
      array(
        'taxonomy' => 'blog-tag', // タクソノミー名
        'field'    => 'name',     // ターム名で検索
        'terms'    => $search_term, // 検索キーワード
        'operator' => 'LIKE', // ターム名に検索キーワードを含む
      ),
    );

    // 既存のタクソノミークエリがある場合にマージ
    if (!empty($query->tax_query->queries)) {
      $tax_query = array_merge($query->tax_query->queries, $tax_query);
    }

    $query->set('tax_query', $tax_query);
  }
}
add_action('pre_get_posts', 'filter_search_query', 10);

function allow_svg_uploads($mimes) {
	$mimes['svg'] = 'image/svg+xml';
	return $mimes;
}
add_filter('upload_mimes', 'allow_svg_uploads');


function split_title_parentheses( $title, $args = [] ) {

	$defaults = [
		'brackets' => 'both', // full | half | both
		'mode'     => 'first', // first | last | all
	];
	$args = wp_parse_args( $args, $defaults );
	switch ( $args['brackets'] ) {
		case 'full':
			$pattern = '（(.+?)）';
			break;
		case 'half':
			$pattern = '\((.+?)\)';
			break;
		default:
			$pattern = '[（(](.+?)[）)]';
			break;
	}
	$regex = '/' . $pattern . '/u';
	$result = [
		'main' => $title,
		'sub'  => '',
		'all'  => [],
	];

	if ( $args['mode'] === 'all' ) {
		if ( preg_match_all( $regex, $title, $matches ) ) {
			$result['all'] = $matches[1];
			$result['sub'] = $matches[1][0] ?? '';
		}
	}
	elseif ( $args['mode'] === 'last' ) {
		if ( preg_match_all( $regex, $title, $matches ) ) {
			$result['sub'] = end( $matches[1] );
		}
	}
	else {
		if ( preg_match( $regex, $title, $matches ) ) {
			$result['sub'] = $matches[1];
		}
	}
	$result['main'] = trim( preg_replace( $regex, '', $title ) );

	return $result;
}


/**
 * テーブルブロックをスクロール用のタグで囲む
 */
function wrap_core_table_block($block_content, $block) {
	if ($block['blockName'] === 'core/table') {
		$block_content = '<div class="c-scroll"><div class="c-table__wrap">' . $block_content . '</div></div>';
	}
	return $block_content;
}
add_filter('render_block', 'wrap_core_table_block', 10, 2);



/**
 * Yoast SEO アーカイブページのOGP上書き
 */
add_filter('wpseo_title', 'custom_yoast_og_title', 20);
add_filter('wpseo_opengraph_title', 'custom_yoast_og_title', 20);
function custom_yoast_og_title($title) {
	if (is_post_type_archive('case')) {
		return '導入事例｜工場・倉庫の熱中症対策 五常（GOJOH）';
	} elseif (is_post_type_archive('products')) {
		return '熱中症対策 製品一覧｜五常（GOJOH）';
	} elseif (is_post_type_archive('column')) {
		return '工場・倉庫の熱中症対策コラム｜五常（GOJOH）';
	}
	return $title;
}

add_filter('wpseo_metadesc', 'custom_yoast_og_desc', 20);
add_filter('wpseo_opengraph_desc', 'custom_yoast_og_desc', 20);
function custom_yoast_og_desc($desc) {
	if (is_post_type_archive('case')) {
		return '物流倉庫・食品加工工場など多様な業種での熱中症対策導入事例をご紹介。現場の課題と解決策を業種別に掲載。';
	} elseif (is_post_type_archive('products')) {
		return '送風・遮熱・空調の3アプローチで工場・倉庫の熱中症対策をご提案。スマイルファン・30Mファン・遮熱レスキュー・遮熱塗装の4製品を展開。';
	} elseif (is_post_type_archive('column')) {
		return 'WBGT・法規制・製品選び・費用・補助金など工場・倉庫の熱中症対策情報を専門家目線で解説。';
	}
	return $desc;
}

add_filter('wpseo_opengraph_image', 'custom_yoast_og_image', 20);
function custom_yoast_og_image($image) {
	$wp_path = get_template_directory_uri();
	if (is_post_type_archive('case')) {
		return $wp_path . '/assets/img/common/ogp.jpg';
	} elseif (is_post_type_archive('products')) {
		return $wp_path . '/assets/img/common/ogp.jpg';
	} elseif (is_post_type_archive('column')) {
		return $wp_path . '/assets/img/common/ogp.jpg';
	}
	return $image;
}
?>