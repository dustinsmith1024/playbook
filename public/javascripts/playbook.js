$(document).ready(function () {

   $(document).mousemove(function(e){
      $('#status').html(e.pageX +', '+ e.pageY);
   }); 

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

  drawCourt();

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
	  $("canvas").drawLine({
						 strokeStyle: this.strokeStyle,
						 strokeWidth: this.strokeWidth,
						 strokeCap: this.strokeCap,
						 strokeJoin: this.strokeJoin,
						 x1: this.x1(), y1: this.y1(),
						 x2: this.x2(), y2: this.y2()
						 });
	
	  $("canvas").drawLine({
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
	draw : function(){
	$("canvas").drawEllipse({
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

function drawX(a, b) {
  a = a + 5; //these make the X start in the middle
  b = b + 5;
  a2 = a - 10;
  b2 = b - 10;
  $("canvas").drawLine({
    strokeStyle: "#000",
    strokeWidth: 3,
    strokeCap: "round",
    strokeJoin: "round",
    x1: a, y1: b,
    x2: a2, y2: b2
  });

  $("canvas").drawLine({
    strokeStyle: "#000",
    strokeWidth: 3,
    strokeCap: "round",
    strokeJoin: "round",
    x1: a, y1: b2,
    x2: a2, y2: b,
    fromCenter: true
  });
}

function drawO(a,b) {

$("canvas").drawEllipse({
  //fillStyle: "#000",
  strokeStyle: "#000",
  x: a, y: b,
  width: 15, height: 15
})


}
