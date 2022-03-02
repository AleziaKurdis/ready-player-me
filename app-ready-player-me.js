"use strict";
//
//  app-ready-player-me.js
//
//  Created by makitsune, January 8th, 2021.
//  Copyright 2021, Tivoli Cloud VR inc.
//  Copyright 2022, Overte e.V.
//
//  Ready-player-me application. (Wolfe3D avatar provider).
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//
(function() {
    var jsMainFileName = "app-ready-player-me.js";
    var ROOT = Script.resolvePath('').split(jsMainFileName)[0];
    
    var APP_NAME = "R-PL-ME";
    var APP_URL = ROOT + "ready-player-me.html";
    var APP_ICON_INACTIVE = ROOT + "icon_inactive.png";
    var APP_ICON_ACTIVE = ROOT + "icon_active.png";

    var tablet = Tablet.getTablet("com.highfidelity.interface.tablet.system");

    var button = tablet.addButton({
        text: APP_NAME,
        icon: APP_ICON_INACTIVE,
        activeIcon: APP_ICON_ACTIVE
    });

    var overlayWebWindow = new OverlayWebWindow({
        title: "Ready Player Me",
        source: "about:blank",
        width: 1280,
        height: 720,
        visible: false
    });

    var uuid = "com.overte.readyPlayerMe";

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
        button.editProperties({ isActive: active });
        overlayWebWindow.setURL(Script.resolvePath("ready-player-me.html") + "?1");
        overlayWebWindow.setVisible(active);
    }

    button.clicked.connect(function () {
        setActive(!button.getProperties().isActive);
    });

    overlayWebWindow.closed.connect(function () {
        setActive(false);
    });

    Script.scriptEnding.connect(function () {
        tablet.removeButton(button);
    });

}());