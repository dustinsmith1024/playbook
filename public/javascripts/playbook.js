var canvas;
var $canvas;
var court;
var $CANVAS;
var WIDTH;
var HEIGHT;
var $ghostcanvas; // we use a fake canvas to draw individual shapes for selection testing
var INTERVAL = 20;  // how often, in milliseconds, we check to see if a redraw is needed
var isDrag = false;
// when set to true, the canvas will redraw everything
// invalidate() just sets this to false right now
// we want to call invalidate() whenever we make a change
var canvasValid = false;
// The node (if any) being selected.
// If in the future we want to select multiple objects, this will get turned into an array
var mySel; 
// The selection color and width. Right now we have a red selection with a small width
var mySelColor = '#FF6600';
// since we can drag from anywhere in a node
// instead of just its x/y corner, we need to save
// the offset of the mouse when we start dragging.
var offsetx, offsety;
var team = [];
var steps = [];
// Padding and border style widths for mouse offsets
//var stylePaddingLeft, stylePaddingTop, styleBorderLeft, styleBorderTop;

$(document).ready(function () {
				  init();
});

function teamCount(kind){
	return _.select(team, function(t){
		 return t.team == kind;
	}).length;
}

function Court(){
	var kind = $('input[name="court_type"]:checked').val();
	var type = {
		nba : {
			length : 94,
			width : 50,
			laneWidth : 16,
			laneHeight : 15, //THIS IS FROM THE HOOP, NOT FROM THE BASELINE
			laneHeightFromBaseline : 18.83, //18ft10in
			threeLength : 23.75, //23ft 9in
			hoop : 4, //4ft from baseline
			hoopCenter : function(){return this.width / 2;}   
		},
		college : {
			length : 84,
			width : 50,
			laneWidth : 12,
			laneHeight : 15, //THIS IS FROM THE HOOP, NOT FROM THE BASELINE
			laneHeightFromBaseline : 18.83, //18ft10in
			threeLength : 20.75, //20ft 9in
			hoop : 4, //4ft from baseline
			hoopCenter : function(){return this.width / 2;}
		},
		hs : {
			length : 84,
			width : 50,
			laneWidth : 12,
			laneHeight : 15, //THIS IS FROM THE HOOP, NOT FROM THE BASELINE
			laneHeightFromBaseline : 18.83, //18ft10in
			threeLength : 19.75, //19ft 9in
			hoop : 4, //4ft from baseline
			hoopCenter : function(){return this.width / 2;}
		}	
	};
	function append() {
		$CANVAS.clearCanvas();
		$CANVAS.drawRect({
		  strokeStyle: "#000",
		  strokeWidth: 3,
		  x: 3,
		  y: 3,
		  width: type[kind].length * 10,
		  height: type[kind].width * 10,
		  cornerRadius: 1,
		  fromCenter: false
		});
		//console.log((type[kind].width / 2) * 10 - (type[kind].laneWidth / 2));
		$CANVAS.drawLine({ //TOP FREE THROW
							 strokeStyle: "#000",
							 strokeWidth: 3,
							 strokeCap: "round",
							 strokeJoin: "round",
							 x1: 3, y1: ((type[kind].width / 2) - (type[kind].laneWidth / 2)) * 10,
							 x2: type[kind].laneHeightFromBaseline * 10, y2: ((type[kind].width / 2) - (type[kind].laneWidth / 2)) * 10
		});
		$CANVAS.drawLine({ //BOTTOM FREE THROW
						 strokeStyle: "#000",
						 strokeWidth: 3,
						 strokeCap: "round",
						 strokeJoin: "round",
						 x1: 3, y1: ((type[kind].width / 2) + (type[kind].laneWidth / 2)) * 10,
						 x2: type[kind].laneHeightFromBaseline * 10, y2: ((type[kind].width / 2) + (type[kind].laneWidth / 2)) * 10,
						 x3: type[kind].laneHeightFromBaseline * 10, y3: ((type[kind].width / 2) - (type[kind].laneWidth / 2)) * 10
						 });
		$CANVAS.drawArc({ //Free throw circle
							strokeStyle: "#000",
							strokeWidth: 3,
							x: type[kind].laneHeightFromBaseline * 10, 
							y: ((type[kind].width / 2) + (type[kind].laneWidth / 2)) * 10 - (type[kind].laneWidth * 5),
							radius: type[kind].laneWidth / 2 * 10,
							fromCenter: true,
							start: 0, end: 180 //180 is half
						});
		$CANVAS.drawArc({ //3 Point Line
						strokeStyle: "#000",
						strokeWidth: 3,
						x: (type[kind].hoop) * 10 + 3, 
						y: ((type[kind].width / 2) + (type[kind].laneWidth / 2)) * 10 - (type[kind].laneWidth * 5),
						radius: (type[kind].threeLength) * 10 + 10,
						fromCenter: true,
						start: 0, end: 180
						});
		$CANVAS.drawLine({ //BACKBOARD
						 strokeStyle: "#000",
						 strokeWidth: 3,
						 strokeCap: "round",
						 strokeJoin: "round",
						 x1: (type[kind].hoop) * 10 + 3, y1: (type[kind].width / 2) * 10 - 15,
						 x2: (type[kind].hoop) * 10 + 3, y2: (type[kind].width / 2) * 10 + 15
						 });
		$CANVAS.drawArc({ //HOOP
						strokeStyle: "#000",
						strokeWidth: 3,
						x: (type[kind].hoop) * 10 + 3 + 10, 
						y: (type[kind].width / 2) * 10,
						radius: 10,
						fromCenter: true,
						start: 0, end: 360
						});
	}
	this.draw = append();
}

