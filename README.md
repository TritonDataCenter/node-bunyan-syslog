bunyan-syslog is a stream for [bunyan](https://github.com/trentm/node-bunyan)
that consumes `raw` records from bunyan and sends them to a syslog server.

# Installation

    npm install bunyan-syslog

# Usage

```javascript
var bunyan = require('bunyan');
var bsyslog = require('bunyan-syslog');

var log = bunyan.createLogger({
	name: 'foo',
	streams: [ {
		level: 'debug',
		type: 'raw',
		stream: bsyslog.createBunyanStream({
			type: 'sys',
			facility: bsyslog.local0,
			host: '192.168.0.1',
			port: 514
		})
	}]
});

log.debug({foo: 'bar'}, 'hello %s', 'world');
```

That's pretty much it.  You create a syslog stream, and point it at a syslog
server (UDP by default; you can force TCP by setting `type: tcp` in the
constructor); default is to use facility `user` and a syslog server on
`127.0.0.1:514`.  Note you *must* pass `type: 'raw'` to bunyan in the top-level
stream object or this won't work.

If you want your logs to be in the normal bunyan format, `rsyslog` allows you to
setup a template to format it as just the JSON object:

```
template(name="bunyan" type="string"
         string="%msg:R,ERE,1,FIELD:(\\{.*\\})--end%\n")

local0.* /var/log/application.log;bunyan
```

You can also write this using the older `$template` syntax:

```
$template bunyan,"%msg:R,ERE,1,FIELD:(\{.*\})--end%\n"

local0.* /var/log/application.log;bunyan
```

## Mappings

This module maps bunyan levels to syslog levels as follows:

```
+--------+--------+
| Bunyan | Syslog |
+--------+--------+
| fatal  | emerg  |
+--------+--------+
| error  | error  |
+--------+--------+
| warn   | warn   |
+--------+--------+
| info   | info   |
+--------+--------+
| *      | debug  |
+--------+--------+
```

## Running the test suite

You can run the test suite using the provided `rsyslog` configuration:

```
$ rsyslogd -f ./test/rsyslog.conf -i $PWD/test.pid -u $USER
$ make test
$ kill $(cat test.pid)
```

If you have an older `rsyslog` installed, you can adjust it to use the legacy
syntax:

```
$ModLoad imudp
$ModLoad imtcp

$UDPServerAddress 127.0.0.1
$UDPServerRun 10514

$InputTCPServerRun 10514
```

Note that when run this way, the TCP socket will listen on `0.0.0.0`.

# License

MIT.
