import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  computePrice,
  isPaidOrder,
  GROUP_SIZE_THRESHOLD,
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
  assert.equal(computePrice(100001, GROUP_SIZE_THRESHOLD).amount, 75001);
});

test('módulos 1-3 gratis, 4+ pagos', () => {
  assert.equal(isPaidOrder(1), false);
  assert.equal(isPaidOrder(3), false);
  assert.equal(isPaidOrder(4), true);
  assert.equal(isPaidOrder(13), true);
});
