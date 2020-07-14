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

    if (v[0] >= mv[0] && v[1] >= mv[1] && v[2] >= mv[2]) $.fn.watcher = watcher
    else throw Error(`jquery-watcher: jQuery version is ${version} and jquery-watcher requires a version >= ${minVersion}`)

    const dataKey = 'jquery-watcher-data'
    const textKey = 'jquery-watcher-initial-text'

    function watcher (data) {
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
      } else if (!!data && data.constructor === Object) {
        // The user is setting data on one or more elements
        this.each(function (_, el) {
          // If we find data, update based on the keys or add to the watcher data object
          if (el[dataKey]) {
            Object.keys(data).forEach(k => {
              el[dataKey][k] = data[k]
            })
          } else {
            // Save the initial text so we can render on an update
            el[textKey] = $(this).text()

            // Run initial render
            $(this).text(Mustache.render(el[textKey], data))

            // Create our new watcher data object
            el[dataKey] = new Proxy(data, {
              set: (target, prop, value) => {
                target[prop] = value
                // Replace the merge tags with our updated data
                $(this).text(Mustache.render(el[textKey], target))
                return true
              }
            })
          }
        })

        return this
      } else {
        console.warn('jquery-watcher: Received a non-object argument and it was ignored:', data)
      }
    }
  })(jQueryVar, mustacheVar)
})()