function drawCourt(){
	court_type = $('input[name="court_type"]:checked').val();
	$canvas.clearCanvas();
	$canvas.drawRect({
					 strokeStyle: "#000",
					 strokeWidth: 3,
					 x: 3, y: 3,
					 width: Court[court_type].length * 10,
					 height: Court[court_type].width * 10,
					 cornerRadius: 1,
 					 fromCenter: false
    });  
}

var X = function(){
	this.x = 0;
	this.y = 0;
	this.steps = [];
	this.current_step = 0;
	this.team = "offense";
	this.write_to = 0;
	this.canvas = function(){
		if(this.write_to===0){
			return $CANVAS;
		}else{
			return $ghostcanvas;
		}
	};
	this.strokeStyle = "#000";
	this.strokeWidth = 3;
	this.strokeJoin = "round";
	this.strokeCap = "round";
	this.x1 = function() {
		return this.x + 5;
	};
	this.y1 = function() {
		return this.y + 5;
	};
	this.x2 = function() {
		return this.x - 5;
	};
	this.y2 = function() {
		return this.y - 5;
	};
	this.draw = function() {
	  this.canvas().drawLine({
						 strokeStyle: this.strokeStyle,
						 strokeWidth: this.strokeWidth,
						 strokeCap: this.strokeCap,
						 strokeJoin: this.strokeJoin,
						 x1: this.x1(), y1: this.y1(),
						 x2: this.x2(), y2: this.y2()
						 });
	
	  this.canvas().drawLine({
						 strokeStyle: this.strokeStyle,
						 strokeWidth: this.strokeWidth,
						 strokeCap: this.strokeCap,
						 strokeJoin: this.strokeJoin,
						 x1: this.x1(), y1: this.y2(),
						 x2: this.x2(), y2: this.y1(),
						 fromCenter: true
						 });   
	};
};

var O = function (){
	this.x = 0;
	this.y = 0;
	this.steps = [];
	this.current_step = 0;
	this.team = "defense";
	this.write_to = 0;
	this.strokeStyle = "#000";
	this.strokeWidth = 3;
	this.fillStyle = "#FFF";
	this.canvas = function(){
		if(this.write_to===0){
			return $CANVAS;
		}else{
			return $ghostcanvas;
		}
	};
	this.draw = function(){
		this.canvas().drawEllipse({
								  fillStyle: this.fillStyle,
								  strokeStyle: this.strokeStyle,
								  strokeWidth: this.strokeWidth,
								  x: this.x, y: this.y,
								  width: 13, height: 13
								  });
	};
	this.move = function(){
		// or just do it in the animate loop
	};
};

function addX(x, y) {
  var player = new X();
  player.x = x;
  player.y = y;
  team.push(player);
  player.draw();
}

function addO(x, y) {
	var player = new O();
	player.x = x;
	player.y = y;
	team.push(player);
	player.draw();
}

