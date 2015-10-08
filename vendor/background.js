"use strict";

var state = {
  connected: false,
  room: null,
  tab: null,
  error: null
};


var messageBridge = (function(){
  return {
    "sendMessage": function(message){
      chrome.extension.sendMessage(message);
    }
  };
}());


var socket = (function(){
  var phoenix = require("phoenix");
  var sock;
  var chan;
  var syncedTab;
  var ignoreUpdate = false;

  return {
    "joinServer": function(url) {
      try {
        sock = new phoenix.Socket(url);
        sock.connect();
      } catch ( e ) {
        state = {connected:false,room:null,tab:null,error:"Connection Failure"};
        messageBridge.sendMessage({type: "stateUpdate", state: state});
      }
      sock.onError(function(error){
        state = {connected: false,room:null,tab:null,error:"Connection Failure"};
        messageBridge.sendMessage({type: "stateUpdate", state: state});
        sock.disconnect();
      });
      chan = sock.channel("tabs:lobby", {});
      chan.on("url_change", function(payload) {
      });
      chan.join().receive("ok", function() {
        state.connected = true;
        state.room = "lobby";
        state.error = null;
        messageBridge.sendMessage({type: "stateUpdate", state: state});
      });

    },
    "joinChannel": function (channel) {
      if(chan) {
        chan.leave();
      }
      chan = sock.channel("tabs:"+channel, {});
      chan.on("url_change", function(payload) {
        ignoreUpdate = true;
        setTimeout(function(){ignoreUpdate = false}, 5000);
        chrome.tabs.update(syncedTab, {url: payload.body.body});
      })
      chan.join().receive("ok", function() {
        state.room = channel;
        messageBridge.sendMessage({type: "stateUpdate", state: state});
      });
    },
    "pushUpdate": function(event, data) {
      if(!ignoreUpdate) {
        chan.push(event, {body: data});
      }
    },
    "setSyncedTab": function(id) {
      syncedTab = id;
    },
    "getSyncedTab": function() {
      return syncedTab;
    },
    "isConnected": function() {
      return (sock && (sock.conn !== null || chan.state !== "errored"));
    }
  };

}());


chrome.extension.onMessage.addListener(function(request, sender, sendResponse) {
    switch(request.type) {
      case "checkState":
        messageBridge.sendMessage({type: "stateUpdate",state: state});
        break;
      case "syncTab":
        //socket.joinChannel();
        chrome.tabs.query(
          {currentWindow: true, active: true},
          function(tabArray) {
              if (tabArray && tabArray[0]) {
                socket.setSyncedTab(tabArray[0].id);
                state.tab = tabArray[0].id;
                messageBridge.sendMessage({type: "stateUpdate", state: state});
              }
          });
        break;
      case "connect":
        socket.joinServer(request.url);
        break;
      case "joinChannel":
        socket.joinChannel(request.channel);
        break;
      case "checkConnection":
        if(socket.isConnected()) {
          messageBridge.sendMessage({type: "connectionState",connected: true});
        } else {
          messageBridge.sendMessage({type: "connectionState",connected: false});
        }
        break;
    }
    return true;
});


chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
  if(changeInfo.status === "loading" && changeInfo.url && tabId === socket.getSyncedTab())
  {
    socket.pushUpdate("url_change", {body: changeInfo.url});
  }
});

chrome.tabs.onReplaced.addListener(function(newID, oldID) {
  if(oldID === socket.getSyncedTab()) {
    socket.setSyncedTab(newID);
    chrome.tabs.get(newID, function (tab){
      socket.pushUpdate("url_change", {body: tab.url});
    });
  }
});
