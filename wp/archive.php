<?php
global $wp_path;
global $site_url;
$page_type = 'single';
?>
<?php
get_template_part('./include/head');
get_template_part('./include/header');
$slug = $_GET['cat'];
$taxonomy = 'product-category';
$term = get_term_by('slug', $slug, $taxonomy);
$term_id = $term -> term_id;
?>
<main class="p-column"></main>
<aside class="l-sideNav"></aside>

<?php
get_template_part('./include/footer');
?>
