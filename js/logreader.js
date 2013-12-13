// arguments
var wifiboxIsRemote = true;        // when you want to run the client on a computer and have it remotely connect to the wifibox
var file;
var filter;


// intervals
var readInterval 				= 3000;
var readDelay;

var filterRegExp;
var lines = {};

$(function() {
  console.log("logreader ready");

  if (getURLParameter("r") != "null") wifiboxIsRemote = (getURLParameter("r") == "1");
  file = getURLParameter("file");
  filter = getURLParameter("filter");
	if (wifiboxIsRemote) {
    var hostname = "http://192.168.5.1";
		wifiboxURL = hostname+"/d3dapi";
	} else {
		wifiboxURL = "http://" + window.location.host + "/d3dapi";
	}
  console.log("wifiboxIsRemote: " + wifiboxIsRemote);
  
  filterRegExp = new RegExp(filter);
  
  readLog();
});

function readLog() {
	//console.log("readLog");
	var data = {file:file};
	$.ajax({
		url: wifiboxURL + "/info/logtail",
		dataType: 'json',
		data: data,
		success: function(response){
			
			//console.log("readLog response: ",response);
			
			if(response.status == "success") {
				var tail = response.data.tail;
				parseTail(tail);
			}
	
			clearTimeout(readDelay);
			readDelay = setTimeout(readLog, readInterval);
		}
	}).fail(function() {
		console.log("readLog: failed");
		
		clearTimeout(readDelay);
		readDelay = setTimeout(readLog, readInterval);
	});
}

function parseTail(tail) {
	var tail = tail.split("\\n");
	//console.log("tail: ",tail);
	
	jQuery.each(tail, function(index, value){
		
		// already displayed? 
		if(lines[value] != undefined) return;
		
		// filter
		if(filter != "null") {
			if(!filterRegExp.test(value)) return;
		}
		
		addText(value);
		lines[value] = ""; //remember for exsistance check
	});
}

function addText(text) {
	$("#logreader").append("<p>"+text+"</p>");
}


// http://stackoverflow.com/questions/1403888/get-url-parameter-with-jquery
function getURLParameter(name) {
  return decodeURI(
    (new RegExp('[&?]'+name + '=' + '(.+?)(&|$)').exec(location.search)||[,null])[1]
  );
}