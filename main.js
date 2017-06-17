let fs = require('fs');

class consider {
  constructor(){
  	this.a = "x";
  }
}

// 'a' and 'the' are articles gramatically
class article{
  constructor(){

  }
  //article points to an object, in this case we allow it to be a file
  file(src){
    return new file(src);
  }
  statement(text){
	return new statement(text);
  }
}

// the action or an instance of two or more events or things occurring at the same point in time or space,
// in a form of a word used to connect clauses or sentences or to coordinate words in the same clause
// examples where, but, if
class conjunction{
  constructor(){
    this.each = new determiner();
    this.every = new determiner();
  }
}

class determiner{
  constructor(){

  }
}

class object{
  constructor(){
  	//An object can be always connected with a conjunction 
    this.where = new conjunction();
    let _this = this;
    Object.keys(this.where).forEach(function(key) {
      let val = _this.where[key];
      //Will inject dinamically functions as returned by this.setDeterminer method;
      let funcs = _this.setDeterminer();
      for (let f in funcs)
      {
        val[funcs[f].name] = funcs[f];
      }
    });
  }

  setDeterminer()
  {
  	//Should return the array of functions allowed after the determiner.
    throw new Error("You should set the determiner of the object by inheriting it. HINT: do not use object class directly");
  }
}

class file extends object{
  constructor(file_name)
  {
  	super();
  	if (file_name){
  	  if (fs.existsSync(file_name)) {
  	    this.file_name = file_name;
  	  }
  	  else
  	  {
  	  	throw new Error("File not found");
  	  }
  	}
  	this.contents = "";
  }
  read(callback)
  {
  	let _this = this;
  	fs.readFile(this.file_name, "utf-8", function read(err, data) {
      if (err) {
        throw err;
      }
      _this.content = data;
      callback(data);
    });
  }
  setDeterminer(){
    return [ this.line ];
  }

  line(callback){
    
  }
}

class statement extends object{
  constructor()
  {
  	super();
  	this.contents = "foo bar";
  }
}

let app = new consider();

module.exports = app;

//Articles
app.article = article;
app.a = new article();
app.the = new article();

//objects
app.object = object; //Make sure to override the setDeterminer method if you inherit the object class
app.file = file;
app.statement = statement;