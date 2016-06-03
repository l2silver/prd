import {expect} from 'chai';
import sinon, {stub, spy} from 'sinon';
import {
	factory,
	prd,
} from '../src/getDatabase';
import {Range, fromJS, Map, OrderedMap, List, Seq, is} from 'immutable';
import inflect from 'i';
const {setEntry, prdTable, prdFirstInstance, getRelation, setState, getState, findEntry, getFromGlobe, getMany} = factory;
const state = fromJS({users: {1: {id: 1}}})
describe('getDatabase', ()=>{
	it('prdTable', ()=>{
		expect(prdTable('table')).to.eql(['table']);
		expect(prdTable(['table'])).to.eql(['table']);
	});
	it('prdFirstInstance', ()=>{
		expect(prdFirstInstance(Map())).to.eql(Map());
		expect(prdFirstInstance()).to.eql('none');
	});
	it('setState', ()=>{
		setState(Map())
		expect(factory.state).to.equal(Map());
	});
	it('getState', ()=>{
		factory.state = Map();
		expect(factory.getState()).to.equal(Map());
	});
	describe('getRelation', ()=>{
		it('previousExists', ()=>{
			var findEntryStub = stub(factory, 'findEntry');
			getRelation(Map());
			expect(findEntryStub.calledOnce).to.be.true;
			findEntryStub.restore();
		});
		it('previousInstanceDoesNotExist', ()=>{
			const state = fromJS({users: {1: {id:1}}})
			setState(state);
			expect(getRelation('none', 'users')).to.equal(state.get('users'));
		});
		it('previousInstanceNonTrue', ()=>{
			const state = fromJS({users: {1: {id:1}}})
			setState(state);
			expect(getRelation(false, 'users')).to.be.false;
		});
	});
	describe('findEntry', ()=>{
		it('entry has relationalInfo', ()=>{
			const previousInstance = Map({usersPRD: 1});
			const getFromGlobe = stub(factory, 'getFromGlobe');
			findEntry(previousInstance, 'users');
			expect(getFromGlobe).to.have.been.calledWith('users', 1);
			getFromGlobe.restore();
		})
		it('finds has no relationalInfo', ()=>{
			const previousInstance = fromJS({users: 'pie'})
			expect(findEntry(previousInstance, 'users')).to.be.equal('pie');
		})
		
	});
	describe('getFromGlobe', ()=>{
		const state = fromJS({users: {1: {id: 1}}})
		factory.setState(state);
		it('many', ()=>{
			expect(getFromGlobe('users', List([1]))).to.equal(OrderedMap({1: Map({id: 1})}));
		})
		it('single', ()=>{
			expect(getFromGlobe('users', 1)).to.equal( Map({id: 1}) );
		})
		it('undefined', ()=>{
			expect(getFromGlobe('users', 2)).to.equal( undefined );
		})
	});
	describe('getMany', ()=>{
		factory.setEntry('users');
		it('has instance', ()=>{
			factory.setState(state);
			expect(getMany(OrderedMap(), 1)).to.equal(OrderedMap({1: Map({id: 1})}))
		})
		it('has instance with deleted at', ()=>{
			factory.setState(Map({users: Map({1: Map({id: 1, deleted_at: true})})}));
			expect(getMany(OrderedMap(), 1)).to.equal(OrderedMap());
		})
		it('has no instance', ()=>{
			factory.setState(Map({users: Map({1: undefined})}));
			expect(getMany(OrderedMap(), 1)).to.equal(OrderedMap());	
		})
	})
	describe('prd', ()=>{
		let prdTable;
		let	prdFirstInstance;
		let	getRelation;
		beforeEach(()=>{
			prdTable = spy(factory, 'prdTable');
			prdFirstInstance = spy(factory, 'prdFirstInstance');
			getRelation = spy(factory, 'getRelation');
		})
		afterEach(()=>{
			prdTable.restore();
			prdFirstInstance.restore();
			getRelation.restore();	
		})
		it('success', ()=>{
			prd(state, 'users', Map());
			expect(prdTable).to.have.been.calledOnce;
			expect(prdFirstInstance).to.have.been.calledOnce;
			expect(getRelation).to.have.been.calledOnce;
		})
		it('error', ()=>{
			expect(()=>prd()).to.throw(Error);
		})
	});
});