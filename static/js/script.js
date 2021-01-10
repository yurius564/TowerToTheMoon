var gridtile   = [];
var can_evoke  = true;
var bricks     = [];
var next_brick = "";
var initial_y  = 0;

var pressing_key = null;
var on_pause     = true;
var pause_state  = 0;
var brick_amount = 50;
var musicon      = false;


/* FUNCTIONS */
function checkWin(brick_height){
  return brick_height < GRID*3;
}

function resetGame(){
  brick_amount = 20;
  can_evoke = true;
  bricks = [];

  $(".tile:not(.preview)").remove();
  $(".brick:not(.preview)").remove();
  
  clearGrid();
  atualizeNextBrick();
  adjustScreenPosition();
  onPause(on_pause);
  setMenu();
  amountBricks(brick_amount);
}

function amountBricks(amm=brick_amount-1){
  brick_amount = amm;
  $("#brick-counter #amount").text(brick_amount);
  return brick_amount;
}

function onPause(state=!on_pause){
  on_pause = state;
  if(on_pause){
    $("#container").addClass("on-pause");
    $("#menu-box").addClass("menu-on");
  }
  else {
    $("#container").removeClass("on-pause");
    $("#menu-box").removeClass("menu-on");
  }
}

function setMenu(menu=0){
  $(".box").addClass("disabled");
  $(`.box[menu="${menu}"]`).removeClass("disabled");
}

function adjustScreenPosition(plus=0, mid=false){
  if(mid){
    initial_y = parseInt($(`.brick[brid="${bricks.length-1}"]`).css("top").replace("px","")) - window.innerHeight/2;
    initial_y -= (initial_y%GRID);
    initial_y *= -1;
  }
  else initial_y = plus? initial_y + plus: ((window.innerHeight - 12460) - ((window.innerHeight - 12460) % GRID)) - GRID;
  if(initial_y > 0) initial_y = 0;
  $("#container").css("top",`${initial_y}px`);
  $("#container").trigger("mousemove");
}

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
          case " ":
            $("#container").append(new Tile(cx, cy-diff, "void").htmlobj());
            break;
          case "G":
            $("#container").append(new Tile(cx, cy-diff, "gold").htmlobj());
            break;
        }
      }
    }
  }
}

