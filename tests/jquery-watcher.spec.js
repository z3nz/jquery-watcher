const jw = '../dist/index'

beforeEach(() => {
  jest.dontMock('jquery')
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
    expect($div.watcher()).toEqual([{ value: 1 }, { value: 1 }])
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
    expect($div[0]['jquery-watcher-initial-text']).toBe('Hello World')
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

  it('should warn', () => {
    require(jw)
    const $ = require('jquery')
    const warn = jest.fn()
    global.console.warn = warn
    $('div').watcher('')
    expect(warn.mock.calls.length).toBe(1)
  })
})
