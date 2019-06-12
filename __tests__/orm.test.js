//
// Copyright Platformers (C) 2019
//

const path = require('path');
const expect = require('expect-puppeteer');

beforeAll(async () => {
  jest.setTimeout(300 * 1000);
  await page.setViewport({
    width: 1280,
    height: 720,
  });
  await page.goto('https://www.upvise.com/uws', {waitUntil: 'domcontentloaded'});
  await page.addScriptTag({
    path: path.join(__dirname, '..', 'index.js'),
    type: 'text/javascript',
  });
});

test('it should load upvise', async () => {
  await page.type('#email', 'civil@verticalmatters.com.au');
  await page.type('#password', 'vm@2016');
  await page.screenshot({path: 'test.png'});
  await page.click('#signin');
  await page.screenshot({path: 'test2.png'});
  await page.waitForSelector('#fileElem', { timeout: 300 * 1000 });
  await page.screenshot({path: 'test3.png'});

  const forms = await page.evaluate(() => {
    const res = B.Forms.select({templateid: '25023FEA903539EA66D61A96D6775C'}, 'date');
    return res.toObject();
  });

  console.log('all forms', forms);
  console.log('first form', forms[0]);
  console.log('number of forms', forms.length);
});
