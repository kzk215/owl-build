<?php
/**
 * 固定ページ生成
 */

function create_custom_pages_with_optional_parents() {
  $pages = [
    [
      'title' => 'お問い合わせ',
      'slug' => 'contact',
      'parent_slug' => '',
    ],
    [
      'title' => 'お問い合わせ - 確認',
      'slug' => 'confirm',
      'parent_slug' => 'contact',
    ],
    [
      'title' => 'お問い合わせ - 完了',
      'slug' => 'complete',
      'parent_slug' => 'contact',
    ],
    // 他のページも同様に追加
 ];

  foreach ($pages as $page) {
    $parent_page_id = 0;
    if (!empty($page['parent_slug'])) {
      $query = new WP_Query(array(
        'name'        => $page['parent_slug'],
        'post_type'   => 'page',
        'post_status' => 'publish',
        'numberposts' => 1
      ));

      if ($query->have_posts()) {
        $query->the_post();
        $parent_page_id = get_the_ID();
        wp_reset_postdata(); // クエリのリセット
      }
    }

    // タイトル、スラッグ、および親ページIDに基づいてページが存在するか確認
    $existing_page_query = new WP_Query(array(
      'post_type'   => 'page',
      'post_status' => 'publish',
      'title'       => $page['title'],
      'numberposts' => 1
    ));

    if ($existing_page_query->have_posts()) {
      $existing_page_query->the_post();
      $existing_page = $existing_page_query->post;

      $correct_slug = $existing_page->post_name == $page['slug'];
      $correct_parent = isset($parent_page_id) ? $existing_page->post_parent == $parent_page_id : true;

      if ($correct_slug && $correct_parent) {
        // 既に正しいページが存在する場合はスキップ
        wp_reset_postdata(); // クエリのリセット
        continue;
      }
      wp_reset_postdata(); // クエリのリセット
    }

    wp_insert_post(array(
      'post_title'   => $page['title'],
      'post_content' => isset($page['content']) ? $page['content'] : '', // 'content' キーが存在する場合はその値を、存在しない場合は空文字列を使用
      'post_status'  => 'publish',
      'post_type'    => 'page',
      'post_name'    => $page['slug'],
      'post_parent'  => isset($parent_page_id) ? $parent_page_id : 0 // 'post_parent' キーが存在しない場合の処理も追加
    ));
  }
}

add_action('after_setup_theme', 'create_custom_pages_with_optional_parents');
?>