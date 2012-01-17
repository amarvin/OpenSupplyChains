<?php
/* Copyright (C) Sourcemap 2011
 * This program is free software: you can redistribute it and/or modify it under the terms
 * of the GNU Affero General Public License as published by the Free Software Foundation,
 * either version 3 of the License, or (at your option) any later version.
 * 
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY;
 * without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
 * See the GNU Affero General Public License for more details.
 * 
 * You should have received a copy of the GNU Affero General Public License along with this
 * program. If not, see <http://www.gnu.org/licenses/>.*/ 
?>

<!doctype html>  
<html lang="en" class="no-js">
<head>

    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1">

    <base href="<?= URL::base(true, true) ?>" />
    <title>Admin :: <?= HTML::chars(isset($page_title) && $page_title ? $page_title : APPLONGNM) ?></title>

    <meta name="description" content="The open directory of supply chains and carbon footprints"/> 
    <meta name="keywords" content="carbon footprint, supply chain, life-cycle assessment, transparency, traceability, sustainable, green products" />
    <meta name="author" content="The Sourcemap Team">
    <meta http-equiv="Content-Type" content="text/html;charset=utf-8" > 
    <meta http-equiv="content-language" content="en-us">

    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    <link rel="shortcut icon" type="image/x-icon" href="assets/images/favicon.ico" />
    <link rel="apple-touch-icon" href="assets/images/favicon-large.png">
    <link rel="image_src" href="assets/images/favicon-large.png">
	<link rel="search" href="services/opensearch/" type="application/opensearchdescription+xml" title="Sourcemap.com" />

    <?= isset($styles) ? Sourcemap_CSS::link_tags($styles) : '' ?>
</head>
<body class="main admin">
    <?= View::factory('partial/header', array('page_title' => isset($page_title) ? $page_title : APPLONGNM)) ?>
    <div class="container">
        <div class="messages">
            <p><?= Message::instance()->get() ? Message::instance()->render() : false ?></p>
        </div>
    </div>
    <div id="admin-head" class="container">
        <p><?= Breadcrumbs::instance()->get() ? Breadcrumbs::instance()->render() : false ?></p>
        </div>
    </div>
    <div id="wrapper">

        <?= isset($content) ? $content : '<h2>There\'s nothing here.</h2>' ?>
        <div class="push"></div>
    </div><!-- #wrapper -->
    <div id="footer">
         <?= View::factory('partial/footer', array('page_title' => isset($page_title) ? $page_title : APPLONGNM)) ?>
    </div>
    
    <?= isset($scripts) ? Sourcemap_JS::script_tags($scripts) : Sourcemap_JS::script_tags('less', 'sourcemap-core') ?>
      
    <!--[if lt IE 7 ]>
        <script src="js/libs/dd_belatedpng.js"></script>
        <script> DD_belatedPNG.fix('img, .png_bg'); 
    <![endif]-->
</html>
