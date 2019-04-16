'use strict';

// Ensure JavaScript works like I think it does
if(typeof "foo" !== "string") throw new Error("A string does not have expected typeof");

const { suite, benchmark, times } = require('cathedra');
const _ = require("lodash");

const EMPTY_LIST = [];

const _isEmpty = _.isEmpty;

const sideEffect = [];
const randomArraySize = 1000;
const pushSideEffect = (it) => {
	sideEffect.push(it);
	sideEffect.length = sideEffect.length % randomArraySize;
	return it;
}

const generateDatum = () => {
	const length = Math.floor(Math.random() * 10);
	return _.times(length, _.stubTrue);
}

const lodashDerefIsEmpty = (arg) => pushSideEffect(_.isEmpty(arg));
const lodashDirectIsEmpty = (arg) => pushSideEffect(_isEmpty(arg));
const eqEmptyListInline = (arg) => pushSideEffect(arg === []);
const eqEmptyListConstant = (arg) => pushSideEffect(arg === EMPTY_LIST);
const lengthNEZero = (arg) => pushSideEffect(arg.length !== 0);
const lengthGTZero = (arg) => pushSideEffect(arg.length > 0);
const lengthImplicit = (arg) => pushSideEffect(!!arg.length);
const lengthToBoolean = (arg) => pushSideEffect(Boolean(arg.length));

module.exports = suite(
	benchmark(lodashDerefIsEmpty)({ name: '_.isEmpty (Lodash; dereference)' }),
	benchmark(lodashDirectIsEmpty)({ name: '_isEmpty (Lodash; direct)' }),
	benchmark(eqEmptyListInline)({ name: '=== [] (equals empty array; inline)' }),
	benchmark(eqEmptyListConstant)({ name: '=== EMPTY_ARRAY (equals empty array; constant)' }),
	benchmark(lengthNEZero)({ name: '.length !== 0 (length does not equal zero)' }),
	benchmark(lengthGTZero)({ name: '.length > 0 (length is greater than zero)' }),
	benchmark(lengthImplicit)({ name: '.length (length, used as implicit boolean check)' }),
	benchmark(lengthToBoolean)({ name: 'Boolean(.length) (length, explicitly cast to boolean)' }),
)({
	name: 'Testing Array Equals Implementations',
	until: times(1000000),
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


