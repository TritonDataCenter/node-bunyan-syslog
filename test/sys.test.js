// Copyright 2013 Mark Cavage, Inc.  All rights reserved.

var bunyan = require('bunyan');
var test = require('tap').test;

var bsyslog = require('../lib');



///--- Globals

var I = 0;
var LOG;
var STREAM;

var NEWLOG;
var NEWSTREAM;


///--- Tests

test('create a logger', function (t) {
        STREAM = bsyslog.createBunyanStream({
                name: 'sys_test',
                facility: bsyslog.local0,
                type: 'sys'
        });
        t.ok(STREAM);
        console.error(STREAM.toString());

        LOG = bunyan.createLogger({
                name: 'systest',
                streams: [ {
                        type: 'raw',
                        level: 'trace',
                        stream: STREAM
                } ]
        });
        t.ok(LOG);
        STREAM.once('connect', t.end.bind(t));
});


test('write a trace record', function (t) {
        LOG.trace({i: I++}, 'sample %s record', 'trace');
        t.end();
});


test('write a debug record', function (t) {
        LOG.debug({i: I++}, 'sample %s record', 'debug');
        t.end();
});


test('write a info record', function (t) {
        LOG.info({i: I++}, 'sample %s record', 'info');
        t.end();
});


test('write a warn record', function (t) {
        LOG.warn({i: I++}, 'sample %s record', 'warn');
        t.end();
});


test('write a error record', function (t) {
        LOG.error({i: I++}, 'sample %s record', 'error');
        t.end();
});


test('write a fatal record', function (t) {
        LOG.fatal({i: I++}, 'sample %s record', 'fatal');
        t.end();
});


if (bunyan.createLevel) {
        test('create a logger with mapped levels', function (t) {
                NEWSTREAM = bsyslog.createBunyanStream({
                        name: 'sys_mapped_test',
                        facility: bsyslog.local0,
                        type: 'sys',
                        mapping: {
                                60: 'emergency',
                                50: 'error',
                                40: 'warning',
                                35: 'notice',
                                30: 'info'
                        }
                });
                t.ok(NEWSTREAM);
                console.error(NEWSTREAM.toString());

                if (bunyan.createLevel) {
                        bunyan.createLevel('notice', 35);
                }
                NEWLOG = bunyan.createLogger({
                        name: 'sysmappedtest',
                        streams: [ {
                                type: 'raw',
                                level: 'trace',
                                stream: NEWSTREAM
                        } ]
                });
                t.ok(NEWLOG);
                NEWSTREAM.once('connect', t.end.bind(t));
        });


        test('write a notice record', function (t) {
                NEWLOG.notice({i: I++}, 'sample %s record', 'notice');
                t.end();
        });


        test('write an info record', function (t) {
                NEWLOG.info({i: I++}, 'sample %s record', 'info');
                t.end();
        });
}

test('teardown', function (t) {
        STREAM.close();
        if (NEWSTREAM) {
                NEWSTREAM.close();
        }
        t.end();
});

