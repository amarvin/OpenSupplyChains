Sourcemap.Map.Editor = function(map, o) {
    var o = o || {}
    this.map = map.map ? map.map : map;
    if(map instanceof Sourcemap.Map.Base)
        this.map_view = map;
    Sourcemap.Configurable.call(this);
    this.instance_id = Sourcemap.instance_id("sourcemap-editor");
    this.map.editor = this;
}

Sourcemap.Map.Editor.prototype = new Sourcemap.Configurable();

Sourcemap.Map.Editor.prototype.defaults = {
    "trigger_events": true, "auto_init": true
}

Sourcemap.Map.Editor.prototype.broadcast = function() {
    Sourcemap.broadcast.apply(Sourcemap, arguments);
    return this;
}

Sourcemap.Map.Editor.prototype.init = function() {

    // stack for deferred save operations
    this.deferred_saves = [];
    
    // add symbol for 'connecting'
    if(!OpenLayers.Renderer.symbol.stareight)
        OpenLayers.Renderer.symbol.stareight = [
            0,9,
                3,5, 9,8, 5,3,
            9,0,
                3,-5, 9,-8, 5,-3,
            0,-9,
                -3,-5, -9,-8, -5,-3,
            -9,0,
                -3,5, -9,8, -5,3,
            0,9
        ];

    // listen for supplychain updates and save
    Sourcemap.listen('supplychain-updated', function(evt, sc, no_remap) {
        var succ = $.proxy(function() {
            this.map_view.updateStatus("Saved...", "good-news");            
        }, this);
        var fail = $.proxy(function() {
            this.map_view.updateStatus("Could not save! Contact support.", "bad-news");
        }, this);
        // redraw ?
        if(!no_remap) {
            this.map.mapSupplychain(sc.instance_id, true);
        }
        this.map_view.updateStatus("Saving...");
        Sourcemap.saveSupplychain(sc, {"supplychain_id": sc.remote_id, "success": succ, "failure": fail});

        // maintain visualization
        var viz = this.map_view.visualization_mode;
        if(viz) {
            this.map_view.visualization_mode = null;
            this.map_view.toggleVisualization(viz);
        }

    }, this);

    // listen for select clickout events, for connect-to, etc.
    Sourcemap.listen('map:feature_clickout', $.proxy(function(evt, map, ftr) {
        this.connect_from = false;
    }, this));

    Sourcemap.listen('map:feature_selected', $.proxy(function(evt, map, ftr) {
        if(this.connect_from) {
            var fromstid = this.connect_from.attributes.stop_instance_id;
            var tostid = ftr.attributes.stop_instance_id;
            if(fromstid == tostid) return;
            var sc = this.map.findSupplychain(ftr.attributes.supplychain_instance_id);
            var fromst = sc.findStop(fromstid);
            var tost = sc.findStop(tostid);
            var new_hop = fromst.makeHopTo(tost);
            sc.addHop(new_hop);
            this.map.mapHop(new_hop, sc.instance_id);
            this.connect_from = false;
            // @todo review if the selection of the hop is ideal
            this.connect_from = false;
            // if you want to uncomment this, figure out why it breaks things.
            //this.map.controls.select.select(this.map.hopFeature(new_hop));
            Sourcemap.broadcast('supplychain-updated', sc);
        } else if(ftr.attributes.hop_instance_id) {
            var ref = this.map.hopFeature(ftr.attributes.supplychain_instance_id, ftr.attributes.hop_instance_id);
            var supplychain = this.map.findSupplychain(ftr.attributes.supplychain_instance_id);
            this.showEdit(ftr);
        } else if(ftr.attributes.stop_instance_id) {
            var ref = this.map.stopFeature(ftr.attributes.supplychain_instance_id, ftr.attributes.stop_instance_id);
            var supplychain = this.map.findSupplychain(ftr.attributes.supplychain_instance_id);
            this.showEdit(ftr);
        }
        if(this.deferred_saves.length && supplychain instanceof Sourcemap.Supplychain) {
            this.deferred_saves = [];
            Sourcemap.broadcast('supplychain-updated', supplychain, true);
        }
    }, this));

    this.map.dockAdd('addstop', {
        "icon_url": "sites/default/assets/images/dock/add.png",
        "title": 'Add a Stop',
        "ordinal": 4,
        "panel": "edit",
        "callbacks": {
            "click": $.proxy(function() {
                this.map.controls.select.unselectAll();
                
                // make a suitable geometry
                var geometry = (new OpenLayers.Format.WKT()).write(
                    new OpenLayers.Feature.Vector(
                        new OpenLayers.Geometry.Point(this.map.map.center.lon, this.map.map.center.lat)
                    )
                );
                attributes = {};
                // make a new stop
                var new_stop = new Sourcemap.Stop(
                    geometry, attributes
                );
                // grab the first supplychain
                var sc = false;
                for(var k in this.map.supplychains) {
                    sc = this.map.supplychains[k];
                    break;
                }
                // add a stop to the supplychain object
                sc.addStop(new_stop);
                this.map.mapSupplychain(sc.instance_id);                
                
                var cb = $.proxy(function(data) {
                    if(data && data.results) {
                        this.stop.setAttr("address", data.results[0].placename);
                        
                        this.stop.attributes.stop_instance_id = this.stop.instance_id;
                        this.stop.attributes.supplychain_instance_id = this.stop.supplychain_id;
                        this.map.controls.select.select(this.map.stopFeature(sc.instance_id, this.stop.instance_id));
                        
     
                    }
                }, {"stop":new_stop, "map":this.map, "sc":sc});
                                
                Sourcemap.Stop.geocode(new_stop, cb);
                
   
            }, this)
        }
    });

    // save contents of editor ui on dialog close
    Sourcemap.listen('sourcemap-base-dialog-close', $.proxy(function(b, vs) {
        if(this.editing) {
            // save updated attributes
            var f = this.map_view.dialog_content.find('form');
            var valsa = f.serializeArray();
            var vals = {};
            for(var i=0; i<valsa.length; i++) {
                vals[valsa[i].name] = valsa[i].value;
            }
            this.updateFeature(this.editing, vals, true);
        }
        this.editing = null;
    }, this));
    
    // set up drag control
    var stopl = false;
    for(var k in this.map.supplychains) {
        stopl = this.map.getStopLayer(k);
        break;
    }

    var scid = k;

    this.map.addControl('stopdrag', new OpenLayers.Control.DragFeature(stopl, {
        "onStart": $.proxy(function(ftr, px) {
            if(ftr.cluster) this.map.controls.stopdrag.cancel();
        }, this),
        "onDrag": $.proxy(function(ftr, px) {
            if(this.map.map.getMaxExtent().containsLonLat(this.map.map.getLonLatFromPixel(px)))
                this.moveStopToFeatureLoc(ftr, false, false);
            else this.map.controls.stopdrag.cancel();
        }, this),
        "onComplete": $.proxy(function(ftr, px) {
            if(ftr.attributes.stop_instance_id) {
                this.editor.moveStopToFeatureLoc(ftr, true, true);
                this.editor.syncStopHops(ftr.attributes.supplychain_instance_id, ftr.attributes.stop_instance_id);
            }
        }, {"editor": this})
    }));

    this.map.controls.stopdrag.handlers.drag.stopDown = false;
    this.map.controls.stopdrag.handlers.drag.stopUp = false;
    this.map.controls.stopdrag.handlers.drag.stopClick = false;

    this.map.controls.stopdrag.handlers.feature.stopDown = false;
    this.map.controls.stopdrag.handlers.feature.stopUp = false;
    this.map.controls.stopdrag.handlers.feature.stopClick = false;

    this.map.controls.stopdrag.activate();
    
    // load transport catalog
    this.loadTransportCatalog();

	// setup calculator display
	$("#impact-use-co2e").change($.proxy(function(evt) {
		var co2e = $(evt.target).is(':checked') ? true : false;
		
        // grab the first supplychain
        var sc = false;
        for(var k in this.map.supplychains) {
            sc = this.map.supplychains[k];
            break;
        }
		
		if(co2e) { 
			sc.attributes["sm:ui:co2e"] = sc.attributes["sm:ui:weight"] = true; 
			$("#impact-use-weight").attr("checked", "checked");
		} 
		else { delete sc.attributes["sm:ui:co2e"]; }
		
		this.map_view.updateFilterDisplay(sc);
		Sourcemap.broadcast('supplychain-updated', sc);
	}, this));
	$("#impact-use-weight").change($.proxy(function(evt) {
		var weight = $('#evt.target').is(':checked') ? true : false;
        // grab the first supplychain
        var sc = false;
        for(var k in this.map.supplychains) {
            sc = this.map.supplychains[k];
            break;
        }
		
		if(weight) { sc.attributes["sm:ui:weight"] = true } 
		else { delete sc.attributes["sm:ui:weight"]; }
		
		this.map_view.updateFilterDisplay(sc);
		Sourcemap.broadcast('supplychain-updated', sc);
	}, this));
	$("#impact-use-water").change($.proxy(function(evt) {
		var water = $('#evt.target').is(':checked') ? true : false;
        // grab the first supplychain
        var sc = false;
        for(var k in this.map.supplychains) {
            sc = this.map.supplychains[k];
            break;
        }

		if(water) { 
			sc.attributes["sm:ui:water"] = sc.attributes["sm:ui:weight"] = true; 
			$("#impact-use-weight").attr("checked", "checked");
		} 
		else { delete sc.attributes["sm:ui:water"]; }

		this.map_view.updateFilterDisplay(sc);
		Sourcemap.broadcast('supplychain-updated', sc);
	}, this));
}

