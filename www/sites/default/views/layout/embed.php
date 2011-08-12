<!doctype html>  
<html lang="en" class="no-js">
<head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1">

    <base href="<?= URL::base(true, true) ?>" />
    <title><?= HTML::chars(isset($page_title) && $page_title ? $page_title : APPLONGNM) ?></title>

	<meta name="description" content="Sourcemap is a crowd-sourced directory of product supply chains and carbon footprints." /> 
	<meta name="keywords" content="carbon footprint, supply chain, life-cycle assessment, transparency, traceability, sustainable, green products" />
    <meta name="author" content="The Sourcemap Team">
	<meta http-equiv="Content-Type" content="text/html;charset=utf-8" > 
	<meta http-equiv="content-language" content="en-us">
	
    <meta name="viewport" content="width=device-width,initial-scale=1,user-scalable=no" />
    <meta name="apple-mobile-web-app-capable" content="yes" />
    
    <link rel="shortcut icon" type="image/x-icon" href="assets/images/favicon.ico" />
    <link rel="apple-touch-icon" href="assets/images/favicon-large.png">
    <link rel="image_src" href="assets/images/favicon-large.png">

    <?= isset($styles) ? Sourcemap_CSS::link_tags($styles) : '' ?>    
</head>

<body id="embedded-supplychain">
<?= $content ?>


    <?= isset($scripts) ? Sourcemap_JS::script_tags($scripts) : '' ?>

    <!--[if lt IE 7 ]>
    <script src="js/libs/dd_belatedpng.js"></script>
    <script> DD_belatedPNG.fix('img, .png_bg'); 
    <![endif]-->
  
    <script>
        Sourcemap.embed_supplychain_id = <?= isset($supplychain_id) ? $supplychain_id : '"null"' ?>;
        Sourcemap.embed_params = <?= isset($embed_params) ? json_encode($embed_params) : '{}' ?>;
    </script>
</body>
</html>
