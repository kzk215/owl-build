<?php
/**
 * ページネーション出力関数
 * $paged : 現在のページ
 * $pages : 全ページ数
 * $range : 左右に何ページ表示するか
 * $show_only : 1ページしかない時に表示するかどうか
 */
function pagination($pages, $paged, $range = 2, $show_only = false)
{
	$pages = (int) $pages;
	$paged = $paged ? (int) $paged : 1;

	// 1ページしかない場合
	if ($pages <= 1) {
		if ($show_only) {
			echo '<div class="c-pager">';
			echo '<span class="c-pager__prev is-hidden"></span>';
			echo '<span class="c-pager__link is-current">1</span>';
			echo '<span class="c-pager__next is-hidden"></span>';
			echo '</div>';
		}
		return;
	}

	// GETパラメータを引き継ぐ（pagedは除外）
	$query_args = $_GET;
	unset($query_args['paged']);

	$make_url = static function (int $page) use ($query_args): string {
		$url = get_pagenum_link($page);
		if (!empty($query_args)) {
			$url = add_query_arg($query_args, $url);
		}
		return $url;
	};

	echo '<div class="c-pager">';

	// prev
	if ($paged > 1) {
		echo '<a class="c-pager__prev" href="', esc_url($make_url($paged - 1)), '"></a>';
	} else {
		echo '<span class="c-pager__prev is-hidden"></span>';
	}

	// 表示するページ番号の決定（先頭・末尾・現在±range）
	$display = array();
	$display[] = 1;

	$start = max(2, $paged - $range);
	$end   = min($pages - 1, $paged + $range);

	for ($i = $start; $i <= $end; $i++) {
		$display[] = $i;
	}

	if ($pages > 1) {
		$display[] = $pages;
	}

	$display = array_values(array_unique($display));
	sort($display);

	// ページ番号出力（隙間は …）
	$prev_num = 0;
	foreach ($display as $num) {
		if ($prev_num && $num - $prev_num >= 2) {
			echo '<span class="c-pager__item">…</span>';
		}

		if ($num === $paged) {
			echo '<a class="c-pager__link is-current" href="', esc_url($make_url($num)), '">', (int) $num, '</a>';
		} else {
			echo '<a class="c-pager__link" href="', esc_url($make_url($num)), '">', (int) $num, '</a>';
		}

		$prev_num = $num;
	}

	// next
	if ($paged < $pages) {
		echo '<a class="c-pager__next" href="', esc_url($make_url($paged + 1)), '"></a>';
	} else {
		echo '<span class="c-pager__next is-hidden"></span>';
	}

	echo '</div>';
}
?>