# Billow.js

A collection of utility functions designed to make developing inside Upvise easier.

# Usage

1. Deploy `Billow.js` to the Upvise database where you want to use it, by adding it to the `config.json` file and then running `npm run deploy`.
2. Load Billow.js using the following snippet (anywhere in your code)
3. win!

```javascript
//
// Load Billow.js
//
(function loadBillowJs() {
  var item = Query.selectId('System.globalsettings', 'billow-software.billow.js');
  if (!item) {
    console.error('Billow.js not deployed to this database');
    return;
  }
  if ((window.B && window.B.VERSION !== item.name) || !window.B) {
    eval(item.value);
  }
})();
```

# Goals

1. Create a standard library of functions commonly needed when developing dashboards and form workflows in Upvise.
2. Improve reliability of our implementations by writing unit tests for these utilities.
3. Have more control over our addons by using our own functions rather than relying on Upvise.

**Note:** Due to the business wanting to move away from developing inside Upvise, we don't want to spend too much time on this project. However, this library can be developed alongside maintenance of existing works.

# Technical Requirements

1. Everything needs to be tested (this is crucial)
2. BILLOW.js must work in Node.js as well as the Browser. This means setting up a build system to combine everything into one minified file.
3. BILLOW.js will be deployed to different databases by saving the source in `System.globalsettings` (with `id` `billow-js-v-x.x.x`)
4. This deploy process will be automatic, involving an [upvise-client](VerticalMatters/upvise-client) script as well as a list of all the databases where BILLOW.js should be deployed to.
4. The version of BILLOW.js to load will be saved in `System.globalsettings` with the id `billow-js-version`
5. When a new version of BILLOW.js is deployed, it will be saved in the appropriate `System.globalsettings` column and the `billow-js-version` will be updated.
6. New BILLOW.js versions will be detected by an async process that checks the `billow-js-version` setting against the `BILLOW.version` attribute. If there's a difference then `eval()` the new code. (this part is unsafe but Upvise does it all the time)
7. BILLOW.js will be initially loaded by a snippet that checks if it exists and then acts accordingly. I'm not 100% sure where in Upvise to put this snippet. One possibility is to put it everywhere that BILLOW.js is used, however I feel like something more economical is possible. This point requires more thought...

# Documentation

To be implemented...

# License

Copyright Vertical Matters (C) 2019
