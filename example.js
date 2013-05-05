
var SpiderCheck = require('./');

var spider = new SpiderCheck(),
    red   = '\033[31m',
    blue  = '\033[34m',
    reset = '\033[0m';

spider.on('error', function(error) {
  console.error(error);
});

spider.on('crawl', function(statusCode, url, res) {
  console.log(((statusCode !== 200) ? red : '') + res.statusCode + ' ' + url + reset);
});

spider.addURL('http://bensbit.co.uk');

spider._crawl();