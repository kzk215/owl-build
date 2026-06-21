<?php
global $wp_path;
global $site_url;
$page_type = 'single';
?>
<?php
get_template_part('./include/head');
get_template_part('./include/header');
?>
<main>
	<?php get_template_part('./template-parts/breadCrumb',null,$args = ['exclude_tax'=> true ]);?>
	<div class="l-caseSingle__keyVisual c-curveBg__top --wh">
		<?php

		$industry_terms = get_the_terms( $post->ID, 'industry' );
		$facility_terms = get_the_terms( $post->ID, 'facility' );
		$thumb_img = get_the_post_thumbnail_url();
		$title = get_field('title');
		$text = get_field('detail');
		if(empty($thumb_img)){
			$thumb_img = $wp_path.'/assets/img/common/dummy.jpg';
		}
		?>
		<div class="c-inner l-caseSingle__keyVisualFlex">
			<img class="l-caseSingle__keyVisualImg m-inView --bottom" src="<?= $thumb_img;?>" alt="<?php the_title();?>">
			<div class="l-caseSingle__keyVisualBox">
				<div class="l-caseSingle__category m-inView --bottom">
					<?php foreach ($industry_terms as $term):?>
						<span class="l-caseSingle__categoryItem"><?= $term -> name?></span>
					<?php endforeach;?>
					<?php foreach ($facility_terms as $term):?>
						<span class="l-caseSingle__categoryItem"><?= $term -> name?></span>
					<?php endforeach;?>
				</div>
				<h1 class="l-caseSingle__title m-inView --bottom"><?= $title?></h1>
				<p class="l-caseSingle__lead m-inView --bottom"><?php the_title();?></p>
				<p class="c-text u-mt30 m-inView --bottom"><?= $text;?></p>
				<div class="l-caseSingle__dlWrap">
					<?php $group = get_field('group'); ?>
					<dl class="l-caseSingle__dl m-inView --bottom">
						<dt class="l-caseSingle__dt">導入対象エリア</dt>
						<dd class="l-caseSingle__dd"><?= $group['area']?>
							<?php if($group['area-subtext']): ?>
							<span class="l-caseSingle__sm">（<?= $group['area-subtext']?>）</span>
							<?php endif;?>
						</dd>
					</dl>
					<dl class="l-caseSingle__dl m-inView --bottom">
						<dt class="l-caseSingle__dt">対象従業員数</dt>
						<dd class="l-caseSingle__dd"><?= $group['employees']?></dd>
					</dl>
				</div>

			</div>

		</div>

	</div>


	<section class="l-caseSingleArticle">
		<div class="c-inner">
			<?php $product = get_field('product');
			if($product['product_list']):
			?>
			<h2 class="c-titleSm m-inView --bottom">導入製品・仕様</h2>
			<div class="l-caseSingleArticle__list m-inView --bottom">
				<?= $product['product_list']?>
			</div>
				<?php if($product['product_url']):?>
					<div class="u-mt40 m-inView --bottom">
						<a class="c-btn --wh u-mx_auto" href="<?= $product['product_url']?>">製品詳細を見る</a>
					</div>
				<?php endif;?>
			<?php endif;?>
			<h2 class="c-titleSm u-mt60 m-inView --bottom">課題と解消</h2>
			<div class="l-caseSingleArticle__box">
				<?php $issues= get_field('issues');?>
				<?php if($issues['issue01'] && $issues['solution01']):?>
				<div class="l-caseSingleArticle__item m-inView --bottom">

					<div class="l-caseSingleArticle__question">
						<div class="l-caseSingleArticle__questionImgWrap">
							<img class="l-caseSingleArticle__questionImg" src="<?= $wp_path ?>/assets/img/case/question_1.svg" alt="">
						</div>

						<div class="l-caseSingleArticle__questionDetail">
							<span class="l-caseSingleArticle__questionCategory">課題</span>
							<p class="l-caseSingleArticle__questionText">
								<?= $issues['issue01'] ?>
							</p>
						</div>
					</div>
					<div class="l-caseSingleArticle__answer">
						<div class="l-caseSingleArticle__answerImgWrap">
							<img class="l-caseSingleArticle__answerImg" src="<?= $wp_path ?>/assets/img/case/answer_1.svg" alt="">
						</div>
						<div class="l-caseSingleArticle__answerDetail">
							<span class="l-caseSingleArticle__answerCategory">解消</span>
							<p class="l-caseSingleArticle__answerText">
								<?= $issues['solution01'] ?>
							</p>
						</div>
					</div>
				</div>
				<?php endif;?>
				<?php if($issues['issue02'] && $issues['solution02']):?>
					<div class="l-caseSingleArticle__item m-inView --bottom">

						<div class="l-caseSingleArticle__question">
							<div class="l-caseSingleArticle__questionImgWrap">
								<img class="l-caseSingleArticle__questionImg" src="<?= $wp_path ?>/assets/img/case/question_2.svg" alt="">
							</div>

							<div class="l-caseSingleArticle__questionDetail">
								<span class="l-caseSingleArticle__questionCategory">課題</span>
								<p class="l-caseSingleArticle__questionText">
									<?= $issues['issue02'] ?>
								</p>
							</div>
						</div>
						<div class="l-caseSingleArticle__answer">
							<div class="l-caseSingleArticle__answerImgWrap">
								<img class="l-caseSingleArticle__answerImg" src="<?= $wp_path ?>/assets/img/case/answer_2.svg" alt="">
							</div>
							<div class="l-caseSingleArticle__answerDetail">
								<span class="l-caseSingleArticle__answerCategory">解消</span>
								<p class="l-caseSingleArticle__answerText">
									<?= $issues['solution02'] ?>
								</p>
							</div>
						</div>
					</div>
				<?php endif;?>
			</div>
		</div>

	</section>
	<?php
	$factor = get_field('factor');
	if($factor['customer'] || $factor['manager'] ):
	?>
	<section class="l-caseSingleFaq c-curveBg__topReverse">
		<div class="c-inner">
			<h2 class="c-titleSm m-inView --bottom">導入の決め手</h2>
			<div class="l-caseSingleFaq__box ">
				<div class="l-caseSingleFaq__bubble --question m-inView --bottom">
					<div class="l-caseSingleFaq__bubbleImg">
						<img class="l-caseSingleFaq__bubbleImgItem" src="<?= $wp_path ?>/assets/img/case/chara.svg" alt="お客様">
						<p class="l-caseSingleFaq__bubbleImgText">お客様</p>
					</div>
					<div class="l-caseSingleFaq__bubbleText">
						<?= $factor['customer']?>
					</div>
				</div>
				<div class="l-caseSingleFaq__bubble --answer m-inView --bottom">
					<div class="l-caseSingleFaq__bubbleImg">
						<img class="l-caseSingleFaq__bubbleImgItem --illustration" src="<?= $wp_path ?>/assets/img/case/chara2.svg" alt="担当:宇井">
						<p class="l-caseSingleFaq__bubbleImgText">担当:宇井</p>
					</div>
					<div class="l-caseSingleFaq__bubbleText">
						<?= $factor['manager']?>
					</div>
				</div>
			</div>

		</div>

	</section>
	<?php endif;?>
	<section class="l-columnRelated u-mt0">
		<div class="c-inner">
			<h3 class="l-columnRelated__title u-mb10 m-inView --bottom">熱中症対策の製品紹介</h3>
			<p class="c-text u-mb30 m-inView --bottom">現場に合わせた最適な方法を提案します</p>
			<?php
			get_template_part('./template-parts/product');
			?>
		</div>
	</section>
</main>
<?php
get_template_part('./include/footer');
?>
