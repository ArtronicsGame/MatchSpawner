module.exports = {
  apps: [{
    name: 'MatchSpawner',
    script: 'app.js',

    instances: 1,
    autorestart: true
  }]
};