function clearGrid(){
  gridtile = new Array(20).fill('');
  var screen_height = parseInt($("#container").css("height"));
  for(g in gridtile){
    gridtile[g] = new Array(parseInt(screen_height/35)+1).fill("");
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
  try{
    var [vx, vy] = convertBrickCoord(x, y);
    var cant_evoke = false;
    for(var p in body){
      var pos = body[p];
      if(gridtile[vx + pos[0]][vy + pos[1]] != ""){
        cant_evoke = true;
        break;
      }
    }
    if(cant_evoke) return false;
    for(var p in body){
      var pos = body[p];
      if(gridtile[vx + pos[0]][vy + pos[1]] == "") gridtile[vx + pos[0]][vy + pos[1]] = "X";
    }
    return true;
  }
  catch{
    return false;
  }
}

function clearBrick(x, y, body){
  var [vx, vy] = convertBrickCoord(x, y);
  for(var p in body){
    var pos = body[p];
    gridtile[vx + pos[0]][vy + pos[1]] = "";
  }
}

function hasBrick(x, y, nx, ny, vbrick, tbrick){
  var collision = BrickType.typeConfig(vbrick.type).collision;
  var [vx, vy]  = convertBrickCoord(nx, ny);

  clearBrick(x,y,BrickType.typeConfig(vbrick.type).body);

  var hasflag = false;
  var toKill  = false;
  for(var p in collision){
    var pos = collision[p];
    switch(gridtile[vx + pos[0]][vy + pos[1]]){
      case "X":
      case "#":
      case " ":
        hasflag = true;
        if((parseInt(tbrick.css("top").replace("px","")) + initial_y) < (window.innerHeight/2))
          adjustScreenPosition(0, true);
        break;
      case "F":
        toKill = true;
        break;
      case "G":
        amountBricks(brick_amount + 20);
        gridtile[vx + pos[0]][vy + pos[1]] = "";
        for(var g=0; g < $(".tile.gold").length; g++){
          var gold = $($(".tile.gold")[g]);
          if(gold.css("left").replace("px","") == (vx + pos[0])*GRID && gold.css("top").replace("px","") == (vy + pos[1])*GRID){
            gold.remove();
            break;
          }
        }
    }
    if(hasflag) break;
  }
  if(toKill && !hasflag){
    tbrick.remove();
    hasflag = true;
  }
  else{
    makeBrick(x,y,BrickType.typeConfig(vbrick.type).body);
  }

  if(hasflag){
    can_evoke = true;
    $(".preview").removeClass("lock");

    shake(200,5,10);

    if(checkWin(y)){
      setMenu(1);
      onPause(true);
      return;
    }

    if(brick_amount == 0){
      setMenu(-1);
      onPause(true);
    }
  }

  return hasflag;
}

function atualizeNextBrick(){
  next_brick = BrickType.randomType();
  var is_lock = $(".brick.preview").hasClass("lock")? "lock":"";
  $(".brick.preview").attr("class", `tile brick preview ${next_brick} ${is_lock}`);
}

function moveBlock(mx){
  var tbrick = $($(".brick.move")[0]);
  if(!tbrick.length) return;
  var vbrick = bricks[tbrick.attr("brid")];

  var alt = parseInt(tbrick.css('top').replace("px",""));
  var afs = parseInt(tbrick.css('left').replace("px",""));
  
  newafs = afs + (GRID*mx);
  if(!hasBrick(afs, alt, newafs, alt, vbrick, tbrick)){
    tbrick.css('left', `${newafs}px`);
    clearBrick(afs, alt, BrickType.typeConfig(vbrick.type).body);
    makeBrick(newafs, alt, BrickType.typeConfig(vbrick.type).body);

    shake(100,10,5);
  }
}

function shake(duration=500, force=20, amplitude=5){
  var init_x = $("#container").css("left");
  var init_y = $("#container").css("top");
  var interv = setInterval(function(amp, x , y){
      var dist = (Math.random()*amp) - amp/2;
      $("#container").css("left", `${parseInt(x.replace("px","")) + dist}px`);
      $("#container").css("top", `${parseInt(y.replace("px","")) + dist}px`);
  },force, amplitude, init_x, init_y);
  setTimeout(function(interv){
      clearInterval(interv);
      $("#container").css("left", 0);
      $("#container").css("top",  initial_y);
  }, duration, interv);
}



/* TRIGGERS */
$("#container").mousemove(function(e){
  var posX = parseInt(e.pageX) - ((window.innerWidth/2) - 350) - (GRID*(BrickType.getTypes(next_brick).width-1))/2;
  posX = `${posX - posX % GRID}px`;
  $(".brick.preview").css("left",posX);
  $(".brick.preview").css("top",`${Math.abs(initial_y)}px`);
});

$("#container").click(function(e){
  if(can_evoke){
    can_evoke = false;
    $(".preview").addClass("lock");

    var brtype = next_brick;

    var posX = parseInt(e.pageX) - ((window.innerWidth/2) - 350) - (GRID*(BrickType.getTypes(brtype).width-1))/2;
    posX = `${posX - posX % GRID}px`;

    if(!makeBrick(posX, Math.abs(initial_y), BrickType.typeConfig(brtype).body)){
      can_evoke = true;
      $(".preview").removeClass("lock");
      return;
    }
    
    amountBricks();
    atualizeNextBrick();
    var texture = `url("image/${brtype}.png")`;
    var rcolor  = parseInt(Math.random()*10);
    rcolor      = rcolor - rcolor*36;
    var filter  = `sepia(${parseInt(Math.random()*15)}) hue-rotate(${rcolor}deg) saturate(${parseInt(Math.random()*5)+3});`;
    var html = `<span class="tile brick move ${brtype}"
                  style='left:${posX};top:${Math.abs(initial_y)}px;background:${texture};filter:${filter}'
                  brid="${bricks.length}">
                </span>`;
    $(this).append(html);

    bricks.push(new Brick(brtype));
  }
});

$(window).keydown(function(e){
  if(pressing_key == null) {
    pressing_key = keycode = e.keyCode || e.which;
    switch(pressing_key){
      case 37:
      case 65:
        moveBlock(-1);
        break;
      case 39:
      case 68:
        moveBlock(1);
        break;
    }
  }
});

$(window).keyup(function(){
  pressing_key = null;
});



/* WAKE UP */
$(window).ready(function(){
  resetGame();

  setInterval(function(){
    for(var b=0; b < $(".brick.move").length; b++){
      var tbrick = $($(".brick.move")[b]);
      var vbrick = bricks[tbrick.attr("brid")];

      var alt = parseInt(tbrick.css('top').replace("px",""));
      var afs = parseInt(tbrick.css('left').replace("px",""));

      var newalt = alt+GRID;
      if(!hasBrick(afs, alt, afs, newalt, vbrick, tbrick)){
        tbrick.css('top', `${newalt}px`);
        clearBrick(afs, alt, BrickType.typeConfig(vbrick.type).body);
        makeBrick(afs, newalt, BrickType.typeConfig(vbrick.type).body);
      }
      else {
        tbrick.removeClass("move");
      }
      
      if(alt+(GRID*2) > $("#container").css("height")){
        tbrick.removeClass("move");
      }
    }

  }, GRAVITY);
});

$(window).click(function(){
  if(musicon) return;

  var music = new Audio("sound/8_Bit_Retro_Funk_-David_Renda.mp3");
  music.volume = 0.3;
  music.loop = true;
  music.play();
  musicon = true;
});