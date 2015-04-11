file_load = require './lib/file_load'

removable_loader = module.exports.load = (files=[], callback) ->
  if not callback? and typeof files is 'function'
    callback = files
    files    = []

  config_files = []
  config_files.push(file) for file in files
  for arg in process.argv
    if arg.substr(0, 9) is '--config=' and arg.length > 9
      config_files.push arg.substr 9

  config_files = [config_files] if typeof config_files is 'string'

  config_files.push 'config.ini' unless config_files.length

  next = (err) ->
    if err
      return callback(err) if typeof callback is 'function'
      return # silent fail

    if config_files.length
      return file_load module.exports, config_files.shift(), next

    delete module.exports.load if module.exports.load is removable_loader
    callback() if typeof callback is 'function'

  next()
