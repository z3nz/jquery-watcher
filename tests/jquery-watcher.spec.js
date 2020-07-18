const path = require('path')
const jw = path.join('../', require('../package.json').main)

beforeEach(() => {
  jest.dontMock('jquery')
  jest.dontMock('mustache')
  jest.resetModules()
})

describe('jquery-watcher', () => {
  it('should throw error if jquery is not found', () => {
    jest.mock('jquery')
    expect(() => require(jw)).toThrowError('not installed')
  })

  it('should throw error if jquery is wrong version', () => {
    const version = '1.3.9'
    jest.doMock('jquery', () => ({ fn: { jquery: version } }))
    expect(() => require(jw)).toThrowError(version)
  })

  it('should use the window jquery', () => {
    jest.doMock('jquery', () => { throw Error('module not found') })
    global.window.$ = { fn: { jquery: '1.4.0' } }
    require(jw)
    expect(global.window.$.fn.watcher).toBeDefined()
  })

  it('should throw error if mustache is not found', () => {
    jest.mock('mustache')
    expect(() => require(jw)).toThrowError('not installed')
  })

  it('should use the window mustache', () => {
    jest.doMock('mustache', () => { throw Error('module not found') })
    global.window.Mustache = {}
    require(jw)
    expect(global.window.$.fn.watcher).toBeDefined()
  })

  it('should define the watcher plugin', () => {
    require(jw)
    const $ = require('jquery')
    expect($.fn.watcher).toBeDefined()
  })

  it('should throw error if given unexpected arugment', () => {
    require(jw)
    const $ = require('jquery')
    expect(() => $('div').watcher(1)).toThrowError('unexpected argument')
  })

  it('should save data on element', () => {
    require(jw)
    const $ = require('jquery')
    document.body.innerHTML = '<div></div>'
    const $d = $('div')

    $d.watcher({ value: 1 })
    expect($d[0]['jquery-watcher-data']).toEqual({ value: 1 })
  })

  it('should add to and update data on element', () => {
    require(jw)
    const $ = require('jquery')
    document.body.innerHTML = '<div></div>'
    const $d = $('div')

    $d.watcher({ value: 1 })
    $d.watcher({ value: 0, value2: 2 })
    expect($d[0]['jquery-watcher-data']).toEqual({ value: 0, value2: 2 })
  })

  it('should return data from one element', () => {
    require(jw)
    const $ = require('jquery')
    document.body.innerHTML = '<div></div>'
    const $d = $('div')

    $d.watcher({ value: 1 })
    expect($d.watcher()).toEqual({ value: 1 })
  })

  it('should return array of data from multiple elements', () => {
    require(jw)
    const $ = require('jquery')
    document.body.innerHTML = '<div></div><div></div>'
    const $d = $('div')

    $d.watcher({ value: 1 })
    const data = $d.watcher()
    expect(data).toEqual([{ value: 1 }, { value: 1 }])
    data[0].value = 2
    expect($d.watcher()).toEqual([{ value: 2 }, { value: 1 }])
  })

  it('should return undefined if no elements are found', () => {
    require(jw)
    const $ = require('jquery')
    document.body.innerHTML = ''
    const $d = $('div')

    $d.watcher({ value: 1 })
    expect($d.watcher()).toBeUndefined()
  })

  it('should save initial text', () => {
    require(jw)
    const $ = require('jquery')
    document.body.innerHTML = '<div>Hello World</div>'
    const $d = $('div')

    $d.watcher({})
    expect($d[0]['jquery-watcher-template']).toBe('Hello World')
  })

  it('should run initial render', () => {
    require(jw)
    const $ = require('jquery')
    document.body.innerHTML = '<div>Hello {{text}}</div>'
    const $d = $('div')

    $d.watcher({ text: 'World' })
    expect($d.text()).toBe('Hello World')
  })

  it('should render on update', () => {
    require(jw)
    const $ = require('jquery')
    document.body.innerHTML = '<div>Hello {{text}}</div>'
    const $d = $('div')

    $d.watcher({ text: 'World' })
    $d.watcher().text = 'Adam'
    expect($d.text()).toBe('Hello Adam')
  })

  it('should append', () => {
    require(jw)
    const $ = require('jquery')
    document.body.innerHTML = ''
    const $d = $('<div>Hello {{text}}</div>')

    $d.watcher({ text: 'World' })
    $d.watcher().text = 'Adam'
    $d.appendTo('body')
    expect($('body').text()).toBe('Hello Adam')
  })

  it('should run the readme examples', () => {
    require(jw)
    const $ = require('jquery')
    document.body.innerHTML = '<button>Clicked: {{ count }}</button>'
    $('button').watcher({ count: 0 }).click(function () {
      $(this).watcher().count++
    })
    expect($('button').click().text()).toBe('Clicked: 1')

    document.body.innerHTML = '<div>{{hero}}</div><div>{{hero}}</div>'
    const [, div2] = $('div').watcher({ hero: 'Superman' }).watcher()
    div2.hero = 'Batman'
    expect($('div:nth-child(1)').text()).toBe('Superman')
    expect($('div:nth-child(2)').text()).toBe('Batman')

    document.body.innerHTML = '<div>{{nested.bird}}</div>'
    const { nested } = $('div').watcher({ nested: { bird: '' } }).watcher()
    nested.bird = 'Robin'
    expect($('div').text()).toBe('Robin')

    document.body.innerHTML = '<div>{{#starks}}<p>{{.}}</p>{{/starks}}</div>'
    const { starks } = $('div').watcher({ starks: ['Ned', 'Sansa', 'Bran', 'Jon'] }).watcher()
    starks.pop()
    $('div').text()
    expect($('div').html()).toBe('<p>Ned</p><p>Sansa</p><p>Bran</p>')

    document.body.innerHTML = '<div>{{things.0}}</div>'
    const { things } = $('div').watcher({ things: ['Thing 1'] }).watcher()
    $('div').text()
    expect($('div').text()).toBe('Thing 1')
    things.push('Thing 2')
    $('div').watcher('set_template', '{{ things.0 }} & {{ things.1 }}').text()
    expect($('div').text()).toBe('Thing 1 & Thing 2')
  })

  it('should react to nested object changes', () => {
    require(jw)
    const $ = require('jquery')
    document.body.innerHTML = '<div>{{top}} {{nested.lower}}</div>'
    const $d = $('div')

    $d.watcher({ top: 'Top', nested: { lower: 'Nested' } })
    expect($d.text()).toBe('Top Nested')
    const data = $d.watcher()
    data.nested.lower = 'Lower Changed'
    expect($d.text()).toBe('Top Lower Changed')
  })

  it('should react to array changes', () => {
    require(jw)
    const $ = require('jquery')
    document.body.innerHTML = '<div>{{#musketeers}}{{.}} {{/musketeers}}</div>'
    const $d = $('div')

    $d.watcher({
      musketeers: ['Athos', 'Aramis', 'Porthos', "D'Artagnan"]
    })
    expect($d.text()).toBe('Athos Aramis Porthos D\'Artagnan ')
    const { musketeers } = $d.watcher()
    musketeers[0] = 'Adam'
    expect($d.text()).toBe('Adam Aramis Porthos D\'Artagnan ')
  })

  it('should react to object changes in an array', () => {
    require(jw)
    const $ = require('jquery')
    document.body.innerHTML = '<div>{{#stooges}}{{name}} {{/stooges}}</div>'
    const $d = $('div')

    $d.watcher({
      stooges: [
        { name: 'Moe' },
        { name: 'Larry' },
        { name: 'Curly' }
      ]
    })
    expect($d.text()).toBe('Moe Larry Curly ')
    const { stooges } = $d.watcher()
    stooges[0].name = 'Adam'
    expect($d.text()).toBe('Adam Larry Curly ')
  })

  it('should make new nested data reactive', () => {
    require(jw)
    const $ = require('jquery')
    document.body.innerHTML = '<div>{{nested.arr.0}} {{nested.lower}} {{nested.evenLower.hell}}</div>'
    const $d = $('div')

    $d.watcher({ nested: { lower: 'Nested' } })
    $d.watcher({ nested: { lower: 'Hail', evenLower: { hell: 'Satan' }, arr: ['All'] } })
    expect($d.text()).toBe('All Hail Satan')
    const data = $d.watcher()
    data.nested.lower = 'Mario'
    expect($d.text()).toBe('All Mario Satan')
    data.nested.evenLower.hell = 'Bowser'
    expect($d.text()).toBe('All Mario Bowser')
    data.nested.arr[0] = 'Peach'
    expect($d.text()).toBe('Peach Mario Bowser')
  })

  // Actions
  it('should throw error if given unknown action', () => {
    require(jw)
    const $ = require('jquery')
    expect(() => $('div').watcher('my_action')).toThrowError('no action')
  })

  it('should run action: render', () => {
    require(jw)
    const $ = require('jquery')
    document.body.innerHTML = '<div></div>'
    const $d = $('div')

    $d.watcher({ hello: 'world' }).html('{{hello}}').watcher('render')
    expect($d.text()).toBe('world')
  })

  it('should run action: set_template', () => {
    require(jw)
    const $ = require('jquery')
    document.body.innerHTML = '<div></div>'
    const $d = $('div')

    $d.watcher({ test: 'cool' }).watcher('set_template', '{{test}}').watcher('render')
    expect($d.text()).toBe('cool')
  })

  it('should throw error in action: set_template', () => {
    require(jw)
    const $ = require('jquery')
    document.body.innerHTML = '<div></div>'

    expect(() => $('div').watcher('set_template')).toThrowError('requires a string')
  })
})
