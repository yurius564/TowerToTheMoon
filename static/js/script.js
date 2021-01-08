var gridtile   = [];
var can_evoke  = true;
var bricks     = [];
var next_brick = "";


function preConfigTiles(){
  for(var cx in PRECONFIG){
    for(var cy=PRECONFIG[cx].length; cy > PRECONFIG[cx].length - gridtile[cx].length; cy--){
      if(PRECONFIG[cx][cy] != ""){
        var diff = PRECONFIG[cx].length - gridtile[cx].length;
        gridtile[cx][cy-diff] = PRECONFIG[cx][cy];
        
        switch(PRECONFIG[cx][cy]){
          case "#":
            $("#container").append(new Tile(cx, cy-diff, "ground").htmlobj());
            break;
          case "F":
            $("#container").append(new Tile(cx, cy-diff, "kill").htmlobj());
            break;
        }
      }
    }
  }
}

function clearGrid(){
  gridtile = new Array(20).fill('');
  for(g in gridtile){
    gridtile[g] = new Array(parseInt(window.innerHeight/35)+1).fill("");
  }

  preConfigTiles();
}

function convertBrickCoord(x, y){
  x = String(x);
  y = String(y);
  var vx = x.includes('px')? parseInt(x.replace("px",'')) / 35: parseInt(x / 35);
  var vy = y.includes('px')? parseInt(y.replace("px",'')) / 35: parseInt(y / 35);
  return [vx, vy];
}

function makeBrick(x, y, body){
  var [vx, vy] = convertBrickCoord(x, y);
  for(var p in body){
    var pos = body[p];
    if(gridtile[vx + pos[0]][vy + pos[1]] == "") gridtile[vx + pos[0]][vy + pos[1]] = "X";
  }
}

function clearBrick(x, y, body){
  var [vx, vy] = convertBrickCoord(x, y);
  for(var p in body){
    var pos = body[p];
    gridtile[vx + pos[0]][vy + pos[1]] = "";
  }
}

function hasBrick(x, y, ny, vbrick, tbrick){
  var collision = BrickType.typeConfig(vbrick.type).collision;
  var [vx, vy] = convertBrickCoord(x, ny);

  var hasflag = false;
  for(var p in collision){
    var pos = collision[p];
    switch(gridtile[vx + pos[0]][vy + pos[1]]){
      case "X":
      case "#":
        hasflag = true;
        break;
      case "F":
        clearBrick(x, y, BrickType.typeConfig(vbrick.type).body);
        tbrick.remove();
        hasflag = true;
        break;  
    }
    if(hasflag) break;
  }

  return hasflag;
}

function atualizeNextBrick(){
  next_brick = BrickType.randomType();

  $(".brick.preview").attr("class", `tile brick preview ${next_brick}`);
}


$("#container").mousemove(function(e){
  var posX = parseInt(e.pageX) - ((window.innerWidth/2) - 350) - GRID/2;
  posX = `${posX - posX % GRID}px`;
  $(".brick.preview").css("margin-left",posX);
});

$("#container").click(function(e){
  if(can_evoke){
    can_evoke = false;

    var brtype = next_brick;

    var posX = parseInt(e.pageX) - ((window.innerWidth/2) - 350) - GRID/2;
    posX = `${posX - posX % GRID}px`;

    makeBrick(posX, "0", BrickType.typeConfig(brtype).body);
    
    atualizeNextBrick();
    var rcolor = `brcolor${parseInt(Math.random()*3)+1}`;
    var html = `<span class="tile brick move ${brtype} ${rcolor}" style="margin-left:${posX}" brid="${bricks.length}">BRICK</span>`;
    $(this).append(html);

    bricks.push(new Brick(brtype));
  }
});

$(window).ready(function(){
  clearGrid();
  atualizeNextBrick();

  setInterval(function(){
    can_evoke = true;

    for(var b=0; b < $(".brick.move").length; b++){
      var tbrick = $($(".brick.move")[b]);
      var vbrick = bricks[tbrick.attr("brid")];

      var alt = parseInt(tbrick.css('margin-top').replace("px",""));
      var afs = parseInt(tbrick.css('margin-left').replace("px",""));

      var newalt = alt+GRID;
      if(!hasBrick(afs, alt, newalt, vbrick, tbrick)){
        tbrick.css('margin-top', `${newalt}px`);
        clearBrick(afs, alt, BrickType.typeConfig(vbrick.type).body);
        makeBrick(afs, newalt, BrickType.typeConfig(vbrick.type).body);
      }
      
      if(alt+(GRID*2) > window.innerHeight){
        tbrick.removeClass("move");
      }
    }

  }, GRAVITY);
});