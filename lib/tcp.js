// Copyright 2013 Mark Cavage, Inc.  All rights reserved.

var net = require('net');
var util = require('util');

var SyslogStream = require('./sys');




///--- API

function TCPStream(opts) {
        SyslogStream.call(this, opts);

        var self = this;

        this.queue = [];
        this.socket = net.connect({
                host: self.host,
                port: self.port
        });

        this.socket.once('connect', function () {
                self.queue.forEach(function (buf) {
                        self.socket.write(buf);
                });
        });

        this.socket.on('close', this.emit.bind(this, 'close'));
        this.socket.on('connect', this.emit.bind(this, 'connect'));
        this.socket.on('data', this.emit.bind(this, 'data'));
        this.socket.on('drain', this.emit.bind(this, 'drain'));
        this.socket.on('end', this.emit.bind(this, 'end'));
        this.socket.on('error', this.emit.bind(this, 'error'));
        this.socket.on('timeout', this.emit.bind(this, 'timeout'));
}
util.inherits(TCPStream, SyslogStream);
module.exports = TCPStream;


TCPStream.prototype.close = function close() {
        this.writable = false;
        this.socket.end();
};


TCPStream.prototype._send = function _send(buf) {
        this.socket.write(buf);
        this.socket.write('\n', 'utf8');
};
