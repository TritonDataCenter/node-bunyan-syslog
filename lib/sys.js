// Copyright 2013 Mark Cavage, Inc.  All rights reserved.

var dgram = require('dgram');
var os = require('os');
var Stream = require('stream').Stream;
var util = require('util');

var assert = require('assert-plus');

var binding = require('../build/Release/syslog');



///--- Globals

var sprintf = util.format;

var HOSTNAME = os.hostname();

// Harcoded from https://github.com/trentm/node-bunyan so this module
// can have minimal dependencies
var bunyan = {
        FATAL: 60,
        ERROR: 50,
        WARN:  40,
        INFO:  30,
        DEBUG: 20,
        TRACE: 10,

        safeCycles: function safeCycles() {
                var seen = [];
                function bunyanCycles(k, v) {
                        if (!v || typeof (v) !== 'object') {
                                return (v);
                        }
                        if (seen.indexOf(v) !== -1) {
                                return ('[Circular]');
                        }
                        seen.push(v);
                        return (v);
                }

                return (bunyanCycles);
        }
};


// Syslog Levels
var SYSLOG_LEVEL = {
        EMERGENCY: 0,
        ALERT: 1,
        CRITICAL: 2,
        ERROR: 3,
        WARNING: 4,
        NOTICE: 5,
        INFO: 6,
        DEBUG: 7
};


var DEFAULT_MAPPING = {};
DEFAULT_MAPPING[bunyan.FATAL] = SYSLOG_LEVEL.EMERGENCY;
DEFAULT_MAPPING[bunyan.ERROR] = SYSLOG_LEVEL.ERROR;
DEFAULT_MAPPING[bunyan.WARN] = SYSLOG_LEVEL.WARNING;
DEFAULT_MAPPING[bunyan.INFO] = SYSLOG_LEVEL.INFO;


///--- Helpers

// Translates a Bunyan level into a syslog level, given a mapping
function level(mapping, l) {
        return mapping[l] || SYSLOG_LEVEL.DEBUG;
}


function time(t) {
        return (new Date(t).toJSON());
}


function normalize_mapping(mappings) {
        var new_mapping = {};
        var keys = Object.keys(mappings);
        keys.forEach(function(key) {
                // positive integer keys or nothin'
                if (Math.abs(parseInt(key, 10)) != key) {
                        return;
                }

                // known syslog levels only
                var val = mappings[key];
                if (parseInt(val, 10) === val) {
                        if (val < 0 || val > 7) {
                                return;
                        }

                        new_mapping[key] = val;
                } else {
                        val = val.toString().toUpperCase();
                        if (!SYSLOG_LEVEL[val]) {
                                return;
                        }
                        new_mapping[key] = SYSLOG_LEVEL[val];
                }
        });
        return new_mapping;
}

///--- API

function SyslogStream(opts) {
        assert.object(opts, 'options');
        assert.optionalNumber(opts.facility, 'options.facility');
        assert.optionalString(opts.name, 'options.name');
        assert.optionalObject(opts.mapping, 'options.mapping');

        Stream.call(this);

        this.mapping = normalize_mapping(opts.mapping || DEFAULT_MAPPING);
        this.facility = opts.facility || 1;
        this.name = opts.name || process.title || process.argv[0];
        this.writable = true;

        if (this.constructor.name === 'SyslogStream') {
                binding.openlog(this.name, binding.LOG_CONS, 0);
                process.nextTick(this.emit.bind(this, 'connect'));
        }
}
util.inherits(SyslogStream, Stream);
module.exports = SyslogStream;


// Overriden by TCP/UDP
SyslogStream.prototype.close = function close() {
        binding.closelog();
};


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
        var l;
        var m;
        var t;

        if (Buffer.isBuffer(r)) {
                // expensive, but not expected
                m = r.toString('utf8');
        } else if (typeof (r) === 'object') {
                h = r.hostname;
                l = level(this.mapping, r.level);
                m = JSON.stringify(r, bunyan.safeCycles());
                t = time(r.time);
        } else if (typeof (r) === 'string') {
                m = r;
        } else {
                throw new TypeError('record (Object) required');
        }

        l = (this.facility * 8) + (l !== undefined ? l : level(this.mapping, bunyan.INFO));
        var hdr = sprintf('<%d>%s %s %s[%d]:',
                          l,
                          (t || time()),
                          (h || HOSTNAME),
                          this.name,
                          process.pid);

        if (this._send) {
                this._send(hdr + m);
        } else {
                binding.syslog(l, m);
        }
};


SyslogStream.prototype.toString = function toString() {
        var str = '[object SyslogStream<facility=' + this.facility;
        if (this.host)
                str += ', host=' + this.host;
        if (this.port)
                str += ', port=' + this.port;
        if (!/^Sys/.test(this.constructor.name)) {
                str += ', proto=' +
                        (/UDP/.test(this.constructor.name) ? 'udp' : 'tcp');
        }
        str += '>]';

        return (str);
};
