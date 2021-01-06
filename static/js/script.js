const GRID    = 35;
const GRAVITY = 200;

var gridtile = [];
var canEvoke = true;


function clearGrid(){
  gridtile = new Array(20).fill('');
  for(g in gridtile){
    gridtile[g] = new Array(parseInt(window.innerHeight/35)).fill("");
  }
}

function convertBrickCoord(x, y){
  x = String(x);
  y = String(y);
  var vx = x.includes('px')? parseInt(x.replace("px",'')) / 35: parseInt(x / 35);
  var vy = y.includes('px')? parseInt(y.replace("px",'')) / 35: parseInt(y / 35);
  return [vx, vy];
}

function makeBrick(x, y){
  var [vx, vy] = convertBrickCoord(x, y);
  gridtile[vx][vy]     = "X";
  gridtile[(vx)+1][vy] = "X";
}

function clearBrick(x, y){
  var [vx, vy] = convertBrickCoord(x, y);
  gridtile[vx][vy]     = "";
  gridtile[(vx)+1][vy] = "";
}

function hasBrick(x, y){
  var [vx, vy] = convertBrickCoord(x, y);
  return gridtile[vx][vy] == "X" || gridtile[vx+1][vy] == "X";
}


$("#container").click(function(e){
  if(canEvoke){
    canEvoke = false;
    var posX = parseInt(e.pageX) - ((window.innerWidth/2) - 350) - GRID;
    posX = `${posX - posX % GRID}px`;

    makeBrick(posX, "0");
    var rcolor = `br${parseInt(Math.random()*3)+1}`;
    var html = `<span class="brick move ${rcolor}" style="margin-left:${posX}">BRICK</span>`;
    $(this).append(html);
  }
});

$(window).ready(function(){
  clearGrid();

  setInterval(function(){
    canEvoke = true;

    for(var b=0; b < $(".brick.move").length; b++){
      var tbrick = $($(".brick.move")[b]);

      var alt = parseInt(tbrick.css('margin-top').replace("px",""));
      var afs = parseInt(tbrick.css('margin-left').replace("px",""));

      var newalt = alt+GRID;
      if(!hasBrick(afs, newalt)){
        tbrick.css('margin-top', `${newalt}px`);
        clearBrick(afs, alt);
        makeBrick(afs, newalt);
      }
      
      if(alt+(GRID*2) > window.innerHeight){
        tbrick.removeClass("move");
      }
    }

  }, GRAVITY);
});