#
# Copyright (c) 2013, Mark Cavage. All rights reserved.

#
# Tools
#
NPM		:= npm
NPM_EXEC	:= npm
TAP		:= ./node_modules/.bin/tap

#
# Files
#
JS_FILES	:= $(shell find lib test -name '*.js')
JSL_CONF_NODE	 = tools/jsl.node.conf
JSL_FILES_NODE   = $(JS_FILES)
JSSTYLE_FILES	 = $(JS_FILES)
JSSTYLE_FLAGS    = -f tools/jsstyle.conf

CLEAN_FILES += ./node_modules build

include ./tools/mk/Makefile.defs
include ./tools/mk/Makefile.node_deps.defs

#
# Repo-specific targets
#
.PHONY: all test
all: $(REPO_DEPS)
	$(NPM) install

test:
	$(TAP) test

include ./tools/mk/Makefile.deps
include ./tools/mk/Makefile.node_deps.targ
include ./tools/mk/Makefile.targ
