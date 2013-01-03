// Copyright 2013 Mark Cavage, Inc.  All rights reserved.

var dgram = require('dgram');
var util = require('util');

var SyslogStream = require('./sys');




///--- API

function UDPStream(opts) {
        SyslogStream.call(this, opts);

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


UDPStream.prototype._send = function _send(buf) {
        var s = this.socket;
        var self = this;

        this._pending++;
        s.send(buf, 0, buf.length, this.port, this.host, function (err) {
                if (err)
                        self.emit('error', err);

                self._pending--;
        });
};
