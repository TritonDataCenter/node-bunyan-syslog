// Copyright 2013 Mark Cavage, Inc.  All rights reserved.

var assert = require('assert-plus');

var SyslogStream = require('./sys');
var TCPStream = require('./tcp');
var UDPStream = require('./udp');



///--- Globals

var FACILITY = {
        kern: 0,
        user: 1,
        mail: 2,
        daemon: 3,
        auth: 4,
        syslog: 5,
        lpr: 6,
        news: 7,
        uucp: 8,
        authpriv: 10,
        ftp: 11,
        cron: 15,
        local0: 16,
        local1: 17,
        local2: 18,
        local3: 19,
        local4: 20,
        local5: 21,
        local6: 22,
        local7: 23
};



///--- Exports

module.exports = {
        createBunyanStream: function createBunyanStream(opts) {
                assert.optionalObject(opts, 'options');
                opts = opts || {};

                var type;

                switch (opts.type) {
                case 'sys':
                        type = SyslogStream;
                        break;

                case 'tcp':
                        type = TCPStream;
                        break;

                case 'udp':
                default:
                        type = UDPStream;
                        break;
                }

                return (new type(opts));
        },

        facility: FACILITY
};

Object.keys(FACILITY).forEach(function (k) {
        module.exports[k] = FACILITY[k];
});
