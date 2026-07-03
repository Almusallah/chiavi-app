'use strict';
const { seed } = require('../lib/seed');
const result = seed({ force: true });
console.log(`Seeded ${result.cars} cars.`);
