var webpackConf = require('./webpack.conf.js');

module.exports = function(config) {
  config.set({

    basePath: '',
    frameworks: ['jasmine'],

    files: [
      'tests/**/*Spec.js',
      'https://maps.googleapis.com/maps/api/js?libraries=geometry&callback=initMap'
    ],

    webpack: webpackConf,

    webpackMiddleware: {
      noInfo: true
    },

    preprocessors: {
        'tests/**/*Spec.js': ['webpack']
    },

    reporters: ['progress'],
    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    autoWatch: true,
    browsers: ['Chrome'],
    singleRun: true,
    concurrency: Infinity
  })
}
