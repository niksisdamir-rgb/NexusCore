.PHONY: build test lint format dev clean

build:
	npm run build

test:
	npm run test

lint:
	npm run lint

format:
	npm run format

dev:
	npm run dev

clean:
	rm -rf dist
	rm -rf node_modules