Sourcemap.Map.Editor.prototype.loadTransportCatalog = function() {
    var o = {
        "url": "services/catalogs/osi", "type": "get",
        "data": {"category": "transportation"},
        "success": $.proxy(function(data) { 
            this.transport_catalog = data.results;
            
            // build select element for editor pane
            this.transport_catalog_el = document.createElement('select');
            $(this.transport_catalog_el).addClass('transport-catalog');
            for (k in data.results){
                option = "<option>" + data.results[k].name + "</option>";
                $(this.transport_catalog_el).append(
                    $(option).attr("value",data.results[k].co2e)
                );
            }
        }, this)
    };
    $.ajax(o);
    return this;
}

Sourcemap.Map.Editor.prototype.moveStopToFeatureLoc = function(ftr, geocode, trigger_events) {
    var scid = ftr.attributes.supplychain_instance_id;
    var stid = ftr.attributes.stop_instance_id;
    var st = this.map.findSupplychain(scid).findStop(stid);
    st.geometry = (new OpenLayers.Format.WKT()).write(ftr);
    var ll = new OpenLayers.LonLat(ftr.geometry.x, ftr.geometry.y)
    ll = ll.clone();
    ll.transform(new OpenLayers.Projection('EPSG:900913'), new OpenLayers.Projection('EPSG:4326'));
    if(geocode) {
        this.map_view.updateStatus("Moved stop '"+st.getLabel()+'"..."');
        Sourcemap.Stop.geocode(ll, $.proxy(function(data) {
            if(data && data.results && data.results.length) {
                this.editor.map_view.updateStatus("Updated address...");
                this.stop.setAttr("address", data.results[0].placename);
            }
        }, {"stop": st, "editor": this, "trigger_events": trigger_events}));
    } 
    if(trigger_events) {
        Sourcemap.broadcast('supplychain-updated', 
            this.map.findSupplychain(st.supplychain_id)
        );
    }
}

