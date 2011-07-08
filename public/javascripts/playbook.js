$(document).ready(function () {

   $(document).mousemove(function(e){
      $('#status').html(e.pageX +', '+ e.pageY);
   }); 

				  init();

});

var team = [];

function drawCourt(){
  $("canvas").drawRect({
  	strokeStyle: "#000",
	strokeWidth: 1,
	x: 10, y: 10,
	width: 575,
	height: 330,
	cornerRadius: 1,
    fromCenter: false
  });  
}

var X = {
	x : 0,
	y : 0,
	canvas : $CANVAS,
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
	  $CANVAS.drawLine({
						 strokeStyle: this.strokeStyle,
						 strokeWidth: this.strokeWidth,
						 strokeCap: this.strokeCap,
						 strokeJoin: this.strokeJoin,
						 x1: this.x1(), y1: this.y1(),
						 x2: this.x2(), y2: this.y2()
						 });
	
	  $CANVAS.drawLine({
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
	canvas : $CANVAS,
	draw : function(){
		$CANVAS.drawEllipse({
							strokeStyle: "#000",
							x: this.x, y: this.y,
							width: 15, height: 15
							});
	}
}

function addX(x, y) {
  var player = Object.create(X);
  player.x = x;
  player.y = y;
  team.push(player);
  player.draw();
//  invalidate();
}

function addO(x, y) {
	var player = Object.create(O);
	player.x = x;
	player.y = y;
	team.push(player);
	player.draw();
	//  invalidate();
}

var canvas;
var $CANVAS;
var ctx;
var WIDTH;
var HEIGHT;
var INTERVAL = 200;  // how often, in milliseconds, we check to see if a redraw is needed

var isDrag = false;
var mx, my; // mouse coordinates

// when set to true, the canvas will redraw everything
// invalidate() just sets this to false right now
// we want to call invalidate() whenever we make a change
var canvasValid = false;

// The node (if any) being selected.
// If in the future we want to select multiple objects, this will get turned into an array
var mySel; 

// The selection color and width. Right now we have a red selection with a small width
var mySelColor = '#CC0000';
var mySelWidth = 2;

// we use a fake canvas to draw individual shapes for selection testing
var ghostcanvas;
var gctx; // fake canvas context

// since we can drag from anywhere in a node
// instead of just its x/y corner, we need to save
// the offset of the mouse when we start dragging.
var offsetx, offsety;

// Padding and border style widths for mouse offsets
var stylePaddingLeft, stylePaddingTop, styleBorderLeft, styleBorderTop;

// initialize our canvas, add a ghost canvas, set draw loop
// then add everything we want to intially exist on the canvas
function init() {
	$canvas = $('canvas');
	$CANVAS = $canvas;
	HEIGHT = $canvas.height();
	WIDTH = $canvas.width();
	//ctx = $canvas.loadCanvas('2d');
	$ghostcanvas = $canvas.clone();
	$ghostcanvas.height = HEIGHT;
	$ghostcanvas.width = WIDTH;
	//gctx = $ghostcanvas.loadCanvas("2d");
	
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
	}).mouseup(function(){
	//			myUp;
	}).dblclick(function(){
	//			myDblClick;
	});
	
	// add custom initialization here:
	//add court or draw original stuff
	// add an orange rectangle
	//addRect(200, 200, 40, 40, '#FFC02B');
	
	// add a smaller blue rectangle
	//addRect(25, 90, 25, 25, '#2BB8FF');
	$("canvas").click(function(e){
					  var x = e.pageX - this.offsetLeft;
					  var y = e.pageY - this.offsetTop;
					  //console.log(x + " " + y);
					  if($("input:checked").val()=="offense"){
					  addX(x,y); //NEED TOGGLES FOR WHICH ON WE WANT TO DRAW
					  }else{
					  addO(x,y);
					  }
	});
	
	
}

// While draw is called as often as the INTERVAL variable demands,
// It only ever does something if the canvas gets invalidated by our code
function draw() {
	//console.log("redraw");
	$canvas.attr("id");
	if (canvasValid == false) {
		$canvas.clearCanvas();
		
		// Add stuff you want drawn in the background all the time here
		drawCourt();
		// draw all boxes
		var l = team.length;
		for (var i = 0; i < l; i++) {
			addX(boxes[i].x, boxes[i].y);
		}
		
		// draw selection
		// right now this is just a stroke along the edge of the selected box
		if (mySel != null) {
			ctx.strokeStyle = mySelColor;
			ctx.lineWidth = mySelWidth;
			ctx.strokeRect(mySel.x,mySel.y,mySel.w,mySel.h);
		}
		
		// Add stuff you want drawn on top all the time here
		
		
		canvasValid = true;
	}
}

function myDown(e){
	//getMouse(e);
	var x = e.pageX - $CANVAS[0].offsetLeft;
	var y = e.pageY - $CANVAS[0].offsetTop;
	//clear(gctx); // clear the ghost canvas from its last use
	
	// run through all the boxes
	var l = team.length;
	for (var i = l-1; i >= 0; i--) {
		// draw shape onto ghost context
		team[i].canvas = $ghostcanvas;
		team[i].draw();
		
		// get image data at the mouse x,y pixel
		console.log(x + " " + y);
		var imageData = document.getElementById('court').getContext('2d').getImageData(x, y, 1, 1);
		console.log(imageData);
		//.getContext('2d').getImageData(1,10,100,100);
		var index = (x + y * imageData.width) * 4;
		console.log(index);
		// if the mouse pixel exists, select and break
		if (imageData.data[index] > 0) {
			mySel = team[i];
			offsetx = x - mySel.x;
			offsety = y - mySel.y;
			mySel.x = x - offsetx;
			mySel.y = y - offsety;
			isDrag = true;
			console.log("drag");
			//canvas.onmousemove = myMove;
			//invalidate();
			//clear(gctx);
			return;
		}
		
	}
	console.log("no selection");
	// havent returned means we have selected nothing
	mySel = null;
	// clear the ghost canvas for next time
	//clear(gctx);
	// invalidate because we might need the selection border to disappear
	//invalidate();
}