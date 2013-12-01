var settings = {
	last_visited: 0,
	recognition: null
}
var start_speech = function() {
	settings.recognition 					= new webkitSpeechRecognition();
	settings.recognition.continous 			= false;
	settings.recognition.interimResults 	= true;
	settings.recognition.lang = 'en-US';
	settings.recognition.onresult = function(event) {
		var results = event.results[0];
		console.log(results[0]);
		if (results.isFinal) {
			console.log('final')
			evaluate_command(results);
		}
		show_live_results(results[0]);
		document.querySelector('.voice-container').classList.add('voice-visible')
	}
	settings.recognition.onend = function() {
		console.log('ended', settings.recognition)
		if (!document.webkitHidden) {
			settings.recognition.start();
		}
	}
	settings.recognition.start();
}
var evaluate_command = function(result) {
	var phrase = replace_google_errors(result[0].transcript),
		mstillstartsagain = 1000;
	if (phrase.substr(0,7) == 'reddit ') {
		phrase = phrase.substr(7);
	}
	if (phrase.substr(0,10) == 'ok reddit ') {
		phrase = phrase.substr(10);
	}
	/*
		'select post 10'
	*/
	if (phrase.match(new RegExp(/select post [0-9]+/i))) {
		var numberselected = parseInt(phrase.substr('select post '.length));
		select_post(numberselected);
		voice_finished();
	}
	/*
		'next post'
		'next'
	*/
	if (phrase.match(new RegExp(/next post/)) || phrase.match(new RegExp(/next/))) {
		select_post(settings.last_visited + 1);
		voice_finished();
	}
	/*
		'previous post'
	*/
	if (phrase.match(new RegExp(/previous post/)) || phrase.match(new RegExp(/previous/))) {
		select_post(settings.last_visited - 1);
		voice_finished();
	}
	/*
		'go to subreddit technology'
	*/
	if (phrase.match (new RegExp(/go to subreddit [a-zA-Z_]/i))) {
		var subredditselected = phrase.substr('go to subreddit '.length);
		window.location.pathname = '/r/' + subredditselected;
		voice_finished();
	}
	/*
		'open link'
	*/
	if (phrase == 'open link') {
		link = document.querySelector('.last-clicked a');
		if (link) {
			link.click();
		}
		voice_finished();
	}
	if (phrase == 'downvote') {
		link = document.querySelector('.last-clicked .arrow.down');
		if (link) {
			link.click();
		}
		voice_finished();
	}
	if (phrase == 'upvote') {
		link = document.querySelector('.last-clicked .arrow.up');
		if (link) {
			link.click();
		}
		voice_finished();
	}
	if (phrase == 'go to startsite') {
		window.location.pathname = '/'
	}
	/*
		'how many mails do I have?'
	*/
	if (
		phrase == 'how many mails do I have' || 
		phrase == 'how many unread mails do I have' || 
		phrase == 'mails' ||
		phrase == 'how many messages do I have' ||
		phrase == 'how many unread messages do I have' ||
		phrase == 'messages' ||
		phrase == 'orange red'
	) {
		mstillstartsagain = 4500;
		chrome.runtime.sendMessage({mailCount: document.querySelector('#mailCount').innerHTML});
		voice_finished();
	}
	if (phrase == 'read messages') {
		window.location.pathname = '/message/unread';
		voice_finished();
	}
	setTimeout(function() {
		if (!document.webkitHidden) {
			start_speech();
		}
	}, mstillstartsagain);
}
var voice_finished = function() {
	var container = document.querySelector('.voice-container')
	container.classList.add('voice-finished');
	setTimeout(function() {
		container.classList.remove('voice-visible');
	}, 1000);
	setTimeout(function() {
		container.classList.remove('voice-finished');
	}, 1400);

}
var replace_google_errors = function(phrase) {
	return phrase
	.replace('post to', 'post 2')
	.replace('posts to', 'post 2')
	.replace('post for', 'post 4')
	.replace('Street', '3')
	.replace('free', '3')
	.replace(/President/i, 'reddit')
	.replace(/Resident/i, 'reddit')
	.replace('exposed', 'next post')
	.replace('Elect', 'post 2')
	.replace('seperate', 'subreddit')
	//post number 1 --> post 1
	.replace(/post number/i, 'post')
	.replace(/post tree/, 'post 3')
	.replace(/subreddits/, 'subreddit')
	.replace(/download/, 'downvote')
	.replace(/up food/, 'upvote')
	.replace(/ups/, 'upvote')
	.replace('uploads', 'upvote')
	.replace('upload', 'upvote')
	.replace('up quote', 'upvote')
	.replace(/papalote/i, 'upvote')
	.replace(/quote/, 'upvote')
	.replace(/float/, 'upvote')
	.replace(/vote/, 'upvote')
	.replace(/upupvote/, 'upvote')
	.replace(/upupvotes/, 'upvote')
	.replace(/mexpost/, 'next post')
}
var show_live_results = function(result) {
	document.getElementsByClassName('voice-input-container')[0].innerHTML = replace_google_errors(result.transcript);
}
var inject_html = function() {
	var template = [
		"<div class='voice-container'>",
		  "<div class='voice-left-pane'>",
		  	"<div class='voice-icon-wrapper'>",
		  		"<div class='voice-mic-icon'></div>",
		  		"<div class='voice-check-icon'></div>",
		  	"</div>",
		  "</div>",
		  "<div class='voice-input-container'>reddit select post 1</div>",
		"</div>"
	].join('\n')
	var div = document.createElement('div');
	div.innerHTML = template
	document.body.appendChild(div.firstChild)
}
var select_post = function(numberselected) {
	var ranks = document.querySelectorAll('.linklisting .rank');
	forEach.call(ranks, function(rank) {
		if (parseInt(rank.innerHTML) == numberselected) {
			var lastclicked = document.querySelector('.last-clicked')
			if (lastclicked) {
				lastclicked.classList.remove('last-clicked');
			}
			var parent = rank.parentNode;
			parent.click();
			parent.classList.add('last-clicked');
			parent.scrollIntoView();
			var button = parent.querySelector('a.expando-button.collapsedExpando')
			if (button) {
				button.click();
			}
			settings.last_visited = numberselected;
		}
	})
}
start_speech();
inject_html();
document.addEventListener('webkitvisibilitychange', function() {
	if (document.webkitHidden) {
		console.log('hidden')
		if (settings.recognition) {
			settings.recognition.stop();
		}
	}
	else {
		console.log('visible');
		if (settings.recognition) {
			settings.recognition.start();
		}
		else {
			start_speech();
		}
	}
})

var forEach = Array.prototype.forEach;