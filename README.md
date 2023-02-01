# Theresmore Automation

Automation for the [Theresmore](https://www.theresmoregame.com/play/) game.

## Installation

Install an extension that supports Userscripts, like [Violentmonkey](https://violentmonkey.github.io/) or [Tampermonkey](https://www.tampermonkey.net/).

Then simply open
[https://github.com/Theresmore-Automation/Theresmore-Automation/raw/main/dist/bundle.user.js](https://github.com/Theresmore-Automation/Theresmore-Automation/raw/main/dist/bundle.user.js)
to have the script installed.

## Development

Start by installing dependencies with `npm install`.

### Bundle

Bundle everything from `src/` into `dist/bundle.user.js`:

`npm run build`

### Development server

`npm run serve`

This will automatically update `dist/bundle.user.js` when code changes and serve it on [localhost:8124](http://localhost:8124/).

It also creates a second userscript `dist/dev.user.js`, if you install it in Tampermonkey, it will automatically fetch the latest version from
http://localhost:8124/bundle.user.js once you reload a website with F5.

### Bundle without source map

Bundle for publishing without sourcemapping to `dist/release-3.2.1.user.js`

`npm run build:release`

or on Windows

`npm run build:release:win32`

## Other

- Template based on [rollup-userscript-template](https://github.com/cvzi/rollup-userscript-template)
- Options are imported/exported using [LZString](https://github.com/pieroxy/lz-string)
