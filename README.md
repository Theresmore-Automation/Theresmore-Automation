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
- It is generally safe to enable all production/buildings. You may want to select the mutually exclusive buildings (like `Statue of Atamar/Firio/Lurezia` or
  `Harvest/War/Mind Shrine`) by hand, and limit how many `Pillars of Mana` you want built.
- The `Marketplace` can help overcome some gold problems. Be sure to tweak the numbers to match your production speed, allowing enough time for the prices to
  return to normal. Try starting with limited amount of resources to sell (like `Cows`) until you feel comfortable to enable others.
- The `Population` tab can help auto-assign workers. Take note of `Minimum food` toggle at bottom.
- When you're ready for some action, you can automate army production, scouting, and fighting in the `Army` tab.
