#
# Copyright 2019, Joyent, Inc.
#

#
# Tools
#

ISTANBUL	:= node_modules/.bin/istanbul
FAUCET		:= node_modules/.bin/faucet
NODE		:= node
NPM		:= npm

#
# Files
#
JS_FILES	:= $(shell find lib test -name '*.js')
JSL_CONF_NODE	 = tools/jsl.node.conf
JSL_FILES_NODE   = $(JS_FILES)
JSSTYLE_FILES	 = $(JS_FILES)
JSSTYLE_FLAGS    = -f tools/jsstyle.conf
ESLINT_FILES	 = $(JS_FILES)
BUILD		:= node

include ./tools/mk/Makefile.defs

#
# Repo-specific targets
#
.PHONY: all
all: $(NPM_EXEC)
	$(NPM) install

$(ISTANBUL): | $(NPM_EXEC)
	$(NPM) install

$(FAUCET): | $(NPM_EXEC)
	$(NPM) install

.PHONY: test
test: $(ISTANBUL) $(FAUCET)
	$(NODE) $(ISTANBUL) cover --print none test/run.js | $(FAUCET)

CLEAN_FILES += ./node_modules ./build

include ./tools/mk/Makefile.deps
include ./tools/mk/Makefile.targ
