<?php if(isset($supplychain) && $supplychain): ?>
        <div class="map-item">
            <a href="map/view/<?= $supplychain->id ?>">
                <img class="user-map-preview" src="map/static/<?= $supplychain->id ?>.m.png" />
            </a>
        </div>
        <div class="map-description">
            <a href="map/view/<?= $supplychain->id ?>">
                <h2 class="map-title"><?= isset($supplychain->attributes->title) ? HTML::chars($supplychain->attributes->title) : "An Unnamed Sourcemap" ?></h2>
            </a>
            <h4 class="map-details">
                Created <?= date('F j, Y', $supplychain->created) ?>.
            </h4>
            <div class="clear"></div>
            
            <?php if(isset($supplychain->attributes->teaser) && $supplychain->attributes->teaser): ?>
                <span class="map-teaser"><?= HTML::chars($supplychain->attributes->teaser) ?></span>
            <?php elseif(isset($supplychain->attributes->description) && $supplychain->attributes->description): ?>
                <span class="map-teaser"><?= HTML::chars($supplychain->attributes->description) ?></span>
            <?php else: ?>
                <span class="map-teaser">(No description yet)</span>
            <?php endif; ?>
            
            <?php if(isset($supplychain->owner->name) && $supplychain->owner->name): ?>
            <?php endif; ?>

            <?php if($supplychain->other_perms & Sourcemap::READ): ?>
            <?php else: ?>
                <h4 class="map-details bad-news">(private)</h4>
            <?php endif; ?>
        </div>
        <div class="map-controls">
            <?php $public = ($supplychain->other_perms & Sourcemap::READ) > 0; ?>
            <div class="map-controls-publish">
                <input id="map-publish-checkbox" type="checkbox" name="publish" onclick="window.location='edit/visibility/<?= $supplychain->id ?>?publish=<?= $public ? "no" : "yes"?>'; return true;"<?= $public ? "checked" : "" ?>/>
                <a id="map-publish-link" href="edit/visibility/<?= $supplychain->id ?>?publish=<?= $public ? "no" : "yes"?>"><?= $public ? "Unpublish" : "Publish" ?></a>
            </div>
            <div class="map-controls-edit">
                <a href="edit/<?= $supplychain->id ?>">Edit</a>
            </div>
        </div>
        <div class="clear"></div>
<?php endif; ?>
