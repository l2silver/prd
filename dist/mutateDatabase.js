'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.factory = undefined;

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

exports.default = combineMappedStates;

var _immutable = require('immutable');

var _i2 = require('i');

var _i3 = _interopRequireDefault(_i2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

(0, _i3.default)(true);

var factory = exports.factory = {
	createOrderedMap: function createOrderedMap(children) {
		try {
			var orderedMap = children.reduce(function (orderedMap, child) {
				return orderedMap.set(child.get('id').toString(), child);
			}, (0, _immutable.OrderedMap)());
			return orderedMap;
		} catch (e) {
			console.log('orderedMap error', e, children);
			throw e;
		}
	},
	idArray: function idArray(children) {
		try {
			return children.reduce(function (list, child) {
				return list.push(child.get('id').toString());
			}, (0, _immutable.List)());
		} catch (e) {
			console.log('idArray error', e, children);
			throw e;
		}
	},
	mergeWithoutList: function mergeWithoutList(prev, next) {
		if (prev && (typeof prev === 'undefined' ? 'undefined' : _typeof(prev)) === 'object') {
			if (_immutable.List.isList(prev)) {
				return next;
			} else {
				return prev.mergeWith(factory.mergeWithoutList, next);
			}
		}
		return next;
	},
	checklistWithId: function checklistWithId(js) {
		return _immutable.List.isList(js) && js.first() && js.first().get && js.first().get('id');
	},
	mapState: function mapState(js, tree, globe) {
		try {
			if ((typeof js === 'undefined' ? 'undefined' : _typeof(js)) !== 'object' || js === null) {
				return true;
			}
			if (factory.checklistWithId(js)) {

				var orderedMap = factory.createOrderedMap(js);

				return factory.addToGLobe(orderedMap, tree, globe);
			}
			return factory.addToGLobe(js, tree, globe);
		} catch (e) {
			console.log('mapState error', e);
			throw e;
		}
	},
	addToGLobe: function addToGLobe(js, tree, globe) {
		try {
			return (0, _immutable.Seq)(js).toKeyedSeq().mapEntries(function (_ref) {
				var _ref2 = _slicedToArray(_ref, 2);

				var k = _ref2[0];
				var v = _ref2[1];

				return [k, factory.createMapObject(k, v, tree)];
			}).reduce(function (globes, mapObject) {
				if (!mapObject.skip && mapObject.thisObject) {
					try {
						globes.setIn(mapObject.thisTree, mapObject.thisObject);
						factory.setNextObject(globe, mapObject);
					} catch (e) {
						console.log('error in reduce addToGLobe', e);
						throw e;
					}
				}
				return globes;
			}, globe);
		} catch (e) {
			console.log('addToGLobe error', e);
			throw e;
		}
	},
	createMapObject: function createMapObject(k, js, tree) {
		try {
			if (k === 'tree') {
				return {
					skip: true
				};
			}
			if (js && (typeof js === 'undefined' ? 'undefined' : _typeof(js)) === 'object') {
				if (factory.checklistWithId(js)) {
					return {
						thisTree: tree.push(k + 'TWR'),
						nextTree: (0, _immutable.List)([k]),
						nextObject: factory.createOrderedMap(js),
						thisObject: factory.idArray(js)
					};
				}
				if (js.get('id')) {
					if (k != js.get('id')) {
						return {
							thisTree: tree.push(k + 'TWR'),
							nextTree: (0, _immutable.List)([k.pluralize]),
							nextObject: factory.createOrderedMap((0, _immutable.List)([js])),
							thisObject: js.get('id').toString()
						};
					}
				}
			}

			var _nextTree = tree.push(k);
			return {
				thisTree: _nextTree,
				nextTree: _nextTree,
				thisObject: js,
				nextObject: js
			};
		} catch (e) {
			console.log('mapOBJECT error', e);
			throw e;
		}
	},
	setNextObject: function setNextObject(globe, mapObject) {
		try {
			if (mapObject.nextObject && globe) {
				factory.mapState(mapObject.nextObject, mapObject.nextTree, globe);
			}
		} catch (e) {
			console.log('setNextObject', e);
			throw e;
		}
	}
};
function combineMappedStates(js, tree) {
	var globe = arguments.length <= 2 || arguments[2] === undefined ? (0, _immutable.Map)() : arguments[2];

	var startGlobe = (0, _immutable.Map)().asMutable();
	factory.mapState(_immutable.Map.isMap(js) || _immutable.List.isList(js) ? js : (0, _immutable.fromJS)(js), tree, startGlobe);
	return globe.mergeWith(factory.mergeWithoutList, startGlobe.asImmutable());
};