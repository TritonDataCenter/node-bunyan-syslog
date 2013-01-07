// Copyright 2013 Mark Cavage, Inc.  All rights reserved.

var dgram = require('dgram');
var util = require('util');

var assert = require('assert-plus');

var SyslogStream = require('./sys');




///--- API

function UDPStream(opts) {
        assert.object(opts, 'options');
        assert.optionalString(opts.host, 'options.host');
        assert.optionalNumber(opts.port, 'options.port');

        SyslogStream.call(this, opts);

        this.host = opts.host || '127.0.0.1';
        this.port = opts.port || 514;

        this.socket = dgram.createSocket('udp4');
        this.socket.on('close', this.emit.bind(this, 'close'));
        this.socket.on('error', this.emit.bind(this, 'error'));

        this._pending = 0;
}
util.inherits(UDPStream, SyslogStream);
module.exports = UDPStream;


UDPStream.prototype.close = function close() {
        this.writable = false;

        if (this._pending === 0) {
                this.socket.close();
        } else {
                setTimeout(this.close.bind(this), 10);
        }
};


UDPStream.prototype._send = function _send(msg) {
        var buf = new Buffer(msg, 'utf-8');
        var s = this.socket;
        var self = this;

        this._pending++;
        s.send(buf, 0, buf.length, this.port, this.host, function (err) {
                if (err)
                        self.emit('error', err);

                self._pending--;
        });
};
