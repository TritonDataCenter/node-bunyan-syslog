// Copyright 2013 Mark Cavage, Inc.  All rights reserved.

var net = require('net');
var util = require('util');

var assert = require('assert-plus');

var SyslogStream = require('./sys');




///--- Globals

var PROXY_EVENTS = [
        'connect',
        'data',
        'drain',
        'end',
        'timeout'
];



///--- Helpers

function createSocket(opts) {
        assert.object(opts, 'options');
        assert.string(opts.host, 'options.host');
        assert.number(opts.port, 'options.port');
        assert.object(opts.proxy, 'options.proxy');

        var s = net.connect({
                host: opts.host,
                port: opts.port
        });

        PROXY_EVENTS.forEach(function (e) {
                s.on(e, opts.proxy.emit.bind(opts.proxy, e));
        });

        return (s);
}



///--- API

function TCPStream(opts) {
        assert.object(opts, 'options');
        assert.optionalString(opts.host, 'options.host');
        assert.optionalNumber(opts.port, 'options.port');

        var self = this;

        SyslogStream.call(this, opts);

        this.host = opts.host || '127.0.0.1';
        this.port = opts.port || 514;

        this.queue = [];

        (function connect(event) {
                if (self.socket) {
                        if (self.listeners(event).length > 1) {
                                self.emit.apply(self, arguments);
                                return;
                        }

                        PROXY_EVENTS.forEach(function (e) {
                                self.socket.removeAllListeners(e);
                        });
                        self.socket.removeAllListeners('close');
                        self.socket.removeAllListeners('error');
                        if (self.socket.destroy)
                                self.socket.destroy();
                }

                self.socket = createSocket({
                        host: self.host,
                        port: self.port,
                        proxy: self
                });
                self.socket.on('close', setTimeout.bind(null, connect, 1000));
                self.socket.on('error', setTimeout.bind(null, connect, 1000));
                self.socket.once('connect', function () {
                        self.queue.forEach(function (buf) {
                                self.socket.write(buf);
                        });
                });
        }());
}
util.inherits(TCPStream, SyslogStream);
module.exports = TCPStream;


TCPStream.prototype.close = function close() {
        var self = this;

        this.writable = false;
        this.socket.end();

        PROXY_EVENTS.forEach(function (e) {
                self.socket.removeAllListeners(e);
        });
        self.socket.removeAllListeners('close');
        self.socket.removeAllListeners('error');
        this.socket = null;
};


TCPStream.prototype._send = function _send(msg) {
        this.socket.write(new Buffer(msg + '\n', 'utf-8'));
};
