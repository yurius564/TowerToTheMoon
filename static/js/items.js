class Brick {
  body      = [];
  collision = [];

  constructor(type){
    this.type = type;
    this.setmatriz();
  }

  setmatriz(){
    var config     = BrickType.typeConfig(this.type);
    this.body      = config.body;
    this.collision = config.collision;
  }
}

class BrickType {
  static typeConfig(type){
    var body     = [];
    var collision = [];
    switch(type){
      case 'brick1':
        body      = [[0,0],[1,0]];
        collision = [[0,0],[1,0]];
        break;
      case 'brick2':
        body      = [[0,0]];
        collision = [[0,0]];
        break;
      case 'brick3':
        body      = [[0,0],[1,0],[0,1],[1,1]];
        collision = [[0,1],[1,1]];
        break;
    }

    return {'body':body, 'collision':collision};
  }

  static randomType(){
    var types = [{name:'brick1',perc:30},{name:'brick2',perc:5},{name:'brick3',perc:1}];
    
    var sum    = types.reduce((x,i) => x + parseInt(i.perc),0);
    var r      = parseInt(Math.random()*sum);
    var ltypes = types.map(x => new Array(x.perc).fill(x.name));
    ltypes     = ltypes.reduce((x,i) => [...x,...i], []);
    
    return ltypes[r];
  }
}