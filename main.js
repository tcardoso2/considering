let fs = require('fs');
let utils = require('./utils.js');

/**
 * Main class "consider"
 * @returns {object} the main object.
 */
class consider {
  constructor(){
  	this.a = "x";
  }
}

/**
 * Base class where all other classes inherit from (except class "consider")
 * @returns {object} the object itself
 */
class base {
  constructor(){

  }

/**
 * Translates the current class name into a friendly name which can be printed (separates Camel casing into separate words)
 * @returns {object} the object itself
 */
  toFriendly(){
    return this.constructor.name.replace(/([A-Z])/g, ' $1');
  }
}
 
/**
 * Creates an article which can be added to the consider sintax (example, "a" in "consider.a", 
 * 'a' and 'the' are articles gramatically)
 * @returns {object} the object itself
 */
class article extends base {
  constructor(){
    super();
  }
/**
 * Returns a file object which the article points to
 * @param {number} src is the file path
 * @returns {object} the file object
 */
  file(src){
    return new file(src);
  }
/**
 * Returns a statement object which the article points to
 * @param {text} text is the statement's content in textual format, e.g. any sentence.
 * @returns {object} the statement object
 */
  statement(text){
	  return new statement(text);
  }
/**
 * Returns a userStory object which the article points to
 * @param {text} text is the statement's content in user story valid format, 
 * see isUserStoryFormat method of statement object for additional details.
 * @returns {object} the userStory object
 */
  userStory(text){
    return new userStory(text);  
  }
/**
 * Returns a functionality object which the article points to
 * @param {f} TODO: WIP
 * @returns {object} the functionality object (WIP)
 */
  functionality(f){
    return new functionality(f);  
  }
}

/**
 * Gramatically, the action or an instance of two or more events or things occurring 
 * at the same point in time or space, in a form of a word used to connect clauses or 
 * sentences or to coordinate words in the same clause.
 * Examples of conjunctions are where, but, if - in this case the valid conjunction for
 * the consider syntax is 'where', e.g. consider.a.statement.where...
 * @returns {object} the object itself which can be followed by any "determiner" object.
 */
class conjunction extends base {
  constructor(){
    super();
    this.each = new eachDeterminer();
    this.first = new firstDeterminer();
    this.last = new lastDeterminer();
  }
}

/**
 * Determiner is injected with specific functions from the object class.
 * However the injected function only works with what set is provided to them via the 'values' function
 * The caller must implement an iterator function which tells the determiner how values within the object 
 * are splited. 
 * This class cannot be directly used, instead, inherit and implement specific determiners.
 * Example: 'each'. consider.a.statement.where.each.<injected_function>
 * @returns {object} the object itself which is followed by the injected functions.
 */
class determiner extends base{
  constructor(){
    super();
  }

  inject(func, obj)
  {
    this[func.name] = func;
    this.caller = obj;
  }

  values()
  {
    throw new Error("Not Implemented");
  }

  resetIterator()
  {
    this.iterator = new iterator(this.caller.toArray());
  }
}
/**
 * Specific implementation of the 'each' determiner keyword
 * Example: 'each'. consider.a.statement.where.each.<injected_functions>
 * @returns {object} the object itself which is followed by the injected functions.
 */
class eachDeterminer extends determiner {
  values(){
    return this.caller.toArray();
  }
}

/**
 * Specific implementation of the 'first' determiner keyword
 * Example: 'first'. consider.a.statement.where.first.<injected_functions>
 * @returns {object} the object itself which is followed by the injected functions.
 */
class firstDeterminer extends determiner {
  values(){
    this.resetIterator();
    this.iterator.getNext();
    return this.caller.toArray()[0];
  }
}

/**
 * Specific implementation of the 'last' determiner keyword
 * Example: 'last'. consider.a.statement.where.last.<injected_functions>
 * @returns {object} the object itself which is followed by the injected functions.
 */
class lastDeterminer extends determiner {
  values(){
    let v = this.caller.toArray();
    return v[v.length - 1];
  }
}

//iterator (starts at -1 position)
class iterator extends base {
  constructor(arrayVal){
    super();
    this.pointer = -1;
    this.values = arrayVal;
    //this.getNext();
  }

  getNext(){
    this.pointer += this.isLast() ? 0 : 1;
    return this;
  }

  getPrev(){
    this.pointer -= this.isFirst() ? 0 : 1;
    return this;
  }

  isFirst(){
    return this.pointer < 0;
  }

  isLast(){
    return this.pointer == this.values.length-1;
  }

  followedBy(callback){
    callback(this.getNext());
    return this;
  }

