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

$(document).ready(function() {
    Sourcemap.view_params = Sourcemap.view_params || {};
    Sourcemap.view_instance = new Sourcemap.Map.Base(Sourcemap.view_params);

    Sourcemap.listen("map:supplychain_mapped", function(evt, map, sc) {
        var view = Sourcemap.view_instance;
        view.user_loc = Sourcemap.view_params.iploc ? Sourcemap.view_params.iploc[0] : false;
        if(view.options.locate_user) {
            view.showLocationDialog();
        }
        view.map.enableFullscreen();
    });

    // get passcode exist or not
    var passcode = "";   
    //if($('#exist-passcode').attr("value")){   
    if(Sourcemap.passcode_exist){   
        // TODO: If admin, skip passcode screen

        // if passcode exists
        // Create pop up window html
        var popID = 'popup';
        var element = document.createElement('div');
        $(element).html(
            '<div id="passcode-input">'+
            '<form class="passcode-input">'+
            '<label id="passcode-msg" for="passcode"> This map is protected. Please enter the password:</label>'+
            '<input name="passcode" type="text" autocomplete="off"></input>'+
            '<input id="passcode-submit" type="submit"/>'+
            '</form>'
            +'</div>'
        );
        $(element).attr('id',popID);
        $(element).addClass("popup_block");
        $(element).prepend('<a href="#" class="close"></a>');
        $('body').append($(element));
        
        var scid = Sourcemap.view_supplychain_id || location.pathname.split('/').pop();
        
        // Error behavior
        var onError = function(){ window.location = "/view/" + scid + "?private"; }

        //Autofocus on password 
        $(element).find("input[name='passcode']").focus();
        
        // CSS setting of pop up window        
        $('#' + popID).height(110);
        $('#' + popID).width(600);
        var popMargTop = ($('#' + popID).height() + 80) / 2;
        var popMargLeft = ($('#' + popID).width() + 80) / 2;

        $('#' + popID).css({
            'margin-top' : -popMargTop,
            'margin-left' : -popMargLeft,
            'overflow' : 'hidden'
        });

        $('#' + popID).fadeIn();
            
        $('body').append('<div id="fade"></div>'); //Add the fade layer to bottom of the body tag.
        $('#fade').css({'filter' : 'alpha(opacity=80)'}).fadeIn(); //Fade in the fade layer 
        $('a.close, #fade').live('click', function() { //When clicking on the close or fade layer...
            $('#fade , .popup_block').fadeOut(function() {
                //$('#fade, a.close').remove();
            }); //fade them both out
            return false;
        });
        
        // submit passcode to fetch supplychain
        $('form.passcode-input').submit(function(evt){
            evt.preventDefault();
            passcode = $(element).find("input[name='passcode']").val();

            // get scid from inline script 
            // fetch from supplychain
            var cb = function(sc) {
                var m = Sourcemap.view_instance.map;
                m.addSupplychain(sc);
                new Sourcemap.Map.Editor(Sourcemap.view_instance);
                jQuery('title').html(sc.attributes.title+" on Sourcemap");
                $(".supplychain_name").html(sc.attributes.title);

                var supplychain_desc = sc.attributes.description;
                var regex = new RegExp(/\[youtube:(.+)\]/);
                if(supplychain_desc==undefined)
                    return;
                // If sc.attributes.description not exist than return   
                    
                var regex_result = supplychain_desc.match(regex);
                var supplychain_youtube_id = null;             
                if(regex_result)
                    supplychain_youtube_id = regex_result[1];

                $(".description").html(supplychain_desc.replace(regex));
                if(supplychain_youtube_id!=null){
                    var youtube_iframe = $('<div></div>')
                        .addClass("description-video")
                        .append($('<iframe></iframe>')
                            .addClass("youtube-player")
                            .attr({
                                type:"text/html", width:480, height:280, 
                                src:"http://www.youtube.com/embed/"+supplychain_youtube_id,
                                frameborder:0
                            })
                        );
                    $(".description").after(youtube_iframe);
                }
            };
            Sourcemap.loadSupplychain(scid, passcode, cb);
           
            $('#fade , .popup_block').fadeOut(function() {
                //$('#fade, a.close').remove();
            }); //fade them both out
        });

    } else {
        // get scid from inline script
        var scid = Sourcemap.view_supplychain_id || location.pathname.split('/').pop();
        // fetch from supplychain
        Sourcemap.loadSupplychain(scid, passcode, function(sc) {
            var m = Sourcemap.view_instance.map;
            m.addSupplychain(sc);
			if (typeof(Sourcemap.Map.Editor) != "undefined") {
				new Sourcemap.Map.Editor(Sourcemap.view_instance);
			}
        });
    }

});
