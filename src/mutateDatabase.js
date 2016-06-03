// @flow
import {Seq, fromJS, OrderedMap, List, Map, is} from 'immutable';	
import inflect from 'i';
inflect(true);


export const factory: {

} = {
		createOrderedMap(children: List<Map>){
			try{
				const orderedMap =  children.reduce((orderedMap, child)=>{
					return orderedMap.set(child.get('id').toString(), child);
				}, OrderedMap())
				return orderedMap;
			}catch(e){
				console.log('orderedMap error', e, children)
				throw e;
			}
			
		},
		idArray(children: Array<Map>){
			try{
				return children.reduce((list, child)=>{
					return list.push(child.get('id').toString());
				}, List())	
			}catch(e){
				console.log('idArray error', e, children)
				throw e
			}
		},
		mergeWithoutList(prev: any, next: any){
			if(prev && typeof prev === 'object'){
				if(List.isList(prev)){
					return next
				}else{
					return prev.mergeWith(factory.mergeWithoutList, next)
				}
			}
			return next
		},
		checklistWithId(js: any){
			return List.isList(js) && js.first() && js.first().get && js.first().get('id')
		},
		mapState(js:any, tree: List, globe: Map){
			try{
				if(typeof js !== 'object' || js === null){
					return true
				}
				if( factory.checklistWithId(js) ){
					
					const orderedMap = factory.createOrderedMap(js) 
					
					return factory.addToGLobe(orderedMap, tree, globe);	
				}	
				return factory.addToGLobe(js, tree, globe);
			}catch(e){
				console.log('mapState error', e);
				throw e
			}
		},
		addToGLobe(js: any, tree: List, globe: any){
			try{
				return Seq(js).toKeyedSeq().mapEntries(([k, v]) => {
					return [k,  
					factory.createMapObject(k, v, tree)
					]
				}).reduce((globes, mapObject)=>{
					if(!mapObject.skip && mapObject.thisObject){
						try{
							globes.setIn(mapObject.thisTree, mapObject.thisObject );
							factory.setNextObject(globe, mapObject);
						}catch(e){
							console.log('error in reduce addToGLobe', e)
							throw e;
						}
					}
					return globes
				}
				, globe);

			}catch(e){
				console.log('addToGLobe error', e)
				throw e;
			}	
		},
		createMapObject(k: string, js: any, tree: List){
			try{
				if(k === 'tree'){
					return {
							skip: true		  
							}
				}
				if(js && typeof js === 'object'){
					if(factory.checklistWithId(js)){
						return {
							  thisTree: tree.push(k+'TWR')
							, nextTree: List([k])
							, nextObject: factory.createOrderedMap(js)
							, thisObject: factory.idArray(js)
						}
					}
					if(js.get('id')){
						if(k != js.get('id')){
							return {
								  thisTree: tree.push(k + 'TWR')
								, nextTree: List([k.pluralize])
								, nextObject: factory.createOrderedMap(List([js]))
								, thisObject: js.get('id').toString()
							}
						}
					}
				}
				
				const nextTree = tree.push(k)
				return {
							thisTree: nextTree,
							nextTree: nextTree,
							thisObject: js,
							nextObject: js,
						}
			}catch(e){
				console.log('mapOBJECT error', e)
				throw e;
			}
		},
		setNextObject(globe: Map, mapObject: {nextObject: any; nextTree: List}){
			try{
				if(mapObject.nextObject && globe){
					factory.mapState(mapObject.nextObject, mapObject.nextTree, globe);
				}
			}catch(e){
				console.log('setNextObject', e)
				throw e
			}	
		}
}
export default function combineMappedStates(js: any, tree: List, globe: Map = Map() ){
	const startGlobe = Map().asMutable();
	factory.mapState(Map.isMap(js) || List.isList(js) ? js : fromJS(js), tree, startGlobe);
	return globe.mergeWith(factory.mergeWithoutList, startGlobe.asImmutable());
};
