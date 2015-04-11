config = require '../coffee/config-ini'

console.log 'Usage: coffee test.coffee [--config=your-config.ini]'

config.load ['test/config.ini', 'test/override.ini'], (err) ->
  if err
    console.log 'ERROR:', err, config
  else
    console.log 'loaded:', config
