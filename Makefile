##
# Microgame Makefile
#
# Makefile to install this project and its dependencies along with other helpers
##

# Set default shell
SHELL = /bin/bash

# Function for help
define helpText

make install                          Install project dependencies
make serve                            Start Devkit dev mode
make build                            Build app and package docker images
make clean                            Tidy project, remove any temporary files

make test-lint                        Lint the entire project

endef
export helpText

##
# Utility Targets
##

# List of targets which should be run every time without caching
.PHONY: install serve build clean test-lint


# Default make target
%::
	@echo "$$helpText"
default:
	@echo "$$helpText"

# Install target
install:
	@type git > /dev/null 2>&1 || { echo >&2 "Git is required, but it's not installed.  Aborting."; exit 1; }
	@type docker > /dev/null 2>&1 || { echo >&2 "docker is required, but it's not installed.  Aborting."; exit 1; }
	@type node > /dev/null 2>&1 || { echo >&2 "Node is required, but it's not installed.  Aborting."; exit 1; }
	@type devkit > /dev/null 2>&1 || { echo >&2 "devkit is required, but it's not installed.  Aborting."; exit 1; }
	npm install
	@cd microgame/ && devkit install https://github.com/aogilvie/devkit-authmachine#master

# Launch dev server instance
serve:
	@pkill devkit || true
	@cd microgame/
	@devkit serve &
	@google-chrome "http://localhost:9200/?app=${PWD}/microgame#device={\"type\":\"iphone6\"}"

# Build application
build: install
	@mkdir -p build/
	@cd microgame/ && devkit release --output ../build browser-mobile
	@sudo systemctl start docker
	@sudo docker build -t nginxweb .
	@sudo docker stop nginxweb || true
	@sudo docker rm nginxweb || true
	@sudo docker run -d -p 8080:80 --name nginxweb nginxweb

# Clean all
clean:
	@rm -rf node_modules


##
# TESTING TARGETS
##

# Test all
test: test-lint

# Lint target
test-lint:
	node scripts/linter/index.js ./config.js
