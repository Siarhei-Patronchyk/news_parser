var express = require('express');
var exphbs = require('express-handlebars');
var request = require('request');
var cheerio = require('cheerio');
var iconv = require('iconv-lite');
var cronJob = require('cron').CronJob;
var app = express();
var news;
var newsOnliner;
var newsTut;
app.engine('handlebars', exphbs({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');
app.use('/static', express.static('public'));

function requestParser(){
	request({url:'http://nn.by/?c=ca&i=559', encoding: 'binary'}, function(err, res, body) {
	if(err) {
		console.log(err);
	}
	else {
		var $ = cheerio.load(
			iconv.encode(
				iconv.decode(
					new Buffer(body, 'binary'),
					'win1251'),
				'utf8')
			);
		news = [];
		$('.list-headline').each(function(){
			news.push({
				title: $('.list-headline .title a', this).text(),
				img: $('.grid_1 .image-container img', this).attr('data-image-src'),
				url:'http://nn.by' + $('.title a', this).attr('href')
			});
		})
	}
	});
	request({url:'http://people.onliner.by', encoding: null}, function(err, res, body) {
		if(err) {
			console.log(err);
		}
		else {
			var $ = cheerio.load(body);
			newsOnliner = [];
			$('article.b-posts-1-item').each(function(){
				newsOnliner.push({
					title: $('h3 a span', this).text(),
					img: $('article figure a img', this).attr('src'),
					url:$('.b-posts-1-item__text a', this).attr('href')
				});
			})
		}
	});
	request({url:'http://news.tut.by', encoding: null}, function(err, res, body) {
		if(err) {
			console.log(err);
		}
		else {
			var $ = cheerio.load(body);
			newsTut = [];
			$('.lists__li').each(function(){
				newsTut.push({
					title: $('.lists__li a', this).text(),
					img: $('.media img', this).attr('src'),
					url:$('.media a', this).attr('href')
				});
			})
		}
	});
}
requestParser();

app.get('/', function (req,res) {
	res.render("home", {news: news, newsOnliner: newsOnliner, newsTut: newsTut});
})

var server = app.listen(8080, function() {
	console.log('Server is running a http://localhost:' + server.address().port);
})