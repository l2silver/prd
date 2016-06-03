// @flow
import {Seq, fromJS, OrderedMap, List, Map, is} from 'immutable';

export const factory: {
	entry?: string; 
	state?: Map;
	setState: any;
	getState: any;
	findEntry: any;
	getEntry: any;
	setEntry: any;
	getMany: any;
	getSingle: any;
	prdTable: any;
	prdFirstInstance: any;
	getRelation: any;
	getFromGlobe: any
	} = {
	setEntry(entry: string){
		factory.entry = entry
	},
	getEntry: ()=>factory.entry,
	setState: (state: Map)=>{
		factory.state = state;
	},
	getState: () : any =>{
		return factory.state;
	},
	prdTable: (table: Array<number|string>)=>{
		if(Array.isArray(table)){
			return table
		}
		return [table];
	},
	prdFirstInstance: (instance: Map)=>{
		if(instance){
			return instance
		}
		return 'none';
	},
	getRelation: (_previousInstance: Map, _entry: string, _index: number)=>{
		if(_previousInstance === 'none'){
			return factory.getState().get(_entry);
		}
		if(_previousInstance ){
			return factory.findEntry(_previousInstance, _entry);
		}
		return false;
	},
	getMany: (orderedMap: OrderedMap, id: string) => {
		const table = [factory.getEntry().toString(), id.toString()];
		const _globeInstance = factory.getState().getIn(table);
		if(_globeInstance && !_globeInstance.get('deleted_at')){
			return orderedMap.set(id.toString(), 
				_globeInstance
			);
		}
		return orderedMap;
	},
	getSingle: (pluralEntry: string, id: string|number)=>{
		return factory.getState().getIn([pluralEntry, `${id}`]);
	},
	getFromGlobe: (_entry, relationInfo)=>{
		const pluralEntry = _entry.pluralize.toString();
		factory.setEntry(_entry);
		if(List.isList(relationInfo)){
			const orderedMap = relationInfo.reduce(factory.getMany, OrderedMap() )
			return orderedMap;
		}
		const _single = factory.getSingle(pluralEntry, relationInfo);
		if(_single){
			return _single;
		}
		return undefined
	},
	findEntry: (_previousInstance: Map, _entry: string)=>{
		const relationInfo = _previousInstance.get(_entry+'PRD');
		if(relationInfo){
			return factory.getFromGlobe(_entry, relationInfo);
		}
		const _nextInstance = _previousInstance.get(_entry.toString());
		return _nextInstance
	}
}

export function prd(state: Map, table: string|Array<string|number>, instance: Map){
	try{
		factory.setState(state);
		const _table = factory.prdTable(table);
		const _firstInstance = factory.prdFirstInstance(instance);
		const _lastInstance = _table.reduce(factory.getRelation, _firstInstance)
		return _lastInstance;
	}catch(e){
		console.log('prd ERROR', e)
		throw e
	}
}