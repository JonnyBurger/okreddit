chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
	console.log(request, sender);
	chrome.tts.speak('You have ' + (request.mailCount == 0 ? 'no' : request.mailCount) + ' unread ' + (request.mailCount == '[1]' ? 'message' : 'messages') + '. To read ' + (request.mailCount == '[1]' ? 'it':'them')  + ', say "read messages".');
})