/**
 * Dependencies
 */

var request = require('request'),
    _ = require('underscore'),
    debug = require('debug')('spidercheck'),
    cheerio = require('cheerio'),
    util = require('util'),
    url = require('url');

/**
 * SpiderChecker: Web Crawler EventEmitter
 * @param {String} origin URL
 */
var SpiderChecker = function(origin) {

  this.crawled = {};
  this.queue = [];
  this.current = false;

  return this;
};

util.inherits(SpiderChecker, require('events').EventEmitter);

/**
 * Checks if URL is valid
 * @param  {String} uri
 * @return {Boolean}     True if valid url
 */
SpiderChecker.prototype._crawlEligible = function(uri) {
  debug('_crawlEligible(%j)', url);
  if(this.crawled[url]) return false;
  if(this.current == url) return false;
  if(this.queue.indexOf(url) !== -1) return false;
  if(!url.parse(uri).protocol.match(/^https?/)) return false;
  return true;
};

/**
 * Gets next item in queue
 */
SpiderChecker.prototype._crawl = function() {
  debug('_crawl()');

  if(this.queue.length === 0)
    return console.log('No Work Left');

  var _this = this;
  this.current = this.queue.shift();
  request(this.current, function(err, res, body) {
    if(err) {
      _this.emit('error', err);
    } else {
      _this.emit('crawl', res.statusCode, _this.current, res);
      _this._parseBody(body, _this.current);
    }
    _this.crawled[_this.current] = true;
    _this.current = false;
    _this._crawl();
  });
};

/**
 * Finds and add links to queue from HTML doc
 * @param  {String} body      HTML String from HTTP res
 * @param  {String} originUrl Used to resolve relative URLs
 * @return {Bool}
 */
SpiderChecker.prototype._parseBody = function(body, originUrl) {
  debug('_parseBody(%j)', body);
  var _this = this;

  var $ = cheerio.load(body);
  $('a[href]').each(function(id, a) {

    try {
      _this.addURL(url.resolve(originUrl, $(a).attr('href')));
    } catch(e) {
      _this.emit('error', e);
    }
  });

  return true;
};

/**
 * Adds URL to Crawl queue
 * @param {String} url
 * @return {false|number} false if unaccepted else number in queue
 */
SpiderChecker.prototype.addURL = function(url) {
  debug('addURL(%j)', url);
  if(!this._crawlEligible(url)) return false;
  return this.queue.push(url);
};

module.exports = SpiderChecker;