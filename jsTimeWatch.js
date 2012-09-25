/*
	jsTimeWatch.js: Open-source JavaScript Time Library
	Copyright (C) 2012, Melanto Ltd. All Rights Reserved.
	http://wonderwebware.com/javascript-time/
	
	Released under the MIT, BSD, LGPL and GPL Licenses: 
	http://wonderwebware.com/javascript-time/license.html
	
	Version History:
	================
	Version 1.0 - Release date: 5 April 2012
	
	Usage Notes:
	============
	See the test.html example for a demo on how to use the functionality of this library.
 	
	Read the documentation at http://wonderwebware.com/javascript_time.html
	
	To include in your project:
	<script type='text/javascript' src='jsTimeWatch.min.js'></script>
	
	Note on getDate() return value: ECMAScript standard (§15.9.1.1) defines that "time is measured in ECMAScript in milliseconds since 01 January, 1970 UTC."
	That *should* mean we don't need to bother about the daylight time (if suddenly our stopwatch comes +/- 1 hour; also -- we don't need to care about timezones.
	However, this source code comes with absolutely no warranty of any kind!
		
	To keep things isolated everything is packed into *jtl.* namespace, i.e. to use given function you invoke it like that: jtl.foo()
	In case of collision -- just rename the "namespace" -- change "mtl" to whatever you want BUT PLEASE, USE "REPLACE ALL" function of your editor!
*/

