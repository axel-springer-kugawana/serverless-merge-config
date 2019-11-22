'use strict'

const {
  mergeWith,
  forEach,
  isArray,
  isPlainObject,
  unset
} = require('lodash')

class ServerlessMergeConfig {
  constructor (serverless, options) {
    this.serverless = serverless
    this.options = options

    this.hooks = {
      'before:package:initialize': this.mergeConfig.bind(this),
      'before:offline:start:init': this.mergeConfig.bind(this),
      'before:invoke:local:invoke': this.mergeConfig.bind(this)
    }
  }

  mergeConfig () {
    this.deepMerge(this.serverless.service)
  }

  deepMerge (serverlessConfig) {
    forEach(serverlessConfig, (value, key, collection) => {
      if (isPlainObject(value) || isArray(value)) {
        this.deepMerge(value)
      }
      if (key === '$<<') {
        if (isArray(value)) {
          value.forEach((subValue) => {
            this.mergeValue(collection, subValue)
          })
        } else {
          this.mergeValue(collection, value)
        }
        unset(serverlessConfig, key)
      }
    })
  }

  mergeValue (collection, value) {
    const customizer = (objValue, srcValue) => {
      if (isArray(objValue)) {
        return objValue.concat(srcValue)
      }
    }

    if (isPlainObject(value)) {
      mergeWith(collection, value, customizer)
    }
  }
}

module.exports = ServerlessMergeConfig
