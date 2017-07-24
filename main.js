let fs = require('fs');
let utils = require('./utils.js');

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
  userStory(text){
    return new userStory(text);  
  }
  functionality(f){
    return new functionality(f);  
  }
}

// the action or an instance of two or more events or things occurring at the same point in time or space,
// in a form of a word used to connect clauses or sentences or to coordinate words in the same clause
// examples where, but, if
class conjunction{
  constructor(){
    this.each = new determiner();
    this.every = new determiner();
    this.first = new determiner();
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
    this.tags = [];
    Object.keys(this.where).forEach(function(key) {
      let val = _this.where[key];
      //Will inject dinamically functions as returned by this.setDeterminer method;
      let funcs = _this.setDeterminer();
      for (let f in funcs)
      {
        if (!funcs[f]) throw new Error("Function has not been declared, make sure setDeterminer returns existing functions!");
        val[funcs[f].name] = funcs[f];
        //Also adds in the determiner level a copy of the current object which is accessed as 'this.caller'
        val["caller"] = _this;
      }
    });
  }

  tag(tag){
    //Stores the actual value of the tag instead of the object for search optimization
    this.tags.push(tag.value);
    //Allow chaining so the main object is returned
    return this;
  }

  unTag(tag){
    let i = this.tags.indexOf(tag);
    if(i != -1) {
      this.tags.splice(i, 1);
    }
    //Allow chaining so the main object is returned
    return this;    
  }

  hasTags(){
    return this.tags.length > 0;
  }

  hasTag(value){
    return this.tags.includes(value);
  }

  find(fragment, callback)
  {
    //Should be overriden by children classes.
    throw new Error("Not Implemented");
  }

  count(fragment, callback)
  {
    //Should be overriden by children classes.
    throw new Error("Not Implemented");
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
  	this.contents;
  	//This state allows re-reading if the determiner is used instead of read
  	this.hasRead = false;
  }
  //A file can be read in 2 ways:
  //Either by calling the method below, or
  //using the determiner file.where.each.line below
  read(callback)
  {
  	let _this = this;
  	fs.readFile(this.file_name, "utf-8", function read(err, data) {
      if (err) {
        throw err;
      }
      _this.content = data;
      _this.hasRead = true;
      callback(data);
    });
  }
  //Returns a list of accessible methods
  setDeterminer(){
  	//this.line = new statement();
    return [ this.line ];
  }

  //The current object here is represented as this.caller
  line(callback){
  	//if there are not yet contents, will read
  	if(!this.caller.hasRead){ 
  	  this.caller.read((data)=>{
        let result = utils.splitLines(data);
        //Will convert into statements
        let contents = [];
        for(let s in result)
        {
          contents.push(new statement(result[s]));
        }
        callback(contents);
  	  })
  	}
  }
}

class statement extends object{
  constructor(text)
  {
  	super();
  	this.contents = text;
  }
  
  find(fragment, callback)
  {
    //Finds all instances of the text on the same content
    //This function is blocking, which is not super-ideal for large statements...
    let result = []; 
    let index = 0;
    let chunks = this.contents.split(fragment);
    for (let c in chunks)
    {
      if (c >= chunks.length - 1) break;
      result.push(chunks[c].length + index);
      index += chunks[c].length + fragment.length;
    }

    callback(result);
  }

  count(fragment, callback)
  {
    this.find(fragment, (response)=>{
      callback(response.length);
    });
  }

  setDeterminer()
  {
    return [this.word];
  }

  //The current object here is represented as this.caller
  word(callback){
    let response = this.caller.contents.replace(/[.,?!;()"'-]/g, " ") //Exclude punctuation
      .replace(/(^\s*)|(\s*$)/gi,"") //exclude  start and end white-space
      .replace(/[ ]{2,}/gi," ") //2 or more space to 1
      .replace(/\n /,"\n") // exclude newline with a start spacing
      .split(" ");
    callback(response);
  }

  isUserStoryFormat()
  {
    return userStory.userExists(this) &&
      userStory.actionExists(this) &&
      userStory.purposeExists(this);
  }

  convertToUserStory()
  {
    return false; //WIP
  }
}

class userStory extends statement{
  constructor(text)
  {
    super(text);
  }
}

//Internal Static methods of the class userStory
userStory.userExists = function(content){
  let u = _consider.a.statement(content).where.first.word.is("As")
    .followedBy("a").getNext();
  return u != undefined;
}

userStory.actionExists = function(content){
  return false;
}

userStory.purposeExists = function(content){
  return false;
}

//WIP
class functionality extends object{
  constructor(f)
  {
    super();
  }
}

class tag {
  constructor(value){
    this.value = value;
  }
}

let _consider = new consider();

module.exports = _consider;

//Articles
_consider.article = article;
_consider.a = new article();
_consider.the = new article();

//objects
_consider.object = object; //Make sure to override the setDeterminer method if you inherit the object class
_consider.file = file;
_consider.functionality = functionality;
_consider.statement = statement;
_consider.userStory = userStory;
_consider.tag = tag;