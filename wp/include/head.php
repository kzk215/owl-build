<?php
global $wp_path;
global $site_url;
?>

<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="format-detection" content="telephone=no">
	<meta name="google-site-verification" content="Zj2cEfwplKID4BHgHQcx2VrG7Odfqx3-8209o2mRtyY" />
	<title><?php wp_title('|', true, 'right'); bloginfo('name'); ?></title>
<!--	--><?php //get_template_part('./include/seo');?>
	<!-- Google Tag Manager -->

	<!-- End Google Tag Manager -->

  <!-- icon -->
	<link rel="icon" href="<?= $wp_path?>/assets/favicon/favicon.ico" sizes="any">
	<link rel="apple-touch-icon" href="<?= $wp_path?>/assets/favicon/apple-touch-icon-180x180.png">
	<link rel="icon" type="image/png" href="<?= $wp_path?>/assets/favicon/icon-192x192.png" sizes="192x192">
	<link rel="icon" type="image/png" href="<?= $wp_path?>/assets/favicon/icon-512x512.png" sizes="512x512">
	<!-- Google Tag Manager -->
	<script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
				new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
			j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
			'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
		})(window,document,'script','dataLayer','GTM-M2KLTQ7W');</script>
	<!-- End Google Tag Manager -->
	<!-- css -->
	<link rel="preconnect" href="https://fonts.googleapis.com">
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
	<link href="https://fonts.googleapis.com/css2?family=Barlow:wght@400;500;600;700&family=Zen+Kaku+Gothic+New:wght@400;500;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="<?= $wp_path?>/assets/css/app.css">
  <?php wp_head()?>
</head>
<body <?php body_class(); ?> data-page="<?php echo esc_attr(get_post_field('post_name', get_queried_object_id())); ?>">
<!-- Google Tag Manager (noscript) -->
<noscript><iframe src="https://www.googletagmanager.com/ns.html?id=GTM-M2KLTQ7W"
		height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>
<!-- End Google Tag Manager (noscript) -->
<div class="wrap">