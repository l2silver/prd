'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _mutateDatabase = require('./mutateDatabase');

Object.keys(_mutateDatabase).forEach(function (key) {
  if (key === "default") return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function get() {
      return _mutateDatabase[key];
    }
  });
});

var _getDatabase = require('./getDatabase');

Object.keys(_getDatabase).forEach(function (key) {
  if (key === "default") return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function get() {
      return _getDatabase[key];
    }
  });
});