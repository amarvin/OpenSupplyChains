<?php if($taxonomy): ?>
<div class="container_16">
    Categories: 
    <?php $tstack = array($taxonomy); ?>
    <?php while($t = array_shift($tstack)): ?>
        <?php for($i=0; $i<count($t->children); $i++) array_unshift($tstack, $t->children[$i]); ?>
        <?php if($t === $taxonomy) continue; ?>
        <a href="browse/<?= Sourcemap_Taxonomy::slugify($t->data->name) ?>"><?= HTML::chars($t->data->title) ?></a>
        <?php if(count($tstack)): ?>&nbsp;<?php endif; ?>
    <?php endwhile; ?>
</div>
<?php endif; ?>
<div class="clear"></div>
<div id="browse-featured" class="container_16">
    <div class="grid_16">
        <?php if($category): ?>
           <h2>Browsing category "<?= HTML::chars($category->title) ?>"</h2>
        <?php else: ?>
            <h2>Viewing all categories</h2>
        <?php endif; ?>
    </div>
    <?= View::factory('partial/thumbs/featured', array('supplychains' => $primary->results)) ?>
</div><!-- .container -->

<div class="clear"></div>
<div id="browse-list" class="container_16">
    <div class="grid_4">
        <h2>Interesting:</h2>
        <?= View::factory('partial/thumbs/featured-vertical', array('supplychains' => $recent->results)) ?>
    </div>
    
    <div class="grid_4">
        <h2>New:</h2>
        <?= View::factory('partial/thumbs/featured-vertical', array('supplychains' => $recent->results)) ?>
    </div>
    
    <div class="grid_4">
        <h2>Starred:</h2>
        <?= View::factory('partial/thumbs/featured-vertical', array('supplychains' => $favorited)) ?>
    </div>
    
    <div class="grid_4">
        <h2>Discussed:</h2>
        <?= View::factory('partial/thumbs/featured-vertical', array('supplychains' => $discussed)) ?>
    </div>
</div><!-- .container -->
