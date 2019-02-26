'use strict';

const SockJS = require('sockjs-client');
require('stompjs');

function register(registrations) {
    let socket = SockJS('/payroll');
    let stompClient = Stomp.over(socket);
    stompClient.debug = null;
    stompClient.connect({}, function(frame) {
        registrations.forEach(function (registration) {
            stompClient.subscribe(registration.route, registration.callback);
        });
    });
    return stompClient;
}



module.exports.register = register;