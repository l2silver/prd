import {expect} from 'chai';
import {stub, spy} from 'sinon';
import combineMappedStates, {factory} from '../src/mutateDatabase';
import {Range, fromJS, Map, OrderedMap, List, Seq, is} from 'immutable';

const {	
	convertArrayToOrderedMap, 
	fromJSOrdered,
	transformResponse,
	mapState,
	checkTWREntries,
	idArray,
	createOrderedMap,
	createMapObject,
	mergeWithoutList,
	setNextObject,
} = factory;

describe('mutateDabase', ()=>{
	it('mergeWithoutList',()=>{
		const x = fromJS({friends: [1], user: {name: null, id: 2}})
		const y = fromJS({friends: [2], user: {name: 'james', id: 1}})
		const merged =  x.mergeWith(
			mergeWithoutList
			, y
		)
		expect(merged).to.equal(fromJS({friends: [2], user: {name: 'james', id: 1}}))
	})
	it.skip('benchmark', ()=>{
		const input = Range(1,10000).reduce((list, value)=>{
			const initialObject = {
				id: value
				, fake_tests: [
					{
						  id: value
					}
				]
			};
			list.push(initialObject)
			return list
		},[])
		const startTime = new Date().getTime();
		fromJS(input)
		console.log('fromJS', new Date().getTime() - startTime);
		const globe = combineMappedStates(fromJS(input), List(['tests']) ).get('fake_tests')
	})
	it('simple map', ()=>{
		const initialObject = {
			id: 1
			, fake_tests: [
				{
					id: 1
				}
			]
		};
		const globe = Map({
			tests: Map({
				1: Map({
					id: 1
					, fake_testsTWR: List(['1'])
				})
			}),
			fake_tests: Map({
				1: Map({
					id: 1
				})
			}),
		});
		expect(combineMappedStates(fromJS(initialObject), List(['tests', '1']))).to.equal(globe);	
	});

	it('simple', ()=>{
		const initialObject = {
			id: 1
			, fake_tests: [
				{id: 1}
			]
		};
		const globe = Map({
			tests: Map({
				1: Map({
					id: 1
					, fake_testsTWR: List(['1'])
					

				})
			}),
			fake_tests: Map({
				1: Map({
					id: 1
					
				})
			}),
		});

		expect(combineMappedStates(fromJS(initialObject), List(['tests', '1']), Map())).to.equal(globe);	
	});

	it('simple w/ single', ()=>{
		const initialObject = {
			id: 1
			, child: 
				{id: 1}
		};
		const globe = Map({
			tests: Map({
				1: Map({
					id: 1
					, childTWR: '1'
				})
			}),
			children: Map({
				1: Map({
					id: 1
				})
			}),
		});

		expect(combineMappedStates(fromJS(initialObject), List(['tests', '1']), Map())).to.equal(globe);	
	});

	it('deep relations', ()=>{
		const faker_tests = [{id: 1}];
		const fake_tests = [
				{
					id: 1
					, faker_tests
				}
			];
		const initialObject = {
			id: 1
			, fake_tests
		};
		const globe = Map({
			tests: Map({
				1: Map({
					id: 1
					, fake_testsTWR: List(['1'])
				})
			}),
			fake_tests: Map({
				1: Map({
					id: 1
					, faker_tests: List([Map({id: 1})])
					, faker_testsTWR: List(['1'])

				})
			}),
			faker_tests: Map({
				1: Map({
					id: 1
				})
			}),
		});


		expect(combineMappedStates(fromJS(initialObject), List(['tests', '1']), Map())).to.equal(globe);	
	});
	it('array', ()=>{
		const initialObject = [{
			id: 1
		}];
		const globe = Map({
			tests: Map({
					1: Map({
						id: 1
					})
				})
		});


		expect(combineMappedStates(fromJS(initialObject), List(['tests']), Map())).to.equal(globe);	
	});
	it('array with relations', ()=>{
		const fake_tests = [{id: 1}];
		const initialObject = [{
			id: 1,
			fake_tests
		}];
		const globe = Map({
			tests: Map({
					1: Map({
						id: 1
						, fake_tests: List([Map({id: 1})])
						, fake_testsTWR: List(['1'])
					})
				}),
			fake_tests: Map({
					1: Map({
						id: 1
					})
				})
		});
		expect(combineMappedStates(fromJS(initialObject), List(['tests']), Map())).to.equal(globe);
	})
	it('regularjs', ()=>{
		const fake_tests = [{id: 1}];
		const initialObject = [{
			id: 1,
			fake_tests
		}];
		const globe = Map({
			tests: Map({
					1: Map({
						id: 1
						, fake_tests: List([Map({id: 1})])
						, fake_testsTWR: List(['1'])
					})
				}),
			fake_tests: Map({
					1: Map({
						id: 1
					})
				})
		});
		expect(combineMappedStates(initialObject, List(['tests']), Map())).to.equal(globe);
	})
	describe('idArray', ()=>{	
		it('success', ()=>{
			expect(  is(idArray( fromJS([{id: 1}]) ), List(['1']) )).to.be.truth	
		})
		it('failure', ()=>{
			expect(()=>idArray()).to.throw(Error);	
		})
	});

	describe('createOrderedMap', ()=>{	
		it('success', ()=>{
			expect(  is(createOrderedMap( fromJS([{id: 1}]) ), OrderedMap([['1', {id: 1}]]) ) ).to.be.truth
		});
		it('failure', ()=>{
			expect(()=>createOrderedMap()).to.throw(Error);	
		})
	});
		
	describe('createMapObject', ()=>{
		it('many relation', ()=>{
			const test = {id: 1}
			expect(Map(
				createMapObject( 'fake_tests',  fromJS([test]), List(['tests', '1'])))
			).to.equal(Map(
				{
					thisTree: List(['tests', '1', 'fake_testsTWR']),
					nextTree: List(['fake_tests']),
					nextObject: OrderedMap([['1', Map(test)]]),
					thisObject: List(['1']),
				}
			));
		});
		it('single relation', ()=>{
			const test = {id: 1}
			expect(Map(
				createMapObject( 'fake_test',  fromJS(test), List(['tests', '1'])))
			).to.equal(Map(
				{
					thisTree: List(['tests', '1', 'fake_testTWR']),
					nextTree: List(['fake_tests']),
					nextObject: OrderedMap([['1', Map(test)]]),
					thisObject: '1',
				}
			));
		});
		it('no relation', ()=>{
			const test = [1, 2, 3];
			expect(Map(
				createMapObject( 'fake_test',  fromJS(test), List(['tests', '1']))
			)).to.equal(Map(
				{
					thisTree: List(['tests', '1', 'fake_test']),
					nextTree: List(['tests', '1', 'fake_test']),
					nextObject: List(test),
					thisObject: List(test),
				}
			));
		});
		it('is tree', ()=>{
			const test = [1, 2, 3];
			expect(
				createMapObject( 'tree')
			).to.eql({skip: true});
		});
		it('throw error', ()=>{
			const test = [1, 2, 3];
			expect(
				()=>createMapObject( 'throw error', test)
			).to.throw(Error);
		});
	})
	
	describe('setNextObject', ()=>{
		it('success', ()=>{
			const mapState = stub(factory, 'mapState');
			const mapObject = {nextObject: Map({happiness: true}), nextTree: List(['users', '1', 'properties'])};
			const globe = Map();
			setNextObject(globe, mapObject);
			expect(mapState).to.have.been.calledWith(mapObject.nextObject, mapObject.nextTree, globe);
			mapState.restore();
		});
		it('failure', ()=>{
			const mapObject = {nextObject: Map({happiness: true}), nextTree: List(['users', '1', 'properties'])};
			const globe = {};
			expect(()=>setNextObject(globe, mapObject)).to.throw(Error);
		})
		
	});
});