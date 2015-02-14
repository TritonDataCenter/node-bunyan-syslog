{
        "targets": [ {
                "target_name": "syslog",
                "sources": [ "src/syslog.cc" ],
                "include_dirs": [
                        "<!(node -e \"require('nan')\")"
                ]
        } ]
}