function invalidate() {
	//Helps performance, only draws the canvas while its valid.
	canvasValid = false;
} 
// initialize our canvas, add a ghost canvas, set draw loop
// then add everything we want to intially exist on the canvas
function init() {
	$canvas = $('#court');
	$CANVAS = $canvas;
	$ghostcanvas = $canvas.clone();
	//fixes a problem where double clicking causes text to get selected on the canvas
	$canvas.select(function () { return false; });
	// fixes mouse co-ordinate problems when there's a border or padding
	// see getMouse for more detail
	/*if (document.defaultView && document.defaultView.getComputedStyle) {
		stylePaddingLeft = parseInt(document.defaultView.getComputedStyle(canvas, null)['paddingLeft'], 10)      || 0;
		stylePaddingTop  = parseInt(document.defaultView.getComputedStyle(canvas, null)['paddingTop'], 10)       || 0;
		styleBorderLeft  = parseInt(document.defaultView.getComputedStyle(canvas, null)['borderLeftWidth'], 10)  || 0;
		styleBorderTop   = parseInt(document.defaultView.getComputedStyle(canvas, null)['borderTopWidth'], 10)   || 0;
	}*/
	// make draw() fire every INTERVAL milliseconds.
	setInterval(draw, INTERVAL);
	// add our events. Up and down are for dragging,
	// double click is for making new boxes
	$canvas.mousedown(function(event){
						myDown(event);
					  }).mouseup(function(event){
						myUp(event);
					  }).dblclick(function(event){
						myDblClick(event);
	});
	$('input[name="court_type"]').change(function(){
										 court = new Court();
										 court.draw;
	});
	$("button#step").click(function(){
						   //save step with less than 5 players warming??
						   //console.log("button step");
						   //console.log(team);
						   saveStep();
						   //getStepData(steps[steps.length - 1]);
					//Would also save to the db
					//save the image as a thumbnail and add it to the side.
					});
	$("button#animate").click(function(){
							  animate();
						   });
	// add custom initialization here:
	court = new Court();
	console.log(court);
	court.draw;
}

function saveStep(){
	_.each(team,function(player){
				player.steps.push([player.x,player.y]);
				player.current_step = player.current_step + 1;
		   $("#steps").append('<li><a href="#step-'+ player.steps.length + '">X ' + player.x + " Y: " + player.y + "</a></li>");
		   });
}

function saveStep2(teamer){
	where = steps.length;
	steps[where] = [];
	console.log(teamer[0]);
	_.each(teamer, function(teamy){
		   if(teamy.team == "offense"){
				var tmp = new X();
		   }else{
				var tmp = new O();
		   }
		   tmp.x = teamy.x;
		   tmp.y = teamy.y;
		   steps[where].push(tmp);
	});//Push the team onto this step  	
}

function getStepData(step){
	_.each(step,function(teamer){
		   $("body").append("<br/>" + teamer.x + " " + teamer.y);
		   });
}

function animate(){
	_.each(team, function(player, player_num){
		   var x = player.x;
		   var y = player.y;
		   var end_x = player.steps[player.current_step - 1][0];//first one in step is X
		   var end_y = player.steps[player.current_step - 1][1];//second on in step is y
		   var spot_x = x;
		   var spot_y = y;
		   //console.log("x: " + x + " y: " + y + " end_x: " + end_x + " end_y: " + end_y);
		   function move(){
				if(player.x != end_x || player.y != end_y){
					console.log("draw!");
					//If difference in distance from final spots are unequal we need to move in a diagnol line
					var diff_x = Math.abs(player.x - end_x);
					var diff_y = Math.abs(player.y - end_y);
					if (diff_x > diff_y){
						//console.log(diff_x / diff_y);
					}
					if (diff_x < diff_y){
						//console.log(diff_y / diff_x);
					}		   
					if (player.x > end_x){
						--player.x;
					}
					if (player.x < end_x){
						++player.x;
					}
					if (player.y > end_y){
						--player.y;
					}
					if (player.y < end_y){
						++player.y;
					}
					draw();
					canvasValid = false;
				}else{
					clearInterval(moveHandle);
				}
		   }
		   moveHandle = setInterval(move,20);
		   });
}


