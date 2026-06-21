<?php


/**
 * 初期設定
 * 先読みした方が良さそうな関数
 * /functions/init/
 */

// 初期設定
require get_template_directory() . '/functions/init/initFunction.php';


/**
 * カスタムポストやページ設定まわりの関数群
 * /functions/page/
 */

// 固定ページ自動生成
//require get_template_directory(). '/functions/page/customPage.php';
// カスタムポスト
require get_template_directory(). '/functions/page/customPost.php';
// カスタムタクソノミー
require get_template_directory(). '/functions/page/customTaxonomy.php';
// Optionページ
//require get_template_directory(). '/functions/page/optionPage.php';
// ページャー設定
require get_template_directory(). '/functions/page/pager.php';
// 追加block
require get_template_directory(). '/block/_blockLayout.php';


