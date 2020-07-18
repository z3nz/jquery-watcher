(function () {
  // Use jQuery as a module or use the window variable
  let jQueryVar
  try {
    jQueryVar = require('jquery')
  } catch (_) {
    jQueryVar = window.jQuery || window.$
  }

  // Use Mustache as a module or use the window variable
  let mustacheVar
  try {
    mustacheVar = require('mustache')
  } catch (_) {
    mustacheVar = window.Mustache
  }

  (function ($, Mustache) {
    if (!$) throw Error('jquery-watcher: jQuery is not installed and it is not defined on the window')
    if (!Mustache) throw Error('jquery-watcher: Mustache is not installed and it is not defined on the window')

    const minVersion = '1.4.0'
    const mv = minVersion.split('.')
    const version = $.fn.jquery
    const v = version.split('.')

    if (v.every((a, i) => a >= mv[i])) $.fn.watcher = watcher
    else throw Error(`jquery-watcher: jQuery version is ${version} and jquery-watcher requires a version >= ${minVersion}`)

    const dataKey = 'jquery-watcher-data'
    const tempKey = 'jquery-watcher-template'

    // Helpers
    const isObj = data => !!data && data.constructor === Object
    const indices = arr => arr.map((_, i) => i)
    const reactify = ($this, el, data) => {
      // Make our data reactive
      const d = new Proxy(JSON.parse(JSON.stringify(data)), {
        set: (target, prop, value) => {
          target[prop] = value
          // Re-render template with our updated data
          // If data is not set on the element, ignore
          // console.log(target, prop, value)
          if (el[dataKey]) $this.html(Mustache.render(el[tempKey], el[dataKey]))
          return true
        }
      });
      // Recursive reactifier
      (isObj(d) ? Object.keys(d) : indices(d)).forEach(k => {
        if (isObj(d[k]) || Array.isArray(d[k])) {
          d[k] = reactify($this, el, d[k])
        }
      })
      return d
    }

    function watcher (data, ...opts) {
      // The user is trying to get watcher data from an element
      if (data === undefined) {
        const returnData = []

        // Push the watcher data into the return array stored on every element
        this.each(function (_, el) { returnData.push(el[dataKey]) })

        // If there's only one element, only return that data
        if (returnData.length === 1) return returnData[0]

        // Otherwise return the array of data from each element
        if (returnData.length > 1) return returnData

        // If there's no elements, return undefined
        return undefined
      } else if (isObj(data)) {
        // The user is setting data on one or more elements
        this.each(function (_, el) {
          // If we find data, update based on the keys/index or add to the data
          if (el[dataKey]) {
            Object.keys(data).forEach(k => {
              // If the prop is an object or array, run it through our recursive reactifier
              if (isObj(data[k]) || Array.isArray(data[k])) {
                el[dataKey][k] = reactify($(this), el, data[k])
              } else {
                // Otherwise just update/set the data
                el[dataKey][k] = data[k]
              }
            })
          } else {
            const $this = $(this)

            // Save our template
            el[tempKey] = $this.html()

            // Run initial render
            $this.html(Mustache.render(el[tempKey], data))

            // Create our new watcher object
            el[dataKey] = reactify($this, el, data)
          }
        })

        // Return jQuery
        return this
      } else if (typeof data === 'string') {
        // If they pass a string, it's an action
        switch (data) {
          case 'render':
            this.each(function (_, el) {
              const $this = $(this)
              // If the template is empty, try to use the html
              if (!el[tempKey]) el[tempKey] = $this.html()
              if (el[dataKey]) $this.html(Mustache.render(el[tempKey], el[dataKey]))
            })
            break
          case 'set_template':
            if (typeof opts[0] !== 'string') throw Error('jquery-watcher: Action "set_template" requires a string, received:', opts[0])
            else {
              this.each(function (_, el) {
                el[tempKey] = opts[0]
                // Re-render if we find data
                if (el[dataKey]) $(this).html(Mustache.render(el[tempKey], el[dataKey]))
              })
            }
            break
          default:
            throw Error(`jquery-watcher: There is no action "${data}"`)
        }

        // Return jQuery
        return this
      } else {
        throw Error('jquery-watcher: Received an unexpected argument and it was ignored:', data)
      }
    }
  })(jQueryVar, mustacheVar)
})()
