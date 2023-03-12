# Theresmore Automation

Automation for the [Theresmore](https://www.theresmoregame.com/play/) game.

## Installation

Install an extension that supports Userscripts, like [Violentmonkey](https://violentmonkey.github.io/) or [Tampermonkey](https://www.tampermonkey.net/).

Then simply open
[https://theresmore-automation.github.io/Theresmore-Automation/dist/bundle.user.js](https://theresmore-automation.github.io/Theresmore-Automation/dist/bundle.user.js)
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

## Usage Tips

 - Each section is independently enabled/disabled.
 - It is generally safe to enable all production/buildings, but you may want to limit how many 'Pillars of Mana' manually - like 2 or so at first.
 - The 'Marketplace' tweaks are very handy.  The idea is to act as though gold is the limiting factor to growth.  Try just selling cows at first, and grok the neat limits that will allow you to check more things to auto sell (ie: when they are pretty much full, with a timer to reset the prices)
 - The 'Population' tab is neat to play with, especially with the smart 'minimum food' toggle at bottom.
 - Automating an army build when you are ready to rumble is the best part of this!