Sourcemap.Map.Editor.prototype.syncStopHops = function(sc, st) {
    if(!(sc instanceof Sourcemap.Supplychain))
        sc = this.map.findSupplychain(sc);
    if(!(st instanceof Sourcemap.Stop))
        st = sc.findStop(st);
    var stophops = sc.stopHops(st);
    var fs = [];
    // inbound hops
    for(var i=0; i<stophops["in"].length; i++) {
        var h = sc.findHop(stophops["in"][i]);
        var fromst = sc.findStop(h.from_stop_id);
        var tost = st;
        var tmph = fromst.makeHopTo(tost);
        h.attributes.distance = h.gc_distance();
        h.geometry = tmph.geometry;
    }
    // outbound hops
    for(var i=0; i<stophops.out.length; i++) {
        var h = sc.findHop(stophops.out[i]);
        var fromst = st;
        var tost = sc.findStop(h.to_stop_id);
        var tmph = fromst.makeHopTo(tost);
        h.attributes.distance = h.gc_distance();
        h.geometry = tmph.geometry;
    }
    // both
}

Sourcemap.Map.Editor.prototype.showEdit = function(ftr, attr) {
    var ref = ftr.attributes.ref;
     
    var reftype = ref instanceof Sourcemap.Hop ? 'hop' : 'stop';
    var attr = attr ? Sourcemap.deep_clone(attr) : {};
    for(var k in ref.attributes) {
        if(attr[k] == undefined) attr[k] = ref.getAttr(k);
    }
    var s = {"ref": ref, "editor": this, "attr": attr, "feature": ftr};
    var cb = function(p, tx, th) {
        this.editor.map_view.showDialog(th);
        this.editor.prepEdit(this.ref, this.attr, this.feature);
    }
    Sourcemap.template('map/edit/edit-'+reftype, cb, s, s);
}

