install:
	@if [ ! -f "$$(which nodemon)" ]; then npm --registry=http://registry.npm.taobao.org install nodemon -g; fi
	@npm --registry=http://registry.npm.taobao.org install

dev: install
	@eslint --fix entry.js src/*.js src/**/*.js
	@nodemon entry.js
