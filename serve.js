var path = require('path');
var exec = require('child_process').exec;

var gitEmit = require('git-emit');
var pushover = require('pushover');
var connect = require('connect');
var log = require('logged')(__filename);

var homePath = process.env.HOME;

//path to folder containing 'bare' github repos
var reposPath = path.join(homePath, 'repo');

//initialize pushover with the parent repository path
var repos = pushover(reposPath);

var app = connect();

app.use(connect.basicAuth(process.env.PUSHOVER_USER, process.env.PUSHOVER_PASSWORD));

//log request and pass it off to pushover
app.use(function(req, res, next) {
  log.info('Handling request for repo', req.url);
  repos.handle(req, res, next);
});

app.listen(8010, function() {
  log.info('Listening on', 8010);
});

log.debug('Watching repositories', reposPath);

repos.list(function(err, list) {

  if(err) return log.error('Error listing repos', err);

  log.debug('Repo list', list);

  list.forEach(function(repo) {
    //path to individual repository
    var repoPath = path.join(reposPath, repo);

    //opinionated path where production code is housed
    var deployPath = path.join(homePath, 'src/web', repo);

    var paths = { repo: repoPath, deploy: deployPath };
    log.info('watching ', paths);

    //set up post-recieve hook on repo
    var em = gitEmit(repoPath);

    em.on('post-receive', function() {
      log.debug('git post-receive', { repo: repo });
      log.info('updating deployed version', paths);

      //execute a git pull within the deployPath
      //and then execute an npm install
      //this assumes the deploye folder has a `production` branch
      var command = 'git pull production master && /home/bmc/local/node/bin/npm install';
      var options = { cwd: deployPath };

      exec(command, options, function(error, stdout, stderr) {
        if(error) {
          return log.error(command, { error: error, stdout: stdout, stderr: stderr });
        }

        log.debug(command, {stdout: stdout, stderr: stderr });
        
        //restart upstart process with the same name
        var cmd = 'initctl restart ' + repo;
        log.info('restarting upstart process', cmd);

        exec(cmd, function(err, stdout, stderr) {
          log.debug('restarted', { error: err, stdout: stdout, stderr: stderr });
        });

      });
    });
  });
});

