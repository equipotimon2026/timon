import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  computePrice,
  isPaidOrder,
  DEFAULT_GROUP_SIZE_THRESHOLD,
} from '../payment-pricing';

test('sin grupo: precio lleno', () => {
  assert.deepEqual(computePrice(150000, 1), {
    baseAmount: 150000,
    amount: 150000,
    discountPct: 0,
  });
});

test('grupo de 3: sin descuento', () => {
  assert.equal(computePrice(150000, 3).amount, 150000);
});

test('grupo de 4: 25% off', () => {
  assert.deepEqual(computePrice(150000, 4), {
    baseAmount: 150000,
    amount: 112500,
    discountPct: 25,
  });
});

test('grupo de 7: mismo 25%', () => {
  assert.equal(computePrice(150000, 7).amount, 112500);
});

test('redondeo: montos no enteros se redondean a entero', () => {
  // 100001 * 0.75 = 75000.75 → 75001
  assert.equal(computePrice(100001, DEFAULT_GROUP_SIZE_THRESHOLD).amount, 75001);
});

test('módulos 1-3 gratis, 4+ pagos', () => {
  assert.equal(isPaidOrder(1), false);
  assert.equal(isPaidOrder(3), false);
  assert.equal(isPaidOrder(4), true);
  assert.equal(isPaidOrder(13), true);
});

test('threshold configurable: grupo de 3 con threshold 3 → descuento', () => {
  assert.equal(computePrice(150000, 3, 3, 25).amount, 112500);
});

test('discount configurable: 50% off', () => {
  assert.deepEqual(computePrice(150000, 4, 4, 50), { baseAmount: 150000, amount: 75000, discountPct: 50 });
});
