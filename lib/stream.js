// Copyright 2013 Mark Cavage, Inc.  All rights reserved.

var dgram = require('dgram');
var Stream = require('stream').Stream;
var util = require('util');

var assert = require('assert-plus');
var bunyan = require('bunyan');
var moment = require('moment');



///--- Globals

var sprintf = util.format;

var STR_FMT = '[object %s<host=%s, port=%d>]';

var LOG_EMERG = 0;
var LOG_ALERT = 1;
var LOG_CRIT = 2;
var LOG_ERROR = 3;
var LOG_WARNING = 4;
var LOG_NOTICE = 5;
var LOG_INFO = 6;
var LOG_DEBUG = 7;



///--- Helpers

// Translates a Bunyan level into a syslog level
function level(l) {
        var sysl;

        switch (l) {
        case bunyan.FATAL:
                sysl = LOG_EMERG;
                break;

        case bunyan.ERROR:
                sysl = LOG_ERROR;
                break;

        case bunyan.WARN:
                sysl = LOG_WARNING;
                break;

        case bunyan.INFO:
                sysl = LOG_INFO;

        default:
                sysl = LOG_DEBUG;
                break;
        }

        return (sysl);
}



///--- API

function SyslogStream(opts) {
        assert.object(opts, 'options');
        assert.optionalNumber(opts.facility, 'options.facility');
        assert.optionalString(opts.host, 'options.host');
        assert.optionalNumber(opts.port, 'options.port');
        assert.optionalString(opts.name, 'options.name');

        var self = this;
        Stream.call(this);

        this.facility = opts.facility || 1;
        this.host = opts.host || '127.0.0.1';
        this.name = opts.name || process.title || process.argv[0];
        this.port = opts.port || 514;

        this.socket = dgram.createSocket('udp4');

        this.socket.on('close', this.emit.bind(this, 'close'));
        this.socket.on('error', this.emit.bind(this, 'error'));
}
util.inherits(SyslogStream, Stream);


SyslogStream.prototype.close = function close() {
        this.socket.close();
};


SyslogStream.prototype.write = function write(r) {
        // Pri and HDR
        var packet = sprintf('<%d>%s %s %s[%d]:',
                             (this.facility * 8) + level(r.level),
                             moment(r.time).format('MMM DD:HH:mm:ss'),
                             r.hostname,
                             this.name,
                             process.pid);

        // Msg
        packet += JSON.stringify(r, bunyan.safeCycles());

        var buf = new Buffer(packet, 'utf-8');


        function cb(err, bytes) {
                if (err) {
                        self.emit('error', err);
                        return;
                }
        }

        this.socket.send(buf, 0, buf.length, this.port, this.host, cb);
};


SyslogStream.prototype.toString = function toString() {
        return (sprintf(STR_FMT,
                        this.constructor.name,
                        this.host,
                        this.port,
                        this.maxRequestIds));
};




///--- Test

// var log = bunyan.createLogger({
//         name: 'foo',
//         streams: [ {
//                 level: 'debug',
//                 type: 'raw',
//                 stream: new SyslogStream({
//                         facility: 16
//                 })
//         } ]
// });


// log.debug({foo: 'bar'}, 'hi %s', 'there');