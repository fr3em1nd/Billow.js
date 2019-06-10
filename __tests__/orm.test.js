//
// Copyright Platformers (C) 2019
//

// const fs = require('fs');
// const path = require('path');
const expect = require('expect-puppeteer');
// const billowSrc = fs.readFileSync(path.join(__dirname, '..', 'index.js'));

beforeAll(async () => {
  jest.setTimeout(300 * 1000);
  await page.goto('https://www.upvise.com/uws', {waitUntil: 'domcontentloaded'});
});

test('it should load upvise', async () => {
  await page.type('#email', 'civil@verticalmatters.com.au');
  await page.type('#password', 'vm@2016');
  await page.screenshot({path: 'test.png'});
  await page.click('#signin');
  await page.screenshot({path: 'test2.png'});
  await page.waitForSelector('#fileElem', { timeout: 300 * 1000 });
  await page.screenshot({path: 'test3.png'});

  //
  // Failed attempt to use Billow.js in the headless environment:
  //
  // const forms = await page.evaluate((billowSrc) => {
  //   eval(billowSrc); // potentially evil but this is a test environment (for now)
  //   return window.B.Forms.select({templateid: '25023FEA903539EA66D61A96D6775C'}, 'date')
  // }, billowSrc);

  const forms = await page.evaluate(() => {
    return Query.select('Forms.forms', '*', 'templateid="25023FEA903539EA66D61A96D6775C"', 'date');
  });

  console.log(forms);
});
