'use strict';

const { suite, benchmark, times } = require('cathedra');
const _ = require("lodash");

const _forEach = _.forEach;

const sideEffect = [];
const randomArraySize = 1000;
const pushSideEffect = (it) => {
	sideEffect.push(it);
	sideEffect.length = sideEffect.length % randomArraySize;
}

const lodashForEachDeref = (arg) => _.forEach(arg, pushSideEffect);
const lodashForEachDirect = (arg) => _forEach(arg, pushSideEffect);
const nativeForEach = (arg) => arg.forEach(pushSideEffect);
const nativeForInLoop = (arg) => {
	for(var anArg in arg) {
		pushSideEffect(anArg);
	}
};
const nativeIteratingLoop = (arg) => {
	for(var i = 0; i < arg.length; i++) {
		pushSideEffect(arg[i]);
	}
};

module.exports = suite(
	benchmark(nativeIteratingLoop)({ name: 'for(val i = 0; i < arg.length; i++) (native for-loop iteration)' }),
	benchmark(nativeForInLoop)({ name: 'for(const val in arg) (native for...in-loop)' }),
	benchmark(nativeForEach)({ name: 'arg.forEach (native .forEach)' }),
	benchmark(lodashForEachDeref)({ name: '_.forEach (Lodash; with dereference)' }),
	benchmark(lodashForEachDirect)({ name: '_forEach (Lodash; no dereference)' }),
)({
	name: 'Testing forEach Implementations',
	until: times(10000),
	initialize: () => [ _.times(randomArraySize, Math.random()) ],
	before: (randomArray) => {
		if(_.isEmpty(randomArray)) {
			throw new Error(`Random array is empty?!?`);
		}

		// Exercise making the array big, and then clear it out.
		// This should smooth out the GC and get rid of any caching advantages of later tests.
		randomArray.forEach(pushSideEffect);
		sideEffect.length = 0;
	},
	after: (randomArray) => {
		sideEffect.length = 0;
	}
});


