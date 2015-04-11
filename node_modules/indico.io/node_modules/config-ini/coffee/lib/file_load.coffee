fs        = require 'fs'
iniparser = require 'iniparser'

module.exports = (exporter, file, callback) ->
  fs.readFile file, 'utf8', (err, data) ->
    return callback(err) if err

    try
      config = iniparser.parseString data
      for section, values of config
        exporter[section] = exporter[section] or {}
        exporter[section][k] = v for k, v of values
    catch err
      return callback err

    callback()
