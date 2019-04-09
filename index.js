const bench = require("fen-bench")();
const _ = require("lodash");

const random1000 = _.times(1000, () => Math.random());

bench.testDuration = 1000;
bench.pauseDuration = 10;
bench.maxMeasurements = 100;

bench.testCases.push({
	name: 'Lodash forEach',
	fn: () => _.forEach(random1000, _.noop),
});

bench.testCases.push({
	name: 'Native forEach',
	fn: () => random1000.forEach(_.noop),
});

bench.start();