  nextIs(value){
    this.getNext();
    return this.is(value);
  }

  is(value){
    if (value == this.val()){
      return this;      
    }
    throw new Error(`Value iterated is different from "${value}", expected "${this.val()}".`);
  }

  peek(){
    return this.values[this.pointer+1];
  }

  val(){
    return this.values[this.pointer];
  }

  goTo(el){
    do{
      this.getNext();
      if(this.isLast()) return false;
    } while (this.val() != el);
    return true;
  }
}

class object extends base {
  constructor(){
    super();
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
        val.inject(funcs[f], _this);
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

  //Should always return an array of its values to be iterated
  toArray()
  {
    //Should be overriden by children classes.
    throw new Error("Not Implemented");
  }

  iterator()
  {

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
      _this.contents = data;
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
        //this.caller.content = data;
        callback(this.values());
  	  })
  	}
    return new iterator(); //TODO: Implement a real iterator
  }

  toArray(){
    let result = utils.splitLines(this.contents);
    //Will convert into statements
    let content = [];
    for(let s in result)
    {
      content.push(new statement(result[s]));
    }
    return content;
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

  //this function is called by the injected determiner
  word(callback){
    if(callback) { callback(this.values()); }
    return this.iterator; //TODO: Implement a real iterator
  }

  toArray(){
    return this.contents.replace(/[.,?!;()"'-]/g, " ") //Exclude punctuation
      .replace(/(^\s*)|(\s*$)/gi,"") //exclude  start and end white-space
      .replace(/[ ]{2,}/gi," ") //2 or more space to 1
      .replace(/\n /,"\n") // exclude newline with a start spacing
      .split(" ");
  }

  hasUser()
  {
    return userStory.userExists(this);
  }

  hasAction()
  {
    return userStory.actionExists(this);
  }

  hasPurpose()
  {
    return userStory.purposeExists(this);
  }

  isUserStoryFormat()
  {
    return this.hasUser() && this.hasAction() && this.hasPurpose();
  }

  convertToUserStory()
  {
    if (!this.  isUserStoryFormat()){
      throw new Error("The current statment is not in a user story format.");
    }
    return false; //WIP
  }
}

class userStory extends statement{
  constructor(text)
  {
    super(text);
  }
/* Should implement the promisse functionality https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/Promise
    this[func.name + "Async"] = new Promise((resolve, reject)=>{
      resolve();
    })*/
}

//Internal Static methods of the class userStory
userStory.userExists = function(statement){
  let iterator = statement.where.first.word((content)=>{
  }).is("As").nextIs("a").getNext();
  return (iterator.val() != undefined)
    && (iterator.peek() == "I");
}

userStory.actionExists = function(statement){
  let iterator = statement.where.first.word((content)=>{
  });
  return iterator.goTo("I") && verb.isValid(iterator.peek());
}

userStory.purposeExists = function(statement){
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

class verb extends base{
  constructor(value){
    super();
    this.value = value;
    if (!this.validate()){
      //Tranlates the class name into a friendly name
      throw new Error(`'${this.value}' is not a valid ${this.toFriendly()}.`);
    }
  }

  validate(){
    throw new Error("validate method is Not Implemented");
  }
}

/*
an auxiliary verb that expresses necessity or possibility. 
English modal verbs include must, shall, will, should, would, 
can, could, may, and might.
*/
class modalVerb extends verb {
  constructor(value){
    super(value);
  }

  validate(){
    return verb.isModal(this.value);
  }
}

class auxiliaryVerb extends verb {
  constructor(value){
    super(value);
  }

  validate(){
    return verb.isAuxiliary(this.value);
  }
}

class otherVerb extends verb {
  constructor(value){
    super(value);
  }

  validate(){
    return verb.isOther(this.value);
  }
}

//Static accessors
verb.isModal = function(val) { return modalVerbEnum.includes(val) }
verb.isAuxiliary = function(val) { return auxiliaryVerbEnum.includes(val) }
verb.isOther = function(val) { return otherVerbEnum.includes(val) }
verb.isValid = function(val) { return (verb.isModal(val) || verb.isAuxiliary(val) || verb. isOther(val)) }

let modalVerbEnum = ["must", "shall", "will", "should", "would", "can", "could", "may", "might"];
let auxiliaryVerbEnum = ["be", "do", "have"];
let otherVerbEnum = ["want"]

//let modalVerb = ["should", ];
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
_consider.iterator = iterator;
_consider.verb = verb;
_consider.modalVerb = modalVerb;
_consider.auxiliaryVerb = auxiliaryVerb;
_consider.otherVerb = otherVerb;