Sourcemap.Map.Editor.prototype.prepEdit = function(ref, attr, ftr) {

    // track currently edited feature
    this.editing = ref;

    // init editor tabs
    $("#editor-tabs").tabs();

    // load catalog button
    $(this.map_view.dialog).find('.load-catalog-button').click($.proxy(function() {
        this.q = '';
        this.params = {"name": ''};
        this.showCatalog(this);
    }, this));

    $(this.map_view.dialog).find('input,select,textarea').bind('change', $.proxy(function(e) {
        var kvpairs = $(this.editor.map_view.dialog).find('form').serializeArray();
        var vals = {};
        for(var i=0; i<kvpairs.length; i++) vals[kvpairs[i].name] = kvpairs[i].value;
        this.editor.updateFeature(ref, vals);
    }, {"ref": ref, "editor": this}));

    if(ref instanceof Sourcemap.Stop) {
        // load impact calculator for stops
        $("#edit-stop-footprint input").keyup($.proxy(function(e){ 
            // update calculation
            editor = $('#edit-stop-footprint');
            var quantity = editor.find('input[name="qty"]').val(); 
            //var unit     = editor.find('input[name="unit"]').val(); 
            var unit     = 'kg';
            var factor   = editor.find('input[name="co2e"]').val(); 

            if (!isNaN(quantity && factor)){ 
                var output = quantity * factor; 
                var scaled = Sourcemap.Units.scale_unit_value(output, unit, 2);
                editor.find('.result').text(scaled.value + " " + scaled.unit + " CO2e"); 
            }
        }, this)); 
        
        // trigger event on load
        $("#edit-stop-footprint input").trigger('keyup');
    } else {
        // load impact calculator for hops
        $("#edit-hop-footprint input").keyup($.proxy(function(e){ 
            // update calculation
            editor = $('#edit-hop-footprint');
            var weight   = editor.find('input[name="qty"]').val();
            var distance = editor.find('input[name="distance"]').val(); 
            var factor   = editor.find('input[name="co2e"]').val(); 
            var unit     = 'kg';

            // drop in the transporation select box 
            $('#edit-hop-footprint #transportation-select').append( 
                $(this.transport_catalog_el).change(function(){ 
                    $('#edit-hop-footprint input[name="co2e"]') 
                    .val($(this + ':selected').val());
                    console.log($(this).parent()); 
                    console.log('alex? thought you were on this.');
                })
            );  

            if (!isNaN(weight && distance && factor)){ 
                var output = weight * distance * factor;
                var scaled = Sourcemap.Units.scale_unit_value(output, unit, 2);
                editor.find('.result').text(scaled.value + " " + scaled.unit + " CO2e"); 
            }
        }, this)); 
        $("#edit-hop-footprint input").trigger('keyup');
        
        // trigger event on load
        $("#edit-stop-footprint input").trigger('keyup');
    }

    var s = {"ref": ref, "editor": this, "attr": attr, "feature": ftr};

    // bind click event to connect button
    $(this.map_view.dialog).find('.connect-button').click($.proxy(function(e) {
        this.editor.map_view.hideDialog();
        this.feature.renderIntent = "connecting";
        var sl = this.editor.map.getStopLayer(this.feature.attributes.supplychain_instance_id);
        sl.drawFeature(this.feature);
        this.editor.connect_from = this.feature;
    }, s));
    
    // delete button
    $(this.map_view.dialog).find('.delete-button').click($.proxy(function(e) {
        var supplychain = this.editor.map.findSupplychain(this.ref.supplychain_id);
        if(this.ref instanceof Sourcemap.Stop) {
            supplychain.removeStop(this.ref);
        } else if(this.ref instanceof Sourcemap.Hop) {
            supplychain.removeHop(this.ref);
        }
        this.editor.map_view.hideDialog(true);
        Sourcemap.broadcast('supplychain-updated', supplychain);
    }, s));

    var cb = function(e) {

        // Edit should be disabled at this point
        // todo: maybe move this down and add a spinner
        // or disable the map/editor?
        //this.editor.map_view.hideDialog();            
        
    }

    //$(this.map_view.dialog).find('.close').click($.proxy(cb, s));
}

