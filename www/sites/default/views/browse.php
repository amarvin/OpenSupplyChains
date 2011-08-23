<?php if($taxonomy): ?>
<div id="category-list">
    <div class="container">
            <div id="category-list-content">
                <a href="browse/">Everything &nbsp;</a>
                <?php for($i=0; $i<count($taxonomy->children); $i++): ?>
                <?php $t = $taxonomy->children[$i]; ?>
                <a href="browse/<?= Sourcemap_Taxonomy::slugify($t->data->name) ?>"<?php if(count($taxonomy->children)-1 == $i): ?> class="last"<?php endif;?>><?= HTML::chars($t->data->title) ?></a>
                <?php endfor; ?>
        	</div>
            <div class="clear"></div>
    </div>
</div>
<?php endif; ?>
<div class="clear"></div>

<div id="browse-featured" class="container">
    <div>
        <?php if($category): ?>
           <h2>Browsing category "<?= HTML::chars($category->title) ?>"</h2>
        <?php else: ?>
            <h2>Viewing all categories</h2>
        <?php endif; ?>
    </div>
    <div>
    <?= $pager ?><br />
    </div>
    <?= View::factory('partial/thumbs/featured', array('supplychains' => $primary->results)) ?>
</div><!-- .container -->

<div class="clear"></div>
<ul id="browse-list" class="container">
    <li>
        <h2>Interesting:</h2>
        <?= View::factory('partial/thumbs/featured-vertical', array('supplychains' => $interesting->results)) ?>
    </li>
    
    <li>
        <h2>New:</h2>
        <?= View::factory('partial/thumbs/featured-vertical', array('supplychains' => $recent->results)) ?>
    </li>
    
    <li>
        <h2>Starred:</h2>
        <?= View::factory('partial/thumbs/featured-vertical', array('supplychains' => $favorited)) ?>
    </li>
    
    <li>
        <h2>Discussed:</h2>
        <?= View::factory('partial/thumbs/featured-vertical', array('supplychains' => $discussed)) ?>
    </li>
	<div class="clear"></div>
</ul><!-- .container -->
