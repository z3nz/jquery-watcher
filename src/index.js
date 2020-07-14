import Mustache from 'mustache'

const dataKey = 'jquery-watcher-data'
const textKey = 'jquery-watcher-initial-text'

const minVersion = require('../package.json').optionalDependencies.jquery
const mv = minVersion.replace('>=', '').split('.')

let jQuery

// Use jquery as a module or jquery in the window
try {
  jQuery = require('jquery')
} catch (_) {
  jQuery = window.jQuery || window.$
}

(function ($) {
  const watcher = function (data) {
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
          // Save the initial text so we can mustache render on an update
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
      console.warn('jquery-watcher: received a non-object argument, it was ignored')
    }
  }

  if (!$) throw Error('jquery-watcher: jQuery is not installed and it is not defined globally')

  const version = $.fn.jquery
  const v = version.split('.')

  if (v[0] >= mv[0] && v[1] >= mv[1] && v[2] >= mv[2]) $.fn.watcher = watcher
  else throw Error(`jquery-watcher: jQuery version is ${version} and jquery-watcher requires a version >= ${minVersion}`)
})(jQuery)

/*
Example 1:

  <button class="btn">Clicked: {{count}}</button>

  $('.btn')
    .watcher({ count: 0 })
    .click(function () { this.watcher().count++ })

*/
