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

<?php // TEMPORARY MOBILE VIEW TO MAKE OFFICE DEPOT HAPPY ?>

<?php if (isset($supplychain_banner_url) && $supplychain_banner_url): ?>
<div class="container mobile">
    <div class="channel-banner">
       <img src="<?= $supplychain_banner_url?>"/>
    </div>
    <div class="clear" style="height: 20px"></div>
</div><!-- .container.mobile -->
<?php endif; ?>

<div class="container mobile">
    <h1><?= HTML::chars($supplychain_name) ?></h1>
    
    <?php if (isset($supplychain_youtube_id)): ?>
    <div class="description-video">
        <iframe class="youtube-player" type="text/html" width="220" height="150" src="http://www.youtube.com/embed/<?= $supplychain_youtube_id ?>&showinfo=0" frameborder="0"></iframe> 
    </div>
    <?php endif; ?>

    <div class="mobile-map-preview">
        <img src="/static/<?= $supplychain_id ?>.l.png"/>
	    <div class="mobile-footer"><a href="/"><img src="assets/images/mobile/logo.png" /></a></div>

    </div>

    <p class="description"><?= HTML::chars($supplychain_desc) ?></p>
  	
	<a href="/embed/<?= $supplychain_id ?>" class="full-site-button">View on Full Site</a>

    <div class="clear"></div>
</div><!-- .container.mobile -->
