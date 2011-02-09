Sourcemap.TabbedEditor = function(el, sc, o) {
    this.id = Sourcemap.instance_id('tabbed-editor');
    this.container = $(el).get(0);
    this.supplychain = sc;
    Sourcemap.Configurable.call(this, o);
}

Sourcemap.TabbedEditor.prototype.defaults = {
    "auto_init": true
};

Sourcemap.TabbedEditor.prototype.init = function() {
    //todo: preview link/button
    var tabsul = $(
        '<ul><li><a href="#'+this.id+'-sc">Supplychain</a></li>'+
        '<li><a href="#'+this.id+'-stops">Stops</a></li>'+
        '<li><a href="#'+this.id+'-hops">Hops</a></li></ul>'
    );
    var tabels = $(
        '<div id="'+this.id+'-sc"><h3>Supplychain Details</h3></div>'+
        '<div id="'+this.id+'-stops"><h3>Stops</h3></div>'+
        '<div id="'+this.id+'-hops"><h3>Hops</h3></div>'
    );
    var dialogel = $(
        '<div id="'+this.id+'-dialog"></div>'
    );
    $(this.container).append(tabsul);
    $(this.container).append(tabels);
    $(this.container).after(dialogel);
    $(dialogel).dialog({"modal": true, "buttons": {
        "Save": function() {
            $(this).dialog("close");
        }
    }});
    $(this.container).tabs();
    this.update();
    this.editStop();
}

Sourcemap.TabbedEditor.prototype.update = function() {
    this.updateSupplychainTab();
    this.updateStopsTab();
    this.updateHopsTab();
}

Sourcemap.TabbedEditor.prototype.updateSupplychainTab = function() {
    Sourcemap.template('supplychain/editor/tabbed/sc-tab', 
        this.supplychainTab(), 
        this.supplychain
    );
}

Sourcemap.TabbedEditor.prototype.updateStopsTab = function() {
    Sourcemap.template('supplychain/editor/tabbed/stops-tab', 
        this.stopsTab(), 
        this.supplychain
    );
}

Sourcemap.TabbedEditor.prototype.updateHopsTab = function() {
    Sourcemap.template('supplychain/editor/tabbed/hops-tab', 
        this.hopsTab(), 
        this.supplychain
    );
}
Sourcemap.TabbedEditor.prototype.supplychainTab = function() {
    return $('#'+this.id+'-sc').get(0);
}

Sourcemap.TabbedEditor.prototype.stopsTab = function() {
    return $('#'+this.id+'-stops').get(0);
}

Sourcemap.TabbedEditor.prototype.hopsTab = function() {
    return $('#'+this.id+'-hops').get(0);
}

Sourcemap.TabbedEditor.prototype.dialogEl = function() {
    return $('#'+this.id+'-dialog').get(0);
}

Sourcemap.TabbedEditor.prototype.editStop = function(stop_id) {
    var stop = stop_id ? this.supplychain.findStop(stop_id) : new Sourcemap.Stop()
    Sourcemap.template('supplychain/editor/tabbed/edit-stop',
        $.proxy(function(tpath, txt, thtml) {
            $(this.dialogEl()).html(thtml);
            $(this.dialogEl()).find("input.placename").geocomplete();
            $(this.dialogEl()).dialog("open");
        }, this),
        stop
    );
}
