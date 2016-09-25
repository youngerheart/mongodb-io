install:
	@if [ ! -f "$$(which nodemon)" ]; then npm --registry=http://registry.npm.taobao.org install nodemon -g; fi
	@npm --registry=http://registry.npm.taobao.org install
	@eslint --fix entry.js src/*.js src/**/*.js

dev: install
	@nodemon test.js

publish: install
	@npm publish
