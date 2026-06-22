<?php
global $wp_path;
global $site_url;
?>

<meta name="keywords" content="">
<meta name="description" content="<?php bloginfo('description'); ?>">
<!-- OGP -->
<meta property="og:title" content="<?php bloginfo('title'); ?>">
<meta property="og:type" content="website">
<meta property="og:url" content="<?= $site_url?>">
<meta property="og:site_name" content="<?php bloginfo('title'); ?>">
<meta property="og:description" content="<?php bloginfo('description'); ?>"/>
<meta property="og:image" content="<?= $wp_path?>/assets/img/common/ogp.jpg">