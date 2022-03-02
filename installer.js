"use strict";
//
//  installer.js
//
//  Created by Alezia Kurdis, March 1st, 2022.
//  Copyright 2022, Overte e.V.
//
//  Install the ready-player-me application when clicked.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//
(function() {

    var MAX_CLICKABLE_DISTANCE_M = 10;
    var jsMainFileName = "installer.js";
    var ROOT = Script.resolvePath('').split(jsMainFileName)[0];
    var appScriptUrl = ROOT + "app-ready-player-me.js";

    // Constructor
    var _this = null;

    function clickableUI() {
        _this = this;
        this.entityID = null;
    }


    // Entity methods
    clickableUI.prototype = {
        preload: function (id) {
            _this.entityID = id;
            HMD.displayModeChanged.connect(this.displayModeChangedCallback);
        },

        displayModeChangedCallback: function() {
            if (_this && _this.entityID) {
                //Nothing
            }
        },

        mousePressOnEntity: function (entityID, event) {
            if (event.isPrimaryButton && 
                Vec3.distance(MyAvatar.position, Entities.getEntityProperties(_this.entityID, ["position"]).position) <= MAX_CLICKABLE_DISTANCE_M) {
                    var running = false;
                    var runningScripts = ScriptDiscoveryService.getRunning();
                    for (var i = 0; i < runningScripts.length; i++) {
                        if (runningScripts[i].url === appScriptUrl) {
                            running = true;
                            break;
                        }
                    }
                    if (!running) {
                        ScriptDiscoveryService.loadScript(appScriptUrl, true, false, false, true, false);
                    } else {
                        //print("Already running!");
                    }
            }
        },

        unload: function () {
            HMD.displayModeChanged.disconnect(this.displayModeChangedCallback);
        }
    };

    
    return new clickableUI();
});