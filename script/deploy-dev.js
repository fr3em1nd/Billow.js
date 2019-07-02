//
// Copyright Platformers (C) 2019
//

const UpviseClient = require('upvise-client');
const fs = require('fs');
const path = require('path');

const B = require('../index');
const js = fs.readFileSync(path.join(__dirname, '..', 'build-dev', 'index.js'));

const deploy = async () => {
  B.logger.log('Deploying Billow.js to the civil test database');
  const upvise = new UpviseClient('https://www.upvise.com/uws');
  await upvise.authenticate('civil@verticalmatters.com.au', 'vm@2016');

  await upvise.update('System.globalsettings', 'billow-software.billow.js', {
    name: B.VERSION,
    value: js,
  });
};

if (require.main === module) {
  deploy();
}
