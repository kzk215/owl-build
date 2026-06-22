<?php
global $wp_path;
global $site_url;

// 人気記事ランキング（WP-PostViews使用、最大3件）
$ranking_query = new WP_Query([
	'post_type'      => 'column',
	'post_status'    => 'publish',
	'posts_per_page' => 3,
	'meta_key'       => 'views',
	'orderby'        => 'meta_value_num',
	'order'          => 'DESC',
]);

// タクソノミー column_category の全項目
$column_categories = get_terms([
	'taxonomy'   => 'column_category',
	'hide_empty' => false,
	'orderby'    => 'term_order',
	'order'      => 'ASC',
]);

// タクソノミー keywords：固定3件
$fixed_keyword_slugs = ['導入事例', '工場', '倉庫'];
$fixed_keywords = [];
foreach ($fixed_keyword_slugs as $name) {
	$term = get_term_by('name', $name, 'keywords');
	if ($term && !is_wp_error($term)) {
		$fixed_keywords[] = $term;
	}
}

// タクソノミー keywords：よく使われているterm上位4件（固定3件を除く）
$fixed_keyword_ids = array_map(fn($t) => $t->term_id, $fixed_keywords);
$popular_keywords = get_terms([
	'taxonomy'   => 'keywords',
	'hide_empty' => true,
	'orderby'    => 'count',
	'order'      => 'DESC',
	'number'     => 4 + count($fixed_keyword_ids),
	'exclude'    => $fixed_keyword_ids,
]);
if (is_wp_error($popular_keywords)) {
	$popular_keywords = [];
}
$popular_keywords = array_slice($popular_keywords, 0, 4);
?>

