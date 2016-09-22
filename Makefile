install:
	@if [ ! -f "$$(which nodemon)" ]; then npm --registry=http://registry.npm.taobao.org install nodemon -g; fi
	@npm --registry=http://registry.npm.taobao.org install
	@eslint --fix entry.js src/*.js src/**/*.js

dev: install
	@nodemon entry.js

deploy: install
	@babel src --out-dir dist
	@cp package.json README.md dist

publish: deploy
	@cd dist && npm publish && cd ..
