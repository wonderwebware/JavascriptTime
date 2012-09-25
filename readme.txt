	
	jsTimeWatch.js: Open-source JavaScript Time Library
	Copyright (C) 2012, Melanto Ltd. All Rights Reserved.
	
	http://wonderwebware.com/javascript-time/
	
	Released under the MIT, BSD, LGPL and GPL Licenses: 
	http://wonderwebware.com/javascript-time/license.html
	
	Version History:
	================
	Version 1.0 - Release date: 5 April 2012
	
	Note about precision: this is JavaScript. 
	It should be obvious, but still -- the precision wasn't a gola when building this library. All these timers should give the right value in term of seconds, but don't expect 
	millisecond precision (impossible for JavaScript at all). The milliseconds are here only for visualisation needs (it's nice when milliseconds are blinking fast on the screen, 
	but that's all). If you set an alarm for exactly 5 ms time, don't hate me when you get it half a second later ;-)
	
	=======================
	jtl.time() -->	We use jtl.time construct to pass hours/minutes/seconds/miliseconds to the invoking scripts:
	=======================

	where:
		time.hh --> hours
		time.mm --> minutes
		time.ss --> seconds
		time.ms --> milliseconds
		time.negative --> 	if negative=true then we have a backWatch (backward clock) timer that passed beyond the total time set:
						5..4..3..2..1..0..-1..-2..-3 etc...
	
	if you need, for some reason, to create time object in your code:
	t = new jtl.time();
	
	jtl.msToTime(x) --> converts milliseconds to jtl.time 
	gets X ms as parameter and returns jtl.time object.	
	usage: ret = jtl.msToTime(x); 
 
	jtl.hmsToMs(HH,MM,SS,ms) --> convert HH:MM:SS:ms to ms
								 it just computes the input params to:	ms+(SS*1000)+(MM*60*1000)+(HH*60*60*1000) 
	
	
  	================================================================
		jtl.stopWatch() --> our stopwatch  		
	================================================================	
	
	To create stopWatch object: 
	var stopWatch = new jtl.stopWatch(); 

	stopWatch.start() --> to start counting; 
	return:
		* null -- on error (i.e. already started timer) 
		* 0 -- timer successfuly started
		
	stopWatch.splittime() --> returns the time passed without stopping the timer; return
	return:
		* null -- on error (timer not started) 
		* jtl.time -- on success it returns the time since timer start in jtl.time object
		
	stopWatch.stoptime() --> stop counting and reset stopWatch object
	return:
		* null -- on error (timer not started) 
		* jtl.time -- on success it returns the time since timer start in jtl.time object
	  
	The stopWatch object supports refresh/callback functionality (if you need it). To use this feature:
	1) create callback function (for example -- an updater for some screen value)
	2) pass the callback function to the stopWatch object: stopWatch.executeOnRefresh(myUpdater); 
	
	The two functions for this purpose are:  
	stopWatch.setRefreshInterval(ms) --> to change the refresh interval. The default refresh rate is 50 ms (20 times per second) and you definitely don't need
										 lower value, but if you don't refresh the screen you may want to set bigger interval; pass milisseconds to this function
	stopWatch.executeOnRefresh(func) --> as described above, use this to set call-back function on refresh (the function "func" will be exacuted 20 times per seconds
										 by default, or if you changed the refresh interval -- on the refresh interval you set with previous function 
	  
	
	
	================================================================
	backWatch "class" -- the backward clock functionality is here 
	================================================================	
	
	This works similar to the above stopWatch function, but "in reverse". You set the start time (for example -- 1 hour, 5 minutes and 9 seconds) 
	and the backWatch object counts backward to from your starting value. Again, you can attach callback functions to this object to be executed
	on refresh and/or end (end = when backward counter reaches 0)
		
	Create object:
	var backWatch = new jtl.backWatch();
	
	backWatch.startHMS(H,M,S) --> start counting from H,M,S where H=hours, M=minutes, S=seconds. If you want to count from 10 to 0: backWatch.startHMS(0,0,10); 	
	return: 
		* null --> on error
		* 0 --> on sucess

	backWatch.setRefreshInterval(ms) --> change the refresh interval (in milliseconds). The default refresh rate is 50 ms (20 times per second)   
	backWatch.executeOnRefresh(func) --> execute callback function "func" on refreshInterval
	backWatch.splittime() --> returns the time passed without stopping the timer; 
	return:
		* null -- on error (timer not started) 
		* jtl.time -- on success it returns the time left until 0 in jtl.time object; if the time.negative property is set to "true", then the time is passed 
					  and we are counting time beyond the end point (zero): -1 sec, -2 sec etc...
					example:
					  t = backWatch.splittime();
					  if(t.negative){
					  	// we don't have time! we passed the deadline!
					  }  
	
	backWatch.stoptime() --> stop the backward clock
	return:
		* null -- on error (timer not started) 
		* jtl.time -- on success it returns the time left in jtl.time object
		
	backWatch.setStopOnEnd(true)  --> use this to stop the backward counter when it reaches 0 (no negative counting); will invoke the stoptime() method on 0
	backWatch.setStopOnEnd(false) --> [default] don't stop the clock, negative values after reaching 0
	

	backWatch.executeOnEnd(callbackFunction) --> you can use this to set a function to be executed when counter reaches 0
												 this handler is separate from the executeOnRefresh(...) -- you may use them separately (or both)
	
	
	
	================================================================
	jtl.alertAfter(hours,minutes,seconds,callbackFunction)
	================================================================	
	
	Use this to execute callBackFunction after specified time.
	
	usage example: 	
	alertAfter(0,0,10,showAlert) --> will execute showAlert() after 10 seconds

	
	