function animate2(){
	_.each(steps, function(step, step_num){
		   console.log(step_num);
		   console.log(step);
		   _.each(step, function(player, key){
				  console.log(player.x);
				  var orig = player.x;
				  var end = player.x + 100;
				  var spot = orig;
				  team.splice(key,key); // SOMEHOW NEED TO DELETE FROM THE MAIN SCREEN AND DRAW OLD TEAM, MAYBE JUST DRAW FIRST ANIMATE LATER...
				  if (player.team=="offense"){
					//addX(player.x,player.y);
				  }else{
					//addO(player.x,player.y);
				  }
				  console.log(orig + " " + end + " " + spot);
				  function move(){
					console.log("move");
				  	if (spot < end){
						player.x = spot;
						spot = spot + 1;
						draw();
						canvasValid = false;
					}
				  }
				  setInterval(move,20);
		  });
	});
}
// While draw is called as often as the INTERVAL variable demands,
// It only ever does something if the canvas gets invalidated by our code
function draw() {
	//console.log(
	if (canvasValid == false) {
		$canvas.clearCanvas();
		// Add stuff you want drawn in the background all the time here
		c = new Court();
		court.draw;
		// draw all boxes
		var l = team.length;
		for (var i = 0; i < l; i++) {
			if (team[i] == mySel){
				team[i].strokeStyle = mySelColor;
			}else{
				//change to reset method eventually
				team[i].strokeStyle = "#000";
			}
			team[i].draw();
		}
		// Add stuff you want drawn on top all the time here
		canvasValid = true;
	}
}

function copyCtx(){
	ctx1 = $("canvas:first")[0].getContext('2d');
	ctx2 = $("canvas:last")[0].getContext('2d');
	var src = $("canvas:first")[0].toDataURL("image/png");
	var img = document.createElement('img'); // create a Image Element
    img.src = src;   //image source
    ctx2.drawImage(img, 0, 0);
	$("body").append(img);	
}

function myDown(e){
	//getMouse(e);
	var x = e.pageX - $CANVAS[0].offsetLeft;
	var y = e.pageY - $CANVAS[0].offsetTop;
	clear($ghostcanvas);
	// run through all the boxes
	var l = team.length;
	//console.log("L: " + l);
	//for (var i = 0; i < l; i++) {
	for (var i = l-1; i >= 0; i--) {
		// draw shape onto ghost context		
		team[i].write_to = 1; //SWITCHES TO GHOST
		team[i].draw();
		team[i].write_to = 0; //SWITCHES BACK TO MAIN CANVAS
		// get image data at the mouse x,y pixel
		var imageData = $ghostcanvas[0].getContext('2d').getImageData(x, y, 1, 1);
		var index = (x + y * imageData.width) * 4;
		// if the mouse pixel exists, select and break
		if (imageData.data[3] > 0) {
			mySel = team[i];
			console.log(i);
			offsetx = x - mySel.x;
			offsety = y - mySel.y;
			mySel.x = x - offsetx;
			mySel.y = y - offsety;
			isDrag = true;
			$canvas.mousemove(function(event){ myMove(event);});
			clear($ghostcanvas);
			invalidate();
			return;
		}	
	}
	// havent returned means we have selected nothing
	mySel = null;
	// clear the ghost canvas for next time
	clear($ghostcanvas);
	// invalidate because we might need the selection border to disappear
	invalidate();
}

function clear(c) { //NEED TO FIX HEIGHT AND WIDTH 
	c[0].getContext('2d').clearRect(0, 0, 700, 400);
} 

// adds a new node
function myDblClick(e) {
	//console.log("dblClick");
	var x = e.pageX - $CANVAS[0].offsetLeft;
	var y = e.pageY - $CANVAS[0].offsetTop;
	if($('input[name="player_type"]:checked').val()=="offense"){
		console.log("Draw X");
		if (teamCount("offense") < 5){
			addX(x,y); //NEED TOGGLES FOR WHICH ON WE WANT TO DRAW
		}//ELSE TELL THE USER THERE IS TOO MANY
	}else{
		if (teamCount("defense") < 5){
			addO(x,y);
		}//ELSE TELL THE USER THERE IS TOO MANY
	}
}

// Happens when the mouse is moving inside the canvas
function myMove(e){
	if (isDrag){
		//getMouse(e);
		var x = e.pageX - $CANVAS[0].offsetLeft;
		var y = e.pageY - $CANVAS[0].offsetTop;
		
		mySel.x = x - offsetx;
		mySel.y = y - offsety;   

		// something is changing position so we better invalidate the canvas!
		invalidate();
	}
}

function myUp(){
	isDrag = false;
	$canvas.mousemove(function(){});
}
