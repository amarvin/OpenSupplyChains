$(document).ready(function() {
    // reset template path to site-specific location
    Sourcemap.TPL_PATH = "sites/default/assets/scripts/tpl/";

    Sourcemap.embed_stop_details = function(stop, sc) {
        // load stop details template and show in embed dialog
    }

    Sourcemap.embed_hop_details = function(hop, sc) {
        // load hop details template and show in embed dialog
    }

    // initialize new map
    Sourcemap.map_instance = new Sourcemap.Map('sourcemap-map-embed', {
        "prep_popup": function(ref, ftr, pop) {
            var t = ['popup'];
            var tscope = {"popup": pop, "feature": ftr};
            if(ref instanceof Sourcemap.Stop) {
                t.push('stop');
                tscope.stop = ref;
            } else if(ref instanceof Sourcemap.Hop) {
                t.push('hop');
                tscope.hop = ref;
            }
            Sourcemap.template('embed/'+t.join('-'), $.proxy(function(p, tx, th) {
                $(this.popup.contentDiv).html(th);
                this.popup.updateSize();
                this.popup.updatePosition();
            }, tscope), tscope);
        }
    });

    // get scid from inline script
    var scid = Sourcemap.embed_supplychain_id;

    // fetch supplychain
    Sourcemap.loadSupplychain(scid, function(sc) {
        Sourcemap.map_instance.addSupplychain(sc);
    });

    // wait for map to load, then add dressing
    $(document).bind('map:supplychain_mapped', function(evt, map) {
        // die quietly if map fails
        if(map !== Sourcemap.map_instance)
            return;

        // tour?
        if(Sourcemap.embed_params && Sourcemap.embed_params.tour) {
            // build list of features for tour
            var features = [];
            for(var k in map.supplychains) {
                var sc = map.supplychains[k];
                var g = new Sourcemap.Supplychain.Graph(map.supplychains[k]);
                var order = g.depthFirstOrder();
                order = order.concat(g.islands());
                for(var i=0; i<order.length; i++)
                    features.push(map.mapped_features[order[i]]);
            }
            
            // initialize tour
            Sourcemap.map_tour = new Sourcemap.MapTour(Sourcemap.map_instance, {
                "features": features, "wait_interval": Sourcemap.embed_params.tour_start_delay,
                "interval": Sourcemap.embed_params.tour_interval
            });
        } else {
            // no tour
            Sourcemap.map_tour = false;
        }
        // the line below has to be here because, otherwise,
        // openlayers doesn't properly position the popup in webkit (chrome)
        Sourcemap.map_instance.map.zoomIn();

        // zoom to bounds of stops layer
        Sourcemap.map_instance.map.zoomToExtent(
            Sourcemap.map_instance.getStopLayer(sc.instance_id).getDataExtent()
        );

        // set up banner overlay. todo: make this optional.
        var overlay = $('<div class="sourcemap-embed-overlay" id="map-overlay"></div>');
        overlay.css({
            "position": "absolute", "top": 0, "left": 0, "z-index": 1000
        });
        Sourcemap.map_overlay = overlay;
        $(Sourcemap.map_instance.map.div).css("position", "relative");
        $(Sourcemap.map_instance.map.div).append(overlay);
        Sourcemap.template('embed/overlay/supplychain', function(p, tx, th) {
            $(Sourcemap.map_overlay).html(th);
        }, sc);

        // make and place custom zoom controls
        var ze = new OpenLayers.Control.ZoomToMaxExtent({"title": "zoom all the way out"});
        var zi = new OpenLayers.Control.ZoomIn({"title": "zoom in"});
        var zo = new OpenLayers.Control.ZoomOut({"title": "zoom out"});
        $(zo.div).text("-");
        $(zi.div).text("+");
        $(ze.div).text("0");
        var cpanel = new OpenLayers.Control.Panel({"defaultControl": ze});
        cpanel.addControls([zo, ze, zi]);
        Sourcemap.map_instance.map.addControl(cpanel);

        // pause tour on click
        Sourcemap.map_instance.map.events.register('click', Sourcemap.map_instance, function() {
            if(Sourcemap.map_tour) Sourcemap.map_tour.wait();
        });

        // set body font-size to a constant(ish) factor based on doc width
        $(document.body).css("font-size", Math.floor(document.body.clientWidth / 60)+"px");

        // set up dialog
        Sourcemap.map_dialog = $('<div id="embed-dialog" class="map-dialog"><H2>HELLO</H2></div>');
        $(document.body).append(Sourcemap.map_dialog);
        $(Sourcemap.map_dialog).data("state", 1);
        Sourcemap.embed_dialog_show = function(mkup) {
            if(mkup) $(Sourcemap.map_dialog).html(mkup);
            $(Sourcemap.map_dialog).show().data("state", 1);
        }
        Sourcemap.embed_dialog_hide = function() {
            $(Sourcemap.map_dialog).hide().data("state", 0);
        }
        Sourcemap.embed_dialog_show();
        Sourcemap.embed_dialog_hide();
    });
});
