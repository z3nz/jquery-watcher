# jQuery Watcher <a href="https://codecov.io/github/z3nz/jquery-watcher?branch=master"><img src="https://img.shields.io/codecov/c/github/z3nz/jquery-watcher/master.svg" alt="Coverage Status"></a>

Write [Mustache.js](https://github.com/janl/mustache.js) templates in elements and have them update automatically with reactive data.

```javascript
<button>Clicked: {{ count }}</button>

$('button').watcher({ count: 0 }).click(function () {
  this.watcher().count++
})

$('button').click().text()

// Clicked: 1
```

## Getting started

npm:
```bash
npm i jquery-watcher
```

yarn:
```bash
yarn add jquery-watcher
```

## API

### `.watcher( data: Object ) => jQuery`

Pass a data object that you want to be reactive. Returns jQuery.
This will immediately render your template.

```javascript
<div>Hello {{ value }}</div>

$('div').watcher({ value: 'World' }).text()

// Hello World

$('div').watcher({ value: 'Adam' }).text()

// Hello Adam
```

### `.watcher() => Object`

If no argument is passed, it will return the reactive data object.
If you manipulate the properties on the object, it will automatically re-render your template.

```javascript
<div>Hello {{ text }}</div>

const data = $('div').watcher({ text: 'World' }).watcher()
data.text = 'Adam'
$('div').text()

// Hello Adam
```

## TODOs

- [ ] CDN
- [ ] Config Options
- [ ] Reactive Arrays
- [ ] Allow template modification
