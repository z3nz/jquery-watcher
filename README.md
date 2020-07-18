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

![](https://i.imgur.com/Uz3JNfw.gif)

## Getting Started

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
<script src="https://cdn.jsdelivr.net/npm/jquery@3.5.1/dist/jquery.min.js"></script>
<!-- Mustache.js -->
<script src="https://cdn.jsdelivr.net/npm/mustache@4.0.1/mustache.min.js"></script>
<!-- jQuery Watcher -->
<script src="https://cdn.jsdelivr.net/npm/jquery-watcher@1.3.0/dist/jquery-watcher.min.js"></script>
```

## API

### `.watcher(data: Object) => jQuery`

Pass a data object that you want to be reactive. Returns jQuery.<br>
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

All of your nested objects will also be reactive.

```html
<div>{{ nested.bird }}</div>

<script>
const { nested } = $('div').watcher({ nested: { bird: '' } }).watcher()

nested.bird = 'Robin'

$('div').text()
// Robin
</script>
```

Arrays too!

```html
<div>
  {{ #starks }}
  <p>{{.}}</p>
  {{ /starks }}
</div>

<script>
const { starks } = $('div').watcher({ starks: ['Ned', 'Sansa', 'Bran', 'Jon'] }).watcher()

starks.pop()

$('div').html()
/*
<p>Ned</p>
<p>Sansa</p>
<p>Bran</p>
*/
</script>
```

### `.watcher() => Object`

If no argument is passed, it will return the reactive data object.<br>
If you manipulate the properties on the reactive object, it will automatically re-render your template.

```html
<div>Hello {{ text }}</div>

<script>
const data = $('div').watcher({ text: 'World' }).watcher()

data.text = 'Adam'

$('div').text()
// Hello Adam
</script>
```

### `.watcher() => [Object, ...]`

If there is more than one element, it will return an array of reactive data objects.

```html
<div>{{ hero }}</div>
<div>{{ hero }}</div>

<script>
// [{ hero: 'Superman' }, { hero: 'Superman' }]
const [div1, div2] = $('div').watcher({ hero: 'Superman' }).watcher()

div2.hero = 'Batman'

$('div:nth-child(1)').text()
// Superman

$('div:nth-child(2)').text()
// Batman
</script>
```

## Actions

### `.watcher('set_template', template: String) => jQuery`

Sets a new template on the element. Second argument is your string template. Returns jQuery.<br>
This will immediately render your new template if there's data.

```html
<div>{{ things.0 }}</div>

<script>
const { things } = $('div').watcher({ things: ['Thing 1'] }).watcher()
$('div').text()
// Thing 1

things.push('Thing 2')
$('div').watcher('set_template', '{{ things.0 }} & {{ things.1 }}').text()
// Thing 1 & Thing 2
</script>
```

### `.watcher('render') => jQuery`

Renders your template. Useful if you set your template via `.html()`. Returns jQuery.

```html
<div></div>

<script>
$('div')
  .watcher({ hello: 'world' })
  .html('{{ hello }}')
  .watcher('render')
  .text()
// world
</script>
```

## TODOs

- [x] CDN
- [X] Reactive arrays
- [X] Allow template modification
- [ ] Config options
