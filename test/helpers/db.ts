// Ensure we're immediately using the right DB

import { before, after, beforeEach, afterEach } from 'mocha';
import { stub } from 'sinon';

import db from '../../app/util/db';

const tables = ['jobs'];

/**
 * Truncates all database tables
 *
 * @returns {Promise<void>} A promise that resolves to nothing on completion
 */
export async function truncateAll(): Promise<void> {
  await Promise.all(tables.map((t) => db(t).truncate()));
}

before(async function () {
  await db.migrate.latest();
  // Truncate all tables
  await truncateAll();
});

/**
 * before/after hooks to ensure a transaction exists in `this.trx`.
 * If one already exists, does nothing.  If none exists, creates one.
 * Rolls back the transaction during the after hook
 *
 * @returns {void}
 */
export function hookTransaction(): void {
  let transactionSet = false;
  before(async function () {
    transactionSet = !this.trx;
    this.trx = this.trx || await db.transaction();
  });

  after(async function () {
    if (transactionSet && this.trx) {
      await this.trx.rollback();
      delete this.trx;
    }
  });
}

/**
 * beforeEach/afterEach hooks to ensure a transaction exists in `this.trx`.
 * If one already exists, does nothing.  If none exists, creates one.
 * Rolls back the transaction during the after hook
 *
 * @returns {void}
 */
export function hookTransactionEach(): void {
  let transactionSet = false;
  beforeEach(async function () {
    transactionSet = !this.trx;
    this.trx = this.trx || await db.transaction();
  });

  afterEach(async function () {
    if (transactionSet && this.trx) {
      await this.trx.rollback();
      delete this.trx;
    }
  });
}

/**
 * Before/after hooks to have calls to create a database transaction throw an exception for
 * just that test.
 *
 * @returns {void}
 */
export function hookTransactionFailure(): void {
  let txStub;
  before(function () {
    txStub = stub(db, 'transaction').throws();
  });
  after(function () {
    txStub.restore();
  });
}
