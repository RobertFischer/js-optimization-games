'use strict';

// Ensure JavaScript works like I think it does
if(typeof "foo" !== "string") throw new Error("A string does not have expected typeof");

const { suite, benchmark, times } = require('cathedra');
const _ = require("lodash");

const _toString = _.toString;
const _isString = _.isString;

const sideEffect = [];
const randomArraySize = 1000;
const pushSideEffect = (it) => {
	sideEffect.push(it);
	sideEffect.length = sideEffect.length % randomArraySize;
	return it;
}

const generateDatum = (i) => {
	const rand = Math.random();
	if(rand < 0.3) {
		return { [i]: rand };
	} else if (rand < 0.6) {
		return _.toString(rand);
	} else {
		return [ i, rand ];
	}
}


const lodashDerefToString = (arg) => pushSideEffect(_.toString(arg));
const lodashDirectToString = (arg) => pushSideEffect(_.toString(arg));
const emptyStringAddition = (arg) => pushSideEffect("" + arg);
const toStringMethod = (arg) => pushSideEffect(arg.toString());
const toStringWithTypeofCheck = (arg) => pushSideEffect(typeof arg === "string" ? arg : arg.toString());
const toStringWithLodashDirectCheck = (arg) => pushSideEffect(_isString(arg) ? arg : arg.toString());
const toStringWithLodashDerefCheck = (arg) => pushSideEffect(_.isString(arg) ? arg : arg.toString());
const constructString = (arg) => pushSideEffect(String(arg));
const toStringWithTypeofCheckAndAssignment = (arg) => {
	if(typeof arg !== 'string') arg = arg.toString();
	pushSideEffect(arg);
}

module.exports = suite(
	benchmark(lodashDerefToString)({ name: '_.toString (Lodash; dereference)' }),
	benchmark(lodashDirectToString)({ name: '_toString (Lodash; direct call)' }),
	benchmark(emptyStringAddition)({ name: '"" + arg (string coercion through addition operator)' }),
	benchmark(toStringMethod)({ name: 'arg.toString() (blind .toString() method call; no type checking)' }),
	benchmark(toStringWithTypeofCheck)({ name: 'typeof arg === "string" ? arg : arg.toString() ; (.toString() method call with typeof sanity check in ternary operator)' }),
	benchmark(toStringWithTypeofCheckAndAssignment)({ name: 'if(typeof arg !== "string") arg = arg.toString() (.toString() method call with typeof sanity check in if block)' }),
	benchmark(toStringWithLodashDirectCheck)({ name: '_isString(arg) (.toString() method call with direct Lodash _.isString() sanity check)' }),
	benchmark(toStringWithLodashDerefCheck)({ name: '_.isString(arg) (.toString() method call with dereferenced Lodash _.isString() sanity check)' }),
	benchmark(constructString)({ name: 'String(arg) (String constructor; no type checking)' }),
)({
	name: 'Testing toString Implementations',
	until: times(10000),
	initialize: () => [ _.times(randomArraySize, generateDatum) ],
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