<aside class="l-sideNav">
	<div class="l-sideNav__wrap">
		<div class="l-sideNav__modal" data-modal="ranking">
			<div class="l-sideNav__titleWrap">
				<h3 class="l-sideNav__title --iconRanking">人気記事ランキング</h3>
				<span class="l-sideNav__subTitle">RANKING</span>
			</div>

			<?php if ($ranking_query->have_posts()) : $rank = 0; ?>
				<?php while ($ranking_query->have_posts()) : $ranking_query->the_post(); $rank++; ?>
					<?php
					$post_url   = get_permalink();
					$post_title = get_the_title();
					$post_date  = get_the_date('Y.n.j');
					$thumb_url  = get_the_post_thumbnail_url(get_the_ID(), 'medium');
					$card_class = $rank === 1 ? 'l-sideNav__card --first' : 'l-sideNav__card';
					?>
					<a class="<?= esc_attr($card_class) ?>" href="<?= esc_url($post_url) ?>">
						<figure class="l-sideNav__cardImg">
							<?php if ($thumb_url) : ?>
								<img class="l-sideNav__cardImgItem" src="<?= esc_url($thumb_url) ?>" alt="<?= esc_attr($post_title) ?>">
							<?php else : ?>
								<img class="l-sideNav__cardImgItem" src="<?= $wp_path ?>/assets/img/common/dummy-gray.svg" alt="">
							<?php endif; ?>
						</figure>

						<div class="l-sideNav__cardDetail">
							<time class="l-sideNav__cardDate"><?= esc_html($post_date) ?></time>
							<p class="l-sideNav__cardTitle"><?= esc_html($post_title) ?></p>
						</div>
					</a>
				<?php endwhile; wp_reset_postdata(); ?>
			<?php endif; ?>
		</div>
		<div class="l-sideNav__modal" data-modal="category">
			<div class="l-sideNav__titleWrap">
				<h3 class="l-sideNav__title --iconCategory">記事カテゴリ</h3>
				<span class="l-sideNav__subTitle">CATEGORY</span>
			</div>
			<div class="l-sideNav__list">
				<?php if (!empty($column_categories) && !is_wp_error($column_categories)) : ?>
					<?php foreach ($column_categories as $cat) : ?>
						<a class="l-sideNav__listItem" href="<?= $site_url?>/column/?category=<?= $cat->slug ?>"><?= esc_html($cat->name) ?></a>
					<?php endforeach; ?>
				<?php endif; ?>
			</div>
		</div>
		<div class="l-sideNav__modal" data-modal="keyword">
			<div class="l-sideNav__titleWrap">
				<h3 class="l-sideNav__title --iconKeyword">注目のキーワード</h3>
				<span class="l-sideNav__subTitle">KEYWORD</span>
			</div>
			<div class="l-sideNav__tag">
				<?php foreach ($fixed_keywords as $kw) : ?>
					<a class="l-sideNav__tagItem" href="<?= $site_url?>/column/?keywords=<?= $kw->slug?>"># <?= esc_html($kw->name) ?></a>
				<?php endforeach; ?>
				<?php foreach ($popular_keywords as $kw) : ?>
					<a class="l-sideNav__tagItem" href="<?= $site_url?>/column/?keywords=<?= $kw->slug?>"># <?= esc_html($kw->name) ?></a>
				<?php endforeach; ?>
			</div>
   <form action="<?= $site_url?>/column_search/" method="get" class="l-sideNav__searchForm">
				<button type="submit" class="l-sideNav__searchSubmit"></button>
				<label class="l-sideNav__search" for="tagSearch">
					<input class="l-sideNav__searchTextBox" id="tagSearch" type="text" value="" name="words" placeholder="キーワードを入力">
				</label>
			</form>

		</div>
		<?php if(!is_post_type_archive('column')):?>
		<?php
		$current_url   = (empty($_SERVER['HTTPS']) ? 'http://' : 'https://') . $_SERVER['HTTP_HOST'] . $_SERVER['REQUEST_URI'];
		$current_title = get_the_title();
		$share_text    = $current_title . ' ' . $current_url;
		?>
		<div class="l-sideNav__sns">
			<div class="l-sideNav__snsText">
				<p class="l-sideNav__snsShare">SHARE</p>
				<p class="l-sideNav__snsJp">記事をシェアする</p>
			</div>
			<div class="l-sideNav__snsList">
				<a class="l-sideNav__snsItem" href="https://line.me/R/msg/text/?<?= rawurlencode($share_text) ?>" target="_blank" rel="noopener noreferrer"><img class="l-sideNav__snsImg" src="<?= $wp_path?>/assets/img/common/sns-line.svg" alt="Line"></a>
				<a class="l-sideNav__snsItem" href="https://www.facebook.com/sharer/sharer.php?u=<?= rawurlencode($current_url) ?>" target="_blank" rel="noopener noreferrer"><img class="l-sideNav__snsImg" src="<?= $wp_path?>/assets/img/common/sns-facebook.svg" alt="facebook"></a>
				<a class="l-sideNav__snsItem" href="https://www.instagram.com/" target="_blank" rel="noopener noreferrer"><img class="l-sideNav__snsImg" src="<?= $wp_path?>/assets/img/common/sns-instagram.svg" alt="instagram"></a>
				<a class="l-sideNav__snsItem" href="https://twitter.com/intent/tweet?text=<?= rawurlencode($current_title) ?>&url=<?= rawurlencode($current_url) ?>" target="_blank" rel="noopener noreferrer"><img class="l-sideNav__snsImg" src="<?= $wp_path?>/assets/img/common/sns-x.svg" alt="X"></a>
				<button type="button" class="l-sideNav__snsItem js-copy-url" data-url="<?= esc_url($current_url) ?>">
					<img class="l-sideNav__snsImg" src="<?= $wp_path?>/assets/img/common/sns-link.svg" alt="link">
					<span class="l-sideNav__copyFeedback">コピーしました</span>
				</button>
			</div>
			<button type="button" class="l-sideNav__modalClose">×</button>
		</div>
		<?php endif; ?>
		<a class="l-sideNav__bnr" href="<?= $site_url;?>/concept/">
			<img class="l-sideNav__bnrItem" src="<?= $wp_path;?>/assets/img/common/side-bnr.png" alt="五常の想い">
		</a>
		<div class="l-sideNav__spNav">
			<button class="l-sideNav__toggle" type="button" ></button>
			<div class="l-sideNav__btnList">
				<span class="l-sideNav__btn --ranking">ランキング</span>
				<span class="l-sideNav__btn --category">カテゴリ</span>
				<span class="l-sideNav__btn --keyword">キーワード</span>
			</div>
		</div>
	</div>


</aside>
<div class="c-asideOverlay"></div>