var jtl = { //the "namespace" encapsulator

	/*	A time object we will use to store converted timestamps. Usage: var timeObject = new jtl.time();*/
	time: function(){ 
	    this.hh=0, //hours
		this.mm=0, //minutes
		this.ss=0, //seconds
		this.ms=0; //milliseconds
		this.negative=false; //when negative value this will be true
	},
	
	/*	The getTime() function just returns the time in ms	*/
	getTime: function() {
		 // var absTime = new Date(); //an object we will use to get system time
		 // return absTime.getTime();	//get ms since midnight 1 Jan 1970 (UTC)
		 return Date().now(); //http://jsperf.com/date-gettime-vs-date-now
	},
	
	/*	Convert milliseconds to useful units; usage: ret = jtl.msToTime(x); */
	msToTime: function(ms){ 
		
		ret = new jtl.time();
		if(ms<0){ //negative value in -- set the flag
			ret.negative=true;
			ms=Math.abs(ms); 
		} else { 
			ret.negative=false; 
		}
			var hours =   parseInt(   ms / (1000*60*60) );
			var minutes = parseInt(  (ms % (1000*60*60)) / (1000*60) ) % 60;
			var seconds = parseInt( ((ms % (1000*60*60)) % (1000*60)) / 1000 );
				ms = 	  parseInt( ((ms % (1000*60*60)) % (1000*60)) % 1000 );
	 
	  	ret.hh=(hours < 10 ? "0" + hours : hours);
	  	ret.mm=(minutes < 10 ? "0" + minutes : minutes);
	  	ret.ss=(seconds  < 10 ? "0" + seconds : seconds);
		ret.ms=(ms  < 100 ? jtl.pad(ms,3) : ms);
	  return ret;
	},	 
	/* 	convert HH:MM:SS:ms to ms
		to convert HH:MM:SS:ms to  milliseconds:
		ms+(SS*1000)+(MM*60*1000)+(HH*60*60*1000) */
	hmsToMs: function(HH,MM,SS,ms){
		//some minor sanity check
		if(!jtl.isUInt(HH+MM+SS+ms))return null; //exit if some of the imput params isn't integer value
		return (ms+(SS*1000)+(MM*60*1000)+(HH*60*60*1000));
	},
	/* for the backward timer we need to retouch raw value to common 10,9,8,7... sequence */
	msLeftToTime: function(ms){
		if(ms==null)return null;
		var ret=jtl.msToTime(ms);
		
		if(!ret.negative)if(ret.ms>0){
			ret.ss++;
			ret.ss=(ret.ss  < 10 ? "0" + ret.ss : ret.ss);
			}
				
		return ret;
	},
	
	/* some not time-related functions */
	isUInt: function(s) { //for checking unsigned int params
  		return (s.toString().search(/^[0-9]+$/) == 0);
	},
	pad: function(number, length) {
    	var str = '' + number;
    	while (str.length < length) {
        	str = '0' + str;
    	}
   	return str;
	},


  	/* 	================================================================
		stopWatch "class" -- when using, remember its nested in the 
		namespace and use this way: var stopWatch = new jtl.stopWatch(); 
		================================================================	*/
	stopWatch: function(){ 
	
	//****************************************************************************************************************************
  	// BEGIN stopWatch ***********************************************************************************************************
	//****************************************************************************************************************************
	
	  var startTime = -1, 	 //start timestamp value; -1 = not yet started
		  isStarted = false, //is_stopwatch_working? flag
  		  refreshInterval = 50, // 50ms means we execute refresh method 20 times per second (standard film interval is 24 frames per second, but 16fps is considered enough)
		  updateOn = false, //we dont start updater if user don't give us callback function (executeOnRefresh)
		  updater = null; //here we will keep setInterval return value for properly shut down timer on end of work		

	  /* =======================================
		 START method; usage: stopWatch.start(); 
	  	 ======================================= */
	  this.start = function(){     
		  if (isStarted) return null; //already started
		  else {   
			  isStarted = true;
			  startTime = jtl.getTime();			  
			  return 0;
		  }
	  }
	  /*===========================================================================================================
	  	SPLITTIME method -- will return current time w/o stopping timer; hint: use this to display current time too
	    ===========================================================================================================*/
	  this.splittime = function(){
		  if(!isStarted)return null; //must start timer first
		  return jtl.msToTime(jtl.getTime()-startTime);
	  }
	  /*==========================
	  	STOP timer and reset state
	    ==========================*/
	  this.stoptime = function(){
		  if(!isStarted)return null; //must start timer first
		  var time=jtl.getTime();
		  isStarted=false;
		  if(updateOn)clearInterval(updater); //stop the refresh timer if not needed anymore
		  return jtl.msToTime(time-startTime);
	  }
	  /* ===============================================================================
	     If needed, change refresh intercal with this method, but don't think you'll get
	     big improvement if set to under 10 or 20 ms (JavaScript is not assembler)
	     =============================================================================== */  
	  this.setRefreshInterval = function(ms){
		  if(ms>0)refreshInterval=ms;
	  }
	  /* ===============================================================================
	     set the function(from your code) to be executed on refresh; This should be the
	     update() method you wrote to update the screen, for example
	     =============================================================================== */  
	  this.executeOnRefresh = function(func){
		 if(func!=null){ //set updater
		 	updateOn = true; //we enable the updater
			updater = setInterval(func,refreshInterval);
		 }
	  }
	   	  
	}, 
	//****************************************************************************************************************************
	// END stopWatch() "class" ***************************************************************************************************
	//****************************************************************************************************************************
	
	
	/* 	================================================================
		backWatch "class" -- the backward clock functionality is here 
		usage: var stopWatch = new jtl.backWatch(); 
		================================================================	*/
	backWatch: function(){ 
  	//BEGIN backWatch
	
	var startTime = -1,
		totalTime = -1, //total time in milliseconds
		endTime = -1, //will keep the end time in ms here
		timeLeft = 0, //the zero assigned is just to say it's numeric value
		isStarted = false, //is backward clock started?
 		refreshInterval = 50, // 50ms means we execute refresh method 20 times per second (standard film interval is 24 frames per second, but 16fps is considered enough)
		updateOn = false, //we dont start updater if user don't give us callback function (executeOnRefresh)
		updater = null, //here we will keep setInterval return value for properly shut down timer on end of work
		callbackFunc = null, //calback on refresh function kept here
		stopOnEnd = false, //by default we continue counting negative time, if set to true will stop counting when no time left
		funalCallbackFunc = null, //here we keep the callback function for end notification
		finalUpdater = null, //setInterval(finalUpdater,totalTime)
		stopped = false;
		
	  /*================================================
		START method; usage: backWatch.start(HH,MM,SS); 
		to convert HH:MM:SS:ms to  milliseconds:
		ms+(SS*1000)+(MM*60*1000)+(HH*60*60*1000)
	 	================================================*/
	  	this.startHMS = function(H,M,S){     
			if (isStarted) return null; //already started or error
			else {   
			  isStarted = true;
			  startTime = jtl.getTime();
			  if(!jtl.isUInt(H+M+S))return null; //bad input time
			  totalTime=jtl.hmsToMs(H,M,S,0);
			  //if there is callback function for execution on end
			 if(funalCallbackFunc!=null)
			  		finalUpdater = setTimeout(this.finalUpdate,totalTime);
			  endTime=startTime+totalTime;
			  stopped=false;
			  return 0;
			}
	  	}	
	  /* ===============================================================================
	     If needed, change refresh intercal with this method, but don't think you'll get
	     big improvement if set to under 10 or 20 ms (JavaScript is not assembler)
	     =============================================================================== */  
	  this.setRefreshInterval = function(ms){
		  if(ms>0)refreshInterval=ms;
	  }
	  /* ===============================================================================
	     set the function(from your code) to be executed on refresh; This should be the
	     update() method you wrote to update the screen, for example
	     =============================================================================== */  
	  this.executeOnRefresh = function(func){
		 if(func!=null){ //set updater
		 	updateOn = true; //we enable the updater
			callbackFunc=func;
			updater = setInterval(this.refresher,refreshInterval);
		 }
	  }
	  this.refresher = function(){
		  if(updateOn) callbackFunc();
	  }
	  /*===========================================================================================================
	  	SPLITTIME method -- will return current time left stopping timer; hint: use this to display status too
	    ===========================================================================================================*/
	  this.splittime = function(){
		  if(!isStarted)return null; //must start timer first
		  timeLeft = endTime - jtl.getTime();
		  if(timeLeft<1)if(stopOnEnd)this.stoptime();
		  return jtl.msLeftToTime(timeLeft);
	  }
	  /*=======================
	  	STOP counting and reset 
	    =======================*/
	  this.stoptime = function(){
		  if(!isStarted)return null; //exit if timer not started
		  var time=this.splittime();		  
		  isStarted=false;
		  if(updateOn)clearInterval(updater); //stop the refresh timer if not needed anymore
		  clearTimeout(finalUpdater); //stop the onEnd timer
		  stopped=true;
		  return time; //return time left on stop
	  }
	  /* true = set timer to stop counting after 0 */
	  this.setStopOnEnd = function(val){
		  if(val!= true)if(val!=false)return null;
		  stopOnEnd=val;
	  }
	  /* ===============================================================================
	     executeOnEnd(callbackFunction)
	     =============================================================================== */  
	  this.executeOnEnd = function(func){
		 if(func!=null){ //set finalUpdater
		 	funalCallbackFunc=func;	//we enable the finalUpdater by setting callback function
			if(isStarted){
				//set timeout here, cause counting already started...
				this.splittime();
			  	finalUpdater = setTimeout(this.finalUpdate,timeLeft);
			}
			//otherwise it is already set
		 }
	  }
	  /* we invoke this method from the setTimeout() functions */
	  this.finalUpdate = function(){		  
		  
		  clearTimeout(finalUpdater); //stop the onEnd timer
		  if(stopped)return;
		  endTime = jtl.getTime();
		  this.refresher;
		  funalCallbackFunc();
	  }	
		
	}, 
	//****************************************************************************************************************************
	// END backWatch() "class" ***************************************************************************************************
	//****************************************************************************************************************************

	//****************************************************************************************************************************
	//	alertAfter(hours,minutes,seconds,callbackFunction)
	//	usage example: alertAfter(0,0,10,showAlert) will execute showAlert() after 10 seconds
	//****************************************************************************************************************************
	alertAfter: function(h,m,s,func){
		if(!jtl.isUInt(h+h+s))return null; //bad input 
		if(func==null)return; //no callback function			  
		var watcher = new jtl.backWatch();
		watcher.executeOnEnd(func);
		watcher.setStopOnEnd(true);
		watcher.startHMS(h,m,s);
	}
	
	
}; //end "namespace"
