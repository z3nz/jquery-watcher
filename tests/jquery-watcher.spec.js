const path = require('path')
const jw = path.join('../', require('../package.json').main)

beforeEach(() => {
  jest.dontMock('jquery')
  jest.dontMock('mustache')
  jest.resetModules()
})

const originalWarn = console.warn
afterEach(() => (console.warn = originalWarn))

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

  it('should save data on element', () => {
    require(jw)
    const $ = require('jquery')
    document.body.innerHTML = '<div></div>'
    const $div = $('div')

    $div.watcher({ value: 1 })
    expect($div[0]['jquery-watcher-data']).toEqual({ value: 1 })
  })

  it('should add to and update data on element', () => {
    require(jw)
    const $ = require('jquery')
    document.body.innerHTML = '<div></div>'
    const $div = $('div')

    $div.watcher({ value: 1 })
    $div.watcher({ value: 0, value2: 2 })
    expect($div[0]['jquery-watcher-data']).toEqual({ value: 0, value2: 2 })
  })

  it('should return data from one element', () => {
    require(jw)
    const $ = require('jquery')
    document.body.innerHTML = '<div></div>'
    const $div = $('div')

    $div.watcher({ value: 1 })
    expect($div.watcher()).toEqual({ value: 1 })
  })

  it('should return array of data from multiple elements', () => {
    require(jw)
    const $ = require('jquery')
    document.body.innerHTML = '<div></div><div></div>'
    const $div = $('div')

    $div.watcher({ value: 1 })
    const data = $div.watcher()
    expect(data).toEqual([{ value: 1 }, { value: 1 }])
    data[0].value = 2
    expect($div.watcher()).toEqual([{ value: 2 }, { value: 1 }])
  })

  it('should return undefined if no elements are found', () => {
    require(jw)
    const $ = require('jquery')
    document.body.innerHTML = ''
    const $div = $('div')

    $div.watcher({ value: 1 })
    expect($div.watcher()).toBeUndefined()
  })

  it('should save initial text', () => {
    require(jw)
    const $ = require('jquery')
    document.body.innerHTML = '<div>Hello World</div>'
    const $div = $('div')

    $div.watcher({})
    expect($div[0]['jquery-watcher-template']).toBe('Hello World')
  })

  it('should run initial render', () => {
    require(jw)
    const $ = require('jquery')
    document.body.innerHTML = '<div>Hello {{text}}</div>'
    const $div = $('div')

    $div.watcher({ text: 'World' })
    expect($div.text()).toBe('Hello World')
  })

  it('should render on update', () => {
    require(jw)
    const $ = require('jquery')
    document.body.innerHTML = '<div>Hello {{text}}</div>'
    const $div = $('div')

    $div.watcher({ text: 'World' })
    $div.watcher().text = 'Adam'
    expect($div.text()).toBe('Hello Adam')
  })

  it('should append', () => {
    require(jw)
    const $ = require('jquery')
    document.body.innerHTML = ''
    const $div = $('<div>Hello {{text}}</div>')

    $div.watcher({ text: 'World' })
    $div.watcher().text = 'Adam'
    $div.appendTo('body')
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
  })

  it('should warn', () => {
    require(jw)
    const $ = require('jquery')
    const warn = jest.fn()
    global.console.warn = warn
    $('div').watcher(1)
    expect(warn.mock.calls.length).toBe(1)
  })

  // TODO: change warnings to throwing errors
  // TODO: test nested object reactiveness
  // TODO: test array reactiveness
  // TODO: test objects in arrays reactiveness
  // TODO: test action: render
  // TODO: test action: set_template
})
