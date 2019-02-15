
'use strict';

const rest = require('rest');
const defaultRequest = require('rest/interceptor/defaultRequest');
const mime = require('rest/interceptor/mime');
const uriTemplateInterceptor = require('./api/uriTemplateInterceptor');
const errorCode = require('rest/interceptor/errorCode');
const baseRegistry = require('rest/mime/registry');

const registry = baseRegistry.child();

var uriListConverter = {
    read: function (str, opts) {
        return str;  //MAYBE convert to a array
    },
    write: function (obj, opts) {
        return obj.toString();
    }
}

registry.register('application/hal+json', require('rest/mime/type/application/hal'));
registry.register('text/uri-list', uriListConverter);

module.exports = rest
    .wrap(mime, { registry: registry })
    .wrap(uriTemplateInterceptor)
    .wrap(errorCode)
    .wrap(defaultRequest, { headers: { 'Accept': 'application/hal+json' }});