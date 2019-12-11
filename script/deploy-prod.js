//
// Copyright Billow Software (C) 2019
//

const UpviseClient = require('upvise-client');
const fs = require('fs');
const path = require('path');

const config = require('../config.json');
const B = require('../index');
const js = fs.readFileSync(path.join(__dirname, '..', 'build-prod', 'index.js'));

const deploy = async () => {
  for (const database of config.databases) {
    const {
      email,
      password,
      url,
      version,
    } = database;

    const upvise = new UpviseClient(url);
    console.log('Looking at ' + email);
    const user = await upvise.authenticate(email, password);
    console.log('Signed into ' + user.companyName);

    if (version === '*') {
      console.log('Deploying latest version of Billow.js to ' + user.companyName);
      await upvise.update('System.globalsettings', 'billow-software.billow.js', {
        name: B.VERSION,
        value: js,
      });
      continue;
    }

    const deployed = await upvise.selectId('System.globalsettings', 'billow-software.billow.js');
    const deployedVersion = deployed.name;

    if (B.VERSION === deployedVersion || B.VERSION === version) {
      console.log('Deploying version ' + version + ' to ' + user.companyName);
      await upvise.update('System.globalsettings', 'billow-software.billow.js', {
        value: js,
      });
    } else {
      console.log('Moving on. Specified version ' + version + ' is already deployed to ' + user.companyName);
    }
  }
};

if (require.main === module) {
  deploy();
}
