// Copyright 2013 Mark Cavage, Inc.  All rights reserved.

var dgram = require('dgram');
var os = require('os');
var Stream = require('stream').Stream;
var util = require('util');

var assert = require('assert-plus');
var bunyan = require('bunyan');
var moment = require('moment');



///--- Globals

var sprintf = util.format;

var HOSTNAME = os.hostname();
var STR_FMT = '[object %s<host=%s, port=%d, proto=%s>]';

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
                break;

        default:
                sysl = LOG_DEBUG;
                break;
        }

        return (sysl);
}


function time(t) {
        return (moment(t || new Date()).format('MMM DD:HH:mm:ss'));
}



///--- API

function SyslogStream(opts) {
        assert.object(opts, 'options');
        assert.optionalNumber(opts.facility, 'options.facility');
        assert.optionalString(opts.host, 'options.host');
        assert.optionalNumber(opts.port, 'options.port');
        assert.optionalString(opts.name, 'options.name');

        Stream.call(this);

        this.facility = opts.facility || 1;
        this.host = opts.host || '127.0.0.1';
        this.name = opts.name || process.title || process.argv[0];
        this.port = opts.port || 514;
        this.writable = true;

        this.socket = dgram.createSocket('udp4');
        this.socket.on('close', this.emit.bind(this, 'close'));
        this.socket.on('error', this.emit.bind(this, 'error'));
}
util.inherits(SyslogStream, Stream);
module.exports = SyslogStream;


SyslogStream.prototype.destroy = function destroy() {
        this.writable = false;
        this.close();
};


SyslogStream.prototype.end = function end() {
        if (arguments.length > 0)
                this.write.apply(this, Array.prototype.slice.call(arguments));

        this.writable = false;
        this.close();
};


SyslogStream.prototype.write = function write(r) {
        if (!this.writable)
                throw new Error('SyslogStream has been ended already');

        var h;
        var l = this.facility * 8;
        var m;
        var t;

        if (Buffer.isBuffer(r)) {
                // expensive, but not expected
                m = r.toString('utf8');
        } else if (typeof (r) === 'object') {
                h = r.hostname;
                l = (this.facility * 8) + level(r.level);
                m = JSON.stringify(r, bunyan.safeCycles());
                t = time(r.time);
        } else if (typeof (r) === 'string') {
                m = r;
        } else {
                throw new TypeError('record (Object) required');
        }

        var hdr = sprintf('<%d>%s %s %s[%d]:',
                          (l || (this.facility * 8) + level(bunyan.INFO)),
                          (t || time()),
                          (h || HOSTNAME),
                          this.name,
                          process.pid);

        this._send(new Buffer(hdr + m, 'utf-8'));
};


SyslogStream.prototype.toString = function toString() {
        return (sprintf(STR_FMT,
                        'SyslogStream',
                        this.host,
                        this.port,
                        /UDP/.test(this.constructor.name) ? 'udp' : 'tcp'));
};
