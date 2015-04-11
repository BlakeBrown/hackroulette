config-ini
==========

# Description
Easy-to-use INI config file management built on top of iniparser

# What it does
Loads INI file (or files in specific order) and makes contents available in a singleton object.

## Example 1 - default behavior
Attempt to load config.ini from the current working directory.
Contents of your-script.js:
    var config = require('config-ini');

    config.load(function (err) {
      if (err) {
        throw new Error(err); // File not found
      }

      console.log('My config:', config);
    });

On your terminal run:
    # node your-script.js

## Example 2 - specific config file
Load specified ini file. Using the code from "Example 1", run:
    # node your-script.js --config=configs/my-file.ini

## Example 3 - multiple config files
Using the code from "Example 1", run:
    # node your-script.js --config=my-file.ini --config=override.ini

## Example 4 - specify files in the code
Contents of your-script.js:
    var config = require('config-ini');

    config.load(['my-file.ini', 'override.ini'], function (err) {
      if (err) {
        throw new Error(err); // File not found
      }

      console.log('My config:', config);
    });

On your terminal run:
    # node your-script.js

# Install
    npm install config-ini

# Notes
- You may combine command line options and in-code calls. In that case, command line options take precedence.
- .load() method on the required singleton instance will be removed (or will be repaced with a "load" section if any) after loading configuration
