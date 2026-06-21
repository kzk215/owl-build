<?php
/**
 * オプションページ
 */
if( function_exists('acf_add_options_page') ) {
  /* 親ページ
  * ---------- */
  acf_add_options_page(array(
    'page_title' => 'お問い合わせ設定', // ページタイトル
    'menu_title' => 'お問い合わせ設定', // メニュータイトル
    'menu_slug' => 'theme-general-settings', // メニュースラッグ
    'capability' => 'edit_posts',
    'redirect' => false
  ));
  /* 子ページ
  * ---------- */
/*  acf_add_options_sub_page(array(
    'page_title' 	=> 'お問い合わせ設定',
    'menu_title'	=> 'お問い合わせ設定',
    'menu_slug' => 'contact_option',
    'parent_slug'	=> 'theme-general-settings',
  ));*/
}

?>