# jQuery Watcher <a href="https://codecov.io/github/z3nz/jquery-watcher?branch=master"><img src="https://img.shields.io/codecov/c/github/z3nz/jquery-watcher/master.svg" alt="Coverage Status"></a>

Write [Mustache.js](https://github.com/janl/mustache.js) templates in elements and have them update automatically with reactive data.

```html
<button>Clicked: {{ count }}</button>

<script>
$('button').watcher({ count: 0 }).click(function () {
  $(this).watcher().count++
})

$('button').click().text()
// Clicked: 1
</script>
```

## Getting started

### Install as a module

npm:
```shell
npm i jquery-watcher
```

yarn:
```shell
yarn add jquery-watcher
```

Initialize the plugin once in your project:
```javascript
// src/plugins.js

import 'jquery-watcher'

// or

require('jquery-watcher')
```

### CDN

```html
<!-- jQuery -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/3.5.1/jquery.min.js"></script>
<!-- Mustache.js -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/mustache.js/4.0.1/mustache.min.js"></script>
<!-- jQuery Watcher -->
<script src="https://unpkg.com/jquery-watcher@1.1.1/dist/jquery-watcher.min.js"></script>
```

## API

### `.watcher( data: Object ) => jQuery`

Pass a data object that you want to be reactive. Returns jQuery.
This will immediately render your template.

```html
<div>Hello {{ value }}</div>

<script>
$('div').watcher({ value: 'World' }).text()
// Hello World

$('div').watcher({ value: 'Adam' }).text()
// Hello Adam
</script>
```

### `.watcher() => Object`

If no argument is passed, it will return the reactive data object.
If you manipulate the properties on the object, it will automatically re-render your template.

```html
<div>Hello {{ text }}</div>

<script>
const data = $('div').watcher({ text: 'World' }).watcher()
data.text = 'Adam'
$('div').text()
// Hello Adam
</script>
```

## TODOs

- [x] CDN
- [ ] Config options
- [ ] TypeScript support
- [ ] Reactive arrays
- [ ] Allow template modification