Sourcemap.Map.Editor.prototype.updateFeature = function(ref, updated_vals, defer_save) {
    var geocoding = false;
    var vals = updated_vals || {};
    var defer = defer_save;
    for(var k in vals) {
        var val = vals[k];
        if((ref instanceof Sourcemap.Stop) && k === "address" && (val != ref.getAttr("address", false))) {
            ref.setAttr(k, val);
            // if address is set, move the stop.
            geocoding = true;
            Sourcemap.Stop.geocode(ref.getAttr("address"), $.proxy(function(res) {
                var pl = res && res.results ? res.results[0] : false;
                if(pl) {
                    this.stop.setAttr("address", pl.placename);
                    var new_geom = new OpenLayers.Geometry.Point(pl.lon, pl.lat);
                    new_geom = new_geom.transform(
                        new OpenLayers.Projection('EPSG:4326'),
                        new OpenLayers.Projection('EPSG:900913')
                    );
                    this.stop.geometry = (new OpenLayers.Format.WKT()).write(new OpenLayers.Feature.Vector(new_geom));
                    var scid = this.stop.supplychain_id;
                    this.editor.map_view.updateStatus("Moved stop to '"+pl.placename+"'...", "good-news");
                } else {
                    $(this.edit_form).find('input,textarea,select').removeAttr("disabled");
                    this.editor.map_view.updateStatus("Could not geocode...", "bad-news");
                }
  
                if(this.ref) {
                    this.ref.setAttr(k, val);
                }
                //this.editor.map.broadcast('supplychain-updated', this.editor.map.supplychains[this.stop.supplychain_id]);
                if(defer) {
                    this.editor.deferred_saves.push(this.editor.map.supplychains[this.stop.supplychain_id]);
                } else {
                    this.editor.map.broadcast('supplychain-updated', this.editor.map.supplychains[this.stop.supplychain_id]);
                }
            }, {"stop": ref, "editor": this}));
        } else {
            ref.setAttr(k, val);
        }
    }
    if(!geocoding) {
        // for just-deleted stops
        if(defer) {
            this.deferred_saves.push(this.map.supplychains[ref.supplychain_id]);
        } else if(ref && ref.supplychain_id) {
            this.map.broadcast('supplychain-updated', this.map.supplychains[ref.supplychain_id]);
        }
    }
}

