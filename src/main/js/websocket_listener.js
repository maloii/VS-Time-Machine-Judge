'use strict';

const SockJS = require('sockjs-client');
require('stompjs');

function register(registrations) {
    let socket = SockJS('/payroll');
    let stompClient = Stomp.over(socket);
    stompClient.connect({}, function(frame) {
        successCallback();
    }, () => {
        reconnect(socketUrl, successCallback);
    });
    function reconnect(socketUrl, successCallback) {
        let connected = false;
        let reconInv = setInterval(() => {
            socket = SockJS('/payroll');
            stompClient = Stomp.over(ws);
            stompClient.connect({}, (frame) => {
                clearInterval(reconInv);
                connected = true;
                successCallback();
            }, () => {
                if (connected) {
                    reconnect(socketUrl, successCallback);
                }
            });
        }, 1000);
    }

    function successCallback(){
        registrations.forEach(function (registration) {
            stompClient.subscribe(registration.route, registration.callback);
        });
    }
}



module.exports.register = register;