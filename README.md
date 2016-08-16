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

## Mappings

By default, this module maps bunyan levels to syslog levels as follows:

```
+--------------+-------------+--------+
| Bunyan Level | Bunyan Name | Syslog |
+--------------+-------------+--------+
| 60           | fatal       | emerg  |
+--------------+-------------+--------+
| 50           | error       | error  |
+--------------+-------------+--------+
| 40           | warn        | warn   |
+--------------+-------------+--------+
| 30           | info        | info   |
+--------------+-------------+--------+
| *            | *           | debug  |
+--------------+-------------+--------+
```

.. any levels other than those explicitly defined get mapped to debug.
 
If you need support for other levels, you can pass a mapping to 
createBunyanStream. You'll need to specify all the levels you care
about; anything not explicitly defined will get mapped to debug, per usual:

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
			port: 514,
			mapping: {
				60: 'emergency',
				50: 'error',
				40: 'warning',
				35: 'notice',
				30: 'info'
			}
		})
	}]
});

log.debug({foo: 'bar'}, 'hello %s', 'world');
```



# License

MIT.