Sourcemap.Map.Editor.prototype.updateCatalogListing = function(o) {
    if(!this.catalog_search_xhr) this.catalog_search_xhr = {};
    if(this.catalog_search_xhr[o.catalog]) this.catalog_search_xhr[o.catalog].abort();
    this.catalog_search_xhr[o.catalog] = $.ajax({"url": "services/catalogs/"+o.catalog, "data": o.params || {}, 
        "success": $.proxy(function(json) {
            var cat_html = $('<ul class="catalog-items"></ul>');
            var alt = "";
            for(var i=0; i<json.results.length; i++) {
                // Todo: Template this
                var cat_content = '<div class="cat-item-name">'+json.results[i].name+'</div>';
                
                cat_content += '<div class="cat-item-footprints">'                    
                cat_content += 
                    json.results[i].co2e ? '<div class="cat-item-co2e">' +json.results[i].co2e+'</div>' : '';
                cat_content += 
                    json.results[i].energy ? '<div class="cat-item-energy">' +json.results[i].energy+'</div>' : '';
                cat_content += 
                    json.results[i].waste ? '<div class="cat-item-waste">' +json.results[i].waste+'</div>' : '';
                cat_content += 
                    json.results[i].water ? '<div class="cat-item-water">' +json.results[i].water+'</div>' : '';
                cat_content += '<div class="clear"></div></div>';                    
                
                var new_li = $('<li class="catalog-item"></li>').html(cat_content);                   
                
                $(new_li).click($.proxy(function(evt) {
                    this.editor.applyCatalogItem(this.catalog, this.item, this.ref);
                }, {"item": json.results[i], "editor": this.editor, "ref": o.ref, "catalog": o.catalog}));
                cat_html.append(new_li);
            }
            o.results = json.results;
            o.params = json.parameters;
            $(this.editor.map_view.dialog).find('.catalog-content').html(cat_html);

            $("#catalog-close").click($.proxy(function(e) {
                // @todo return to hop
                var ftr = this.editor.map.findFeaturesForStop(this.editor.editing.supplychain_id,this.editor.editing.instance_id);
                ftr.attributes = {}; ftr.attributes.ref = this.editor.editing;
                this.editor.showEdit(ftr, this.editor.editing.attributes);
            }, {"o": this.o, "editor": this.editor}));
            $(this.editor.map_view.dialog).find('.catalog-pager').empty();
            // pager prev
            if(o.params.o > 0) {
                var prev_link = $('<span class="catalog-pager-prev">&laquo; prev</span>').click($.proxy(function() {
                    var o = {};
                    o.editor = this;
                    o.ref = this.ref;
                    o.params = Sourcemap.deep_clone(this.o.params);
                    o.params.o = (parseInt(o.params.o) || 0);
                    if(o.params.o >= o.params.l) o.params.o -= o.params.l;
                    o.params.l = o.params.l;
                    o.catalog = this.o.catalog;
                    this.editor.updateCatalogListing(o);
                }, {"o": o, "editor": this}));
                $(this.editor.map_view.dialog).find('.catalog-pager').append(prev_link);
            }

            // pager next
            if(o.results.length == o.params.l) {
                var next_link = $('<span class="catalog-pager-next">next &raquo;</span>').click($.proxy(function() {
                    var o = {};
                    o.editor = this.editor;
                    o.ref = this.o.ref;
                    o.params = Sourcemap.deep_clone(this.o.params);
                    o.params.o = (parseInt(o.params.o) || 0) + o.params.l;
                    o.catalog = this.o.catalog;
                    this.editor.updateCatalogListing(o);
                }, {"o": o, "editor": this.editor}));
                $(this.editor.map_view.dialog).find('.catalog-pager').append(next_link);
            }

            // search bar
            $(this.editor.map_view.dialog).find('#catalog-search-field').keyup($.proxy(function(evt) {
                if($(evt.target).val().length < 3) return;
                var q = $(evt.target).val();
                var o = {};
                o.editor = this.editor;
                o.ref = this.o.ref;
                o.params = Sourcemap.deep_clone(this.o.params);
                o.params.o = 0;
                o.params.q = q;
                o.catalog = this.o.catalog;
                this.editor.updateCatalogListing(o);
            }, {"o": o, "editor": this.editor}));
        }, {"editor": this, "o": o}), "failure": $.proxy(function() {
            this.map_view.showDialog('<h3 class="bad-news">The catalog is currently unavailable.</h3>');
        }, this)
    });
}

Sourcemap.Map.Editor.prototype.showCatalog = function(o) {
    var o = o || {};
    o.q = o.q ? o.q : '';
    o.catalog = o.catalog ? o.catalog : "osi";
    var tscope = {"editor": this, "o": o, "ref": o.ref};
    Sourcemap.template('map/edit/catalog', function(p, txt, th) {        
        this.editor.map_view.showDialog(th);  
        this.editor.updateCatalogListing(this.o);
    }, tscope, tscope);
}

Sourcemap.Map.Editor.prototype.applyCatalogItem = function(cat, item, ref) {
    // @todo add the unit
    var catalog_map = {
        "osi": {
            "name": ["title", "name"],
            "co2e": true,
            "waste": true,
            "water": true,
            "energy": true
        }
    }
    var attr = {};
    for(var k in item) {
        if(catalog_map[cat] && catalog_map[cat][k]) {
            if(catalog_map[cat][k] instanceof Array) {
                var map_to = catalog_map[cat][k];
                for(var i=0; i<map_to.length; i++) {
                    attr[map_to[i]] = item[k];
                }
            } else if(catalog_map[cat][k] instanceof Function) {
                var map_with = catalog_map[cat][k];
                map_with(ref, attr);
            } else if(catalog_map[cat][k]) attr[k] = item[k];
        }
    }
    for(var k in attr) ref.attributes[k] = attr[k];
    var ftr = this.map.stop_features[ref.supplychain_id][ref.instance_id];
    ftr.attributes = {}; ftr.attributes.ref = ref;
    this.showEdit(ftr, attr);
}
