// Copyright 2013 Mark Cavage, Inc.  All rights reserved.

var assert = require('assert-plus');

var TCPStream = require('./tcp');
var UDPStream = require('./udp');



///--- Exports

module.exports = {
        createBunyanStream: function createBunyanStream(opts) {
                assert.optionalObject(opts, 'options');
                opts = opts || {};

                if (opts.type === 'tcp')
                        return (new TCPStream(opts));

                return (new UDPStream(opts));
        },

        facility: {
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
        }
};
