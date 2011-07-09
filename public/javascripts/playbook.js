var canvas;
var $canvas;
var court;
var $CANVAS;
var WIDTH;
var HEIGHT;
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
// we use a fake canvas to draw individual shapes for selection testing
var $ghostcanvas;
// since we can drag from anywhere in a node
// instead of just its x/y corner, we need to save
// the offset of the mouse when we start dragging.
var offsetx, offsety;

// Padding and border style widths for mouse offsets
//var stylePaddingLeft, stylePaddingTop, styleBorderLeft, styleBorderTop;

$(document).ready(function () {
				  init();
});

var team = [];

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
			hoop : 0.25, //4in from baseline
			hoopCenter : function(){return this.width / 2;}   
		},
		college : {
			length : 84,
			width : 50,
			laneWidth : 12,
			laneHeight : 15, //THIS IS FROM THE HOOP, NOT FROM THE BASELINE
			laneHeightFromBaseline : 18.83, //18ft10in
			threeLength : 20.75, //20ft 9in
			hoop : 0.25, //4in from baseline
			hoopCenter : function(){return this.width / 2;}
		},
		hs : {
			length : 84,
			width : 50,
			laneWidth : 12,
			laneHeight : 15, //THIS IS FROM THE HOOP, NOT FROM THE BASELINE
			laneHeightFromBaseline : 18.83, //18ft10in
			threeLength : 19.75, //23ft 9in
			hoop : 0.25, //4in from baseline
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

var X = {
	x : 0,
	y : 0,
	write_to : 0,
	canvas : function(){
		if(this.write_to==0){
			return $CANVAS;
		}else{
			return $ghostcanvas;
		}
	},
	strokeStyle : "#000",
	strokeWidth : 3,
	strokeJoin : "round",
	strokeCap : "round",
	x1 : function() {
		return this.x + 5;
	},
	y1 : function() {
		return this.y + 5
	},
	x2 : function() {
		return this.x - 5;
	},
	y2 : function() {
		return this.y - 5
	},
	draw : function() {
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
  }
};

var O = {
	x : 0,
	y : 0,
	write_to : 0,
	strokeStyle : "#000",
	strokeWidth : 3,
	fillStyle : "#FFF",
	canvas : function(){
		if(this.write_to==0){
			return $CANVAS;
		}else{
			return $ghostcanvas;
		}
	},
	draw : function(){
		this.canvas().drawEllipse({
							fillStyle: this.fillStyle,
							strokeStyle: this.strokeStyle,
							strokeWidth: this.strokeWidth,
							x: this.x, y: this.y,
							width: 13, height: 13
							});
	}
}

function addX(x, y) {
  var player = Object.create(X);
  player.x = x;
  player.y = y;
  team.push(player);
  player.draw();
}

function addO(x, y) {
	var player = Object.create(O);
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
	//console.log($ghostcanvas);
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
						console.log("mousedown");
						myDown(event);
					  }).mouseup(function(event){
						myUp(event);
					  }).dblclick(function(event){
						console.log("double!");
						myDblClick(event);
	});
	$('input[name="court_type"]').change(function(){
										 court = new Court();
										 court.draw;
										 });
	// add custom initialization here:
	court = new Court();
	console.log(court);
	court.draw;
}


// While draw is called as often as the INTERVAL variable demands,
// It only ever does something if the canvas gets invalidated by our code
function draw() {
	if (canvasValid == false) {
		$canvas.clearCanvas();
		// Add stuff you want drawn in the background all the time here
		c = new Court();
		court.draw;
		//drawCourt();
		
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

function myDown(e){
	//getMouse(e);
	var x = e.pageX - $CANVAS[0].offsetLeft;
	var y = e.pageY - $CANVAS[0].offsetTop;
	clear($ghostcanvas);
	// run through all the boxes
	var l = team.length;
	console.log("L: " + l);
	//for (var i = 0; i < l; i++) {
	for (var i = l-1; i >= 0; i--) {
		console.log(i);
		// draw shape onto ghost context		
		team[i].write_to = 1; //SWITCHES TO GHOST
		team[i].draw();
		team[i].write_to = 0; //SWITCHES BACK TO MAIN CANVAS
		// get image data at the mouse x,y pixel
		var imageData = $ghostcanvas[0].getContext('2d').getImageData(x, y, 1, 1);
		//console.log(imageData);
		var index = (x + y * imageData.width) * 4;
		//console.log(index);
		// if the mouse pixel exists, select and break
		if (imageData.data[3] > 0) {
			mySel = team[i];
			console.log(i);
			offsetx = x - mySel.x;
			offsety = y - mySel.y;
			mySel.x = x - offsetx;
			mySel.y = y - offsety;
			isDrag = true;
			//console.log(mySel);
			$canvas.mousemove(function(event){ myMove(event);});
			clear($ghostcanvas);
			invalidate();
			// run through all the boxes//clear(gctx);
			return;
		}
		
	}
	console.log("no selection");
	// havent returned means we have selected nothing
	mySel = null;
	// clear the ghost canvas for next time
	//clear(gctx);
	clear($ghostcanvas);
	// invalidate because we might need the selection border to disappear
	invalidate();
}

function clear(c) { //NEED TO FIX HEIGHT AND WIDTH 
	c[0].getContext('2d').clearRect(0, 0, 700, 400);
	//c.clearRect(0, 0, WIDTH, HEIGHT);
} 

// adds a new node
function myDblClick(e) {
	console.log("dblClick");
	var x = e.pageX - $CANVAS[0].offsetLeft;
	var y = e.pageY - $CANVAS[0].offsetTop;
	// for this method width and height determine the starting X and Y, too.
	// so I left them as vars in case someone wanted to make them args for something and copy this code
	
	if($('input[name="player_type"]:checked').val()=="offense"){
		console.log("Draw X");
		addX(x,y); //NEED TOGGLES FOR WHICH ON WE WANT TO DRAW
	}else{
		console.log("Draw O");
		addO(x,y);
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
