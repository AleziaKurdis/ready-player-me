"use strict";
//
//  live-ready-player-me.js
//
//  Created by Alezia Kurdis, March 1st, 2022.
//  Copyright 2022, Overte e.V.
//
//  Ready-player-me application. (Wolfe3D avatar provider). In-world live version.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//
(function() {
    var jsMainFileName = "live-ready-player-me.js";
    var ROOT = Script.resolvePath('').split(jsMainFileName)[0];

    var APP_URL = ROOT + "ready-player-me-live.html";
    


    var overlayWebWindow = new OverlayWebWindow({
        title: "Ready Player Me",
        source: "about:blank",
        width: 1280,
        height: 720,
        visible: false
    });

    var uuid = "com.overte.readyPlayerMe.live";

    function emitEvent(key, value) {
        overlayWebWindow.emitScriptEvent(
            JSON.stringify({ "uuid": uuid, "key": key, "value": value })
        );
    }

    overlayWebWindow.webEventReceived.connect(function (jsonStr) {
        var data = null;
        try {
            data = JSON.parse(jsonStr);
        } catch (err) {
            return;
        }
        if (!data.uuid && !data.key) return;
        if (data.uuid.indexOf(uuid) == -1) return;

        switch (data.key) {
            case "displayName":
                var displayName = MyAvatar.displayName ? MyAvatar.displayName : "Avatar";
                emitEvent("displayName", displayName);
                break;
            case "finish":
                MyAvatar.useFullAvatarURL(data.value.avatarUrl);
                
                if (data.value.bookmarkName !== "") {
                    AvatarBookmarks.addBookmark(data.value.bookmarkName);
                }
                setActive(false);
        }
    });

    function setActive(active) {
        overlayWebWindow.setURL(Script.resolvePath("ready-player-me.html") + "?1");
        overlayWebWindow.setVisible(active);
    }

    //Event to trigger here:
        //setActive(!button.getProperties().isActive);


    overlayWebWindow.closed.connect(function () {
        setActive(false);
    });

    var MAX_CLICKABLE_DISTANCE_M = 10;
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
                    if (!overlayWebWindow.visible){
                        setActive(true);
                    }
                    
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
