'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.factory = undefined;
exports.prd = prd;

var _immutable = require('immutable');

var factory = exports.factory = {
	setEntry: function setEntry(entry) {
		factory.entry = entry;
	},

	getEntry: function getEntry() {
		return factory.entry;
	},
	setState: function setState(state) {
		factory.state = state;
	},
	getState: function getState() {
		return factory.state;
	},
	prdTable: function prdTable(table) {
		if (Array.isArray(table)) {
			return table;
		}
		return [table];
	},
	prdFirstInstance: function prdFirstInstance(instance) {
		if (instance) {
			return instance;
		}
		return 'none';
	},
	getRelation: function getRelation(_previousInstance, _entry, _index) {
		if (_previousInstance === 'none') {
			return factory.getState().get(_entry);
		}
		if (_previousInstance) {
			return factory.findEntry(_previousInstance, _entry);
		}
		return false;
	},
	getMany: function getMany(orderedMap, id) {
		var table = [factory.getEntry().toString(), id.toString()];
		var _globeInstance = factory.getState().getIn(table);
		if (_globeInstance && !_globeInstance.get('deleted_at')) {
			return orderedMap.set(id.toString(), _globeInstance);
		}
		return orderedMap;
	},
	getSingle: function getSingle(pluralEntry, id) {
		return factory.getState().getIn([pluralEntry, '' + id]);
	},
	getFromGlobe: function getFromGlobe(_entry, relationInfo) {
		var pluralEntry = _entry.pluralize.toString();
		factory.setEntry(_entry);
		if (_immutable.List.isList(relationInfo)) {
			var orderedMap = relationInfo.reduce(factory.getMany, (0, _immutable.OrderedMap)());
			return orderedMap;
		}
		var _single = factory.getSingle(pluralEntry, relationInfo);
		if (_single) {
			return _single;
		}
		return undefined;
	},
	findEntry: function findEntry(_previousInstance, _entry) {
		var relationInfo = _previousInstance.get(_entry + 'PRD');
		if (relationInfo) {
			return factory.getFromGlobe(_entry, relationInfo);
		}
		var _nextInstance = _previousInstance.get(_entry.toString());
		return _nextInstance;
	}
};

function prd(state, table, instance) {
	try {
		factory.setState(state);
		var _table = factory.prdTable(table);
		var _firstInstance = factory.prdFirstInstance(instance);
		var _lastInstance = _table.reduce(factory.getRelation, _firstInstance);
		return _lastInstance;
	} catch (e) {
		console.log('prd ERROR', e);
		throw e;
	}
}