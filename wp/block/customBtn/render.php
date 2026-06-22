<?php
/**
 * ボタン BLOCK テンプレート
 */
$site_url = get_bloginfo('url');

// ACF フィールド取得（ボタンの種類：チェックボックス等を想定）
// 選択肢: 'mail' (お問い合わせ), 'showroom' (ショールーム)
$btn_types = get_field('btn_type');

if ($btn_types) : ?>
	<div class="c-btn__flex">
		<?php if (in_array('mail', (array)$btn_types, true)) : ?>
			<a class="c-btn --mail" href="<?= esc_url($site_url); ?>/contact/">お問い合わせ</a>
		<?php endif; ?>

		<?php if (in_array('showroom', (array)$btn_types, true)) : ?>
			<a class="c-btn --lightBlue" href="<?= esc_url($site_url); ?>/showroom/">ショールームを見学する</a>
		<?php endif; ?>
	</div>
<?php endif; ?>
