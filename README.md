# SpiderCheck

basic web crawler

## var spider = new SpiderCheck()

### Events

* 'error' - (error)
* 'crawl' - (statusCode, url, res)

### spider.addURL(url)

add a URL to the crawl queue

### spider._crawl()

start crawling