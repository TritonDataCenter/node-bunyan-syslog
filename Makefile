#
# Copyright (c) 2018, Joyent, Inc.
#

#
# Tools
#

ISTANBUL	:= node_modules/.bin/istanbul
FAUCET		:= node_modules/.bin/faucet

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

ifeq ($(shell uname -s),SunOS)
	NODE_PREBUILT_VERSION =	v4.9.0
	NODE_PREBUILT_TAG =	zone
	NODE_PREBUILT_IMAGE =	18b094b0-eb01-11e5-80c1-175dac7ddf02
endif

include ./tools/mk/Makefile.defs
ifeq ($(shell uname -s),SunOS)
	include ./tools/mk/Makefile.node_prebuilt.defs
else
	NODE := node
	NPM := $(shell which npm)
	NPM_EXEC=$(NPM)
endif

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
ifeq ($(shell uname -s),SunOS)
	include ./tools/mk/Makefile.node_prebuilt.targ
endif
include ./tools/mk/Makefile.targ
