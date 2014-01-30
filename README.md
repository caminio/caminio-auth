[![Build Status](https://travis-ci.org/caminio/caminio-auth.png)](https://travis-ci.org/caminio/caminio-auth)

## caminio-auth

an authentication module for caminio.

## usage

    $ npm install --save caminio-auth

require it to your project/gear's index file before or at least when you run caminio.

    var caminio = require('caminio');

    caminio.run(
      require('caminio-auth')
    );
