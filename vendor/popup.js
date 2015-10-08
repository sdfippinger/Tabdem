"use strict";

document.addEventListener('DOMContentLoaded', function() {

  require("popupApp")

  var messageBridge = (function(){
    return {
      "sendMessage": function(message){
        chrome.extension.sendMessage(message)
      }
    }
  }());

  popup = riot.mount('*',{
    "state": {
      "connected": false,
      "room": null,
      "tab": null
    },
    "send": messageBridge.sendMessage
  })[0];


  chrome.extension.onMessage.addListener(function(request, sender, sendResponse) {
    switch(request.type) {
      case "stateUpdate":
        console.log("update")
        console.log(request.state)
        popup.updateState(request.state);
        break;
    }
    return true;
  });

  messageBridge.sendMessage({
    type: "checkState"
  })


  // var checkPageButton = document.getElementById('syncTab');
  // var connectionButton = document.getElementById('serverConnect');
  // var roomLink = document.getElementById('roomOne');
  // var chan;
  //
  // chrome.extension.sendMessage({
  //   type: "checkConnection"
  // });
  //
  // roomLink.addEventListener('click', function(){
  //   chrome.extension.sendMessage({
  //     type: "joinChannel",
  //     channel: "roomOne"
  //   })
  // })
  //
  // connectionButton.addEventListener('click', function() {
  //   var url = document.getElementById('serverURL');
  //   console.log(url.value);
  //   chrome.extension.sendMessage({
  //     type: "connect",
  //     url: url.value
  //   });
  // })
  //
  // checkPageButton.addEventListener('click', function() {
  //   chrome.tabs.getSelected(null, function(tab) {
  //     chrome.extension.sendMessage({
  //           type: "sync"
  //       });
  //   });
  // }, false);
  //
  // chrome.extension.onMessage.addListener(function(request, sender, sendResponse) {
  //   switch(request.type) {
  //     case "connectionState":
  //       var connectionDiv = document.getElementById('joinServer');
  //       var joinedDiv = document.getElementById('joinedServer');
  //       if(request.connected) {
  //         connectionDiv.style.display = "none";
  //         joinedDiv.style.display = "block";
  //       } else {
  //         connectionDiv.style.display = "block";
  //         joinedDiv.style.display = "none";
  //       }
  //       break;
  //     case "connectionError":
  //       var connectionError = document.getElementById('connectionError');
  //       connectionError.style.display = "block";
  //       break;
  //   }
  //   return true;
  // });


}, false);
