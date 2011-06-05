$(document).ready(function() {

    Sourcemap.map_instance = new Sourcemap.Map('sourcemap-map-view');
    var scid = supplychain_id;
    Sourcemap.loadSupplychain(scid, function(sc) {
        if(sc.editable) Sourcemap.log("Supplychain "+sc.remote_id+" is editable.");
        Sourcemap.map_instance.addSupplychain(sc);
    });


    //Sourcemap.template('map/view/place', function(tpl, txt, loader) { console.log('loaded template: '+tpl); });
});
