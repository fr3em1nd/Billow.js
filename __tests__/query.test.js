//
// Copyright Billow Software (C) 2019
//

//
// This fixes an issue with Puppeteer and ES6 functions.
// See here: https://github.com/facebook/jest/issues/3126#issuecomment-345949328
//
require('babel-polyfill');

const path = require('path');
const toBeType = require('jest-tobetype');
const pti = require('puppeteer-to-istanbul');
expect.extend(toBeType);

beforeAll(async () => {
  jest.setTimeout(300 * 1000);
  await page.coverage.startJSCoverage(),
  await page.setViewport({
    width: 1280,
    height: 720,
  });
  await page.goto('https://www.upvise.com/uws', {waitUntil: 'domcontentloaded'});
  await page.addScriptTag({
    path: path.join(__dirname, '..', 'build-dev', 'index.js'),
    type: 'text/javascript',
  });
  await page.type('#email', 'civil@verticalmatters.com.au');
  await page.type('#password', 'vm@2016');
  await page.click('#signin');
  await page.waitForSelector('#fileElem', { timeout: 300 * 1000 });
});

afterAll(async () => {
  const js = await page.coverage.stopJSCoverage();
  pti.write(js);
});

test('B.query.select()', async () => {
  const list = await page.evaluate(() => {
    return B.query.select('Forms.forms', 'date ASC');
  });

  expect(list).toBeType('array');
  expect(list.length > 1).toBe(true);

  const list2 = await page.evaluate(() => {
    return B.query.select('Forms.some_nonexistant_table', 'date ASC');
  });

  expect(list2).toBeType('array');
  expect(list2.length === 0).toBe(true);
  expect(list2).toEqual([]);
});
