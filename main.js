"use strict"

let fs = require('fs');
let utils = require('./utils.js');
let errors = require('./Errors.js');
let lodash = require('lodash/core');
let ko = require("knockout");

/**
 * Main class "consider", allows accessing and asserting objects, files, user stories
 * @returns {object} the main object.
 * @example
     //Example using 'should' library

     let chai = require('chai');
     let should = chai.should();
     let consider = require('considering');  

     consider.a.statement("As a user, I want to be able to create user stories so that I record my needs too.")
      .find("to", (response)=>{
        JSON.stringify(response).should.equal(JSON.stringify([18, 29, 45, 78]));
        done();
      })
      .count("to", (response)=>{
        response.should.equal(4);
        done();
      })
      .where.each.word((content)=>{
        content.length.should.equal(19);
        done();
      });
 */
class consider {
  constructor(){
  	this.a = "x";
  }
}

/**
 * Base class where all other classes inherit from (except class "consider")
 * @returns {Object} the object itself
 */
class base {
  constructor(){

  }

/**
 * Translates the current class name into a friendly name which can be printed (separates Camel casing into separate words)
 * @returns {Object} the object itself
 */
  toFriendly(){
    return this.constructor.name.replace(/([A-Z])/g, ' $1');
  }
}
 
/**
 * Creates an article which can be apended in from of the consider object syntax (example, "a"),
 * so that the consider syntax can be written "consider.a". 
 * 'a' and 'the' are articles gramatically). It allows accessing particular objects in front of the article,
 * e.g. see {file} class.
 * @example consider.a.<determiner>
 * @returns {Object} the object itself
 */
class article extends base {
  constructor(){
    super();
  }
/**
 * Returns a file object which the article points to
 * @param {number} src is the file path
 * @example consider.a.file(file_path)
 * @returns {Object} the {file} object
 */
  file(src){
    if (src instanceof file){
      return src;
    }
    return new file(src);
  }
 /**
 * Returns a statementsFile object which the article points to
 * @param {number} src is the file path
 * @example consider.a.file(file_path)
 * @returns {Object} the {file} object
 */
  statementsFile(src){
    if (src instanceof statementsFile){
      return src;
    }
    return new statementsFile(src);
  }
/**
 * Returns a statement object which the article points to
 * @param {text} text is the statement's content in textual format, e.g. any sentence.
 * @example consider.a.statement(some_sentence)
 * @returns {Object} the {statement} object
 */
  statement(text){
	  return new statement(text);
  }
/**
 * Returns a userStory object which the article points to
 * @param {text} text is the statement's content in user story valid format, 
 * see {isUserStoryFormat} method of {statement} for additional details.
 * @example consider.a.userStory(some_sentence_in_form_of_a_user_story)
 * @returns {Object} the {userStory} object
 */
  userStory(text, throwError){
    return new userStory(text, throwError);
  }
/**
 * Returns an userStory File which the article points to
 * @param {String} path is the path of the file containing the user stories,
 * @param {Function} callback is the callback function
 * @example consider.a.userStoryFile(path)
 * @returns {Object} the {userStoryFile} object
 */
userStoryFile(path, callback){
  return new userStoryFile(path, callback);
}
/**
 * Returns an epic object which the article points to
 * @param {text} text is the statement's content - does not need to be a user story format.
 * @example consider.a.epic(some_sentence)
 * @returns {Object} the {epic} object
 */
  epic(text){
    return new epic(text);  
  }
/**
 * Returns a functionality object which the article points to
 * @param {f} TODO: WIP
 * @example consider.a.functionlity(some_functionality)
 * @returns {Object} the {functionality} object (WIP)
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
 * @returns {Object} the object itself which can be followed by any {determiner} object.
 */
class conjunction extends base {
  constructor(){
    super();
    this.each = new eachDeterminer();
    this.first = new firstDeterminer();
    this.last = new lastDeterminer();
    this.eachTagged = new eachTaggedDeterminer();
  }
}

/**
 * Determiner is injected with specific functions from the object class.
 * However the injected function only works with what set is provided to them via the 'values' function
 * The caller must implement an iterator function which tells the {determiner} how values within the {object} 
 * are splited. 
 * This class cannot be directly used, instead, inherit and implement specialized determiners.
 * @returns {Object} the object itself which is followed by the injected functions.
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

  is(v){
    return this.iterator.val() == v;
  }
}
/**
 * Specific implementation of the 'each' determiner keyword
 * @example consider.a.statement.where.each.<injected_functions>
 * @returns {Object} the object itself which is followed by the injected functions.
 */
class eachDeterminer extends determiner {
  values(tag){
    return this.caller.toArray(); //caller is the object
  }
}

/**
 * Specific implementation of the 'first' determiner keyword
 * @example consider.a.statement.where.first.<injected_functions>
 * @returns {Object} the object itself which is followed by the injected functions.
 */
class firstDeterminer extends determiner {
  values(){
    this.resetIterator(); //resets to -1
    this.iterator.getNext();
    //Gets the first item
    return this.caller.toArray()[0];
  }
}

/**
 * Specific implementation of the 'last' determiner keyword
 * @example consider.a.statement.where.last.<injected_functions>
 * @returns {Object} the object itself which is followed by the injected functions.
 */
class lastDeterminer extends determiner {
  values(){
    let v = this.caller.toArray();
    return v[v.length - 1];
  }
}

/**
 * Specific implementation of the 'eachTagged' determiner keyword, which when used, expects a "matched" tag e.g. 
 * as an argument to "line", e.g. see "line" in statementFile class
 * Expects assessors (e.g. line), to have the tag select condition function to evaluate
 * @example consider.a.statement.where.eachTagged.line(..., matchTag)>
 * @returns {Object} the object itself which is followed by the injected functions.
 */
class eachTaggedDeterminer extends determiner {
  values(matchTag){
    let allValues = this.caller.toArray();
    return lodash.filter(allValues, x => x.hasTag(matchTag));
  }
}

/**
 * Iterator class which is used as part of the consider sintax.
 * The iterator starts at -1 position. The object has then several methods
 * which can be used to iterate through the values of the object.
 * @param {Array} [arrayVal=[]] is the array of values to add to the {iterator}.
 * @example let statement = consider.a.statement("As a user, I want to be able to create user stories so that I record my needs.");
    let iterator = statement.where.first.word((content)=>{ 
      content.should.equal("As");
    }).followedBy((content) => {
      content.val().should.equal("a");
    }).getNext();
    iterator.val().should.equal("user");
 * @returns {Object} the {iterator} object
 */
class iterator extends base {
  constructor(arrayVal){
    super();
    this.pointer = -1;
    this.values = arrayVal;
    this.lastIteration = [];
    //this.getNext();
  }
/**
 * Gets the next value of the iterator. When the iterator object is created it starts its position at -1.
 * This means the user must invoque this method to access the first item in the iterator.
 * @argument {int} i is the number of times to getNext, if not provided assumes 1
 * @returns {Object} a reference to the {iterator}, so that the user can "chain" the result directly with other
 * iterations.
 */
  getNext(i){
    if(!i) i = 1;
    while(i>0){
      i-=1;
      this.pointer += this.isLast() ? 0 : 1;
      this.lastIteration.push(this.val());
    }
    return this;
  }
/**
 * Gets the previous value of the iterator.
 * @argument {int} i is the number of times to getPrev, if not provided assumes 1
 * @returns {Object} a reference to the {iterator}, so that the user can "chain" the result directly with other
 * iterations.
 */
  getPrev(i){
    if(!i) i = 1;
    while(i>0){
      i-=1;
      this.pointer -= this.isFirst() ? 0 : 1;
      this.lastIteration.push(this.val());
    }
    return this;
  }
/**
 * Checks if the iterator is pointing to the first item.
 * @returns {Boolean} true if the index = 0. Notice this is not the case when the iterator is first instantiated.
 */
  isFirst(){
    return this.pointer == 0;
  }
/**
 * Checks if the iterator is pointing to the last item.
 * @returns {Boolean} true if the index = length-1
 */
  isLast(){
    return this.pointer == this.values.length-1;
  }
/**
 * Checks if the iterator has a values after the current one.
 * @returns {Boolean} if has not reached the end
 */
  hasNext(){
    return !this.isLast();
  }
/**
 * Checks if the iterator has a values before the current one.
 * @returns {Boolean} if has not pointing to the first value
 */
  hasPrev(){
    return !this.isFirst();
  }
/**
 * Allows to specify a callback which receives the iterator's next value.
 * It causes the iterator to move to the next value
 * @param {Function} callback function whjch takes the iterator as input pointing to the next value.
 * @returns {Object} a reference to the {iterator}, so that the user can "chain" the result directly with other
 * iterations.
 */
  followedBy(callback){
    callback(this.getNext());
    return this;
  }
/**
 * Checks if next value of the iterator equals the input
 * @param {Object} value to compare with.
 * @returns {Boolean} true if the iterator's next value equals the supplied input.
 */
  nextIs(value){
    this.getNext();
    return this.is(value);
  }
/**
 * Checks if next value of the iterator does not equals the input
 * @param {Object} value to compare with.
 * @returns {Boolean} true if the iterator's next value does not equal the supplied input.
 */
  nextIsnt(value){
    this.getNext();
    return this.isnt(value);
  }
/**
 * Checks if the current value of the iterator equals the supplied input.
 * @param {Object} value to compare with.
 * @returns {Object} a reference to the {iterator} in case the comparison is true, Otherwise throws an {Error}.
 */
  is(value){
    if (value == this.val()){
      return this;      
    }
    throw new Error(`Value iterated is different from "${this.val()}", expected "${value}".`);
  }
/**
 * Checks if the current value of the iterator does not equal the supplied input.
 * @param {Object} value to compare with.
 * @returns {Object} a reference to the {iterator} in case the comparison is true, Otherwise throws an {Error}.
 */
  isnt(value){
    if (value != this.val()){
      return this;      
    }
    throw new Error(`Value iterated is same as "${this.val()}", expected not to be so.`);
  }
/**
 * Returns (peeks) the next value of the {iterator}, maintaining its state,
 * that is, not moving the iterator pointer to the next value
 * @returns {Boolean} the next value of the {iterator}.
 */
  peek(){
    return this.values[this.pointer+1];
  }
/**
 * Returns the current value of the iterator, maintaining its state.
 * @returns {Boolean} the current value of the {iterator}.
 */
  val(){
    return this.values[this.pointer];
  }
/**
 * Iterates to the next values of the iterator until it finds the element passed as input.
 * NOTE: This is an expensive method, so use it only for small iterators.
 * @param {Object} el is the element to find.
 * @returns {Boolean} true if the value is found. It leaves the {iterator} in the state pointing to that value. Otherwise returns false and leaves the {iterator} in it's last position.
 */
  goTo(el){
    this.lastIteration = [];
    do{
      this.getNext();
      if(this.isLast()) return false;
    } while (this.val() != el);
    return true;
  }
/**
 * Produces a statement between the current iterator and the value of another one
 * NOTE: This is an expensive method, so use it only for small iterators.
 * @param {Object} iter is the iterator to go to.
 * @returns {Object} the statement.
 */
  until(iter){
    if (!lodash.isEqual(iter.values,this.values)) throw new Error("Iterators should have both the same contents.")
    this.goTo(iter.val());
    return new statement(this.lastIteration.join(" "));
  }
/**
 * Gets the remainder of the string from the iterator's pointer till the end. It changes the pointer state
 * @param {String} until if provided will provide the respective string until that item
 * @returns {String} the remaining string.
 */
  toEndString(until){
    let result = this.val();
    while(this.hasNext()){
      this.getNext();
      if (!result) 
        result = this.val(); //This is just to ensure that the sentence does not end up having 'undefined' in it because the pointer is not yet initialized.
      else {
        if(this.val() == until) return result;
        result += " " + this.val();
      }
    }
    return result;
  }
}
/**
 * Object is something which follows the article (e.g. "a", or "the"). This is a generic class which should be
 * inherited by specialized classes (e.g. see {file} or {statement} classes).
 * This base class defines methos which are common accross all objects.
 * @example consider.a.<object>
 * @returns {Object} the object itself.
 */
class object extends base {
  constructor(){
    super();
  	//An object can be always connected with a conjunction
    this.where = new conjunction();
    let _this = this;
    this.tags = [];
    this.children = []; //Contains abstract items which compose the object, might not be used by all objects
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
/**
 * Attaches a tag value to the current object. An object may have many tags.
 * @param {Object} tag is the tag instance to add to the objet, or a string value
 * @returns {Object} the object itself, so that the expression can be chained.
 */
  tag(tag){
    //Stores the actual value of the tag instead of the object for search optimization
    this.tags.push(typeof(tag) == "string" ? tag : tag.value);
    //Allow chaining so the main object is returned
    return this;
  }
/**
 * Removes an existing tagged defined by an input.
 * @param {string} tag is the tag instance to remove from the object. If the tag does not exist it does not fail.
 * @returns {Object} the object itself, so that the expression can be chained.
 */
  unTag(tag){
    let i = this.tags.indexOf(tag);
    if(i != -1) {
      this.tags.splice(i, 1);
    }
    //Allow chaining so the main object is returned
    return this;    
  }
/**
 * Checks if the current object has any tag.
 * @returns {Boolean} true if there are any tags attached to the current object.
 */
  hasTags(){
    return this.tags.length > 0;
  }
/**
 * Checks if the current object has the tag supplied by the input paramenter.
 * @param {string} value is the value of the tag to find.
 * @returns {Boolean} true if there is any tag with the same value as the input
 */
  hasTag(value){
    return this.tags.includes(value);
  }
/**
 * Must be implemented by specialized sub-classes. Depending on the implementation should find a fragment and follow-up with a callback function 
 * @param {Object} fragment to find.
 * @param {Function} callback to call.
 */
  find(fragment, callback)
  {
    //Should be overriden by children classes.
    throw new Error("Not Implemented");
  }
/**
 * Clears the contents of the object
 */
  clear()
  {
    //Should be overriden by children classes.
    throw new Error("Not Implemented");
  }
/**
 * Returns if an object is empty
 */
  isEmpty()
  {
    //Should be overriden by children classes.
    throw new Error("Not Implemented");
  }
/**
 * Must be implemented by specialized sub-classes. Depending on the implementation should count the number of fragments and follow-up with a callback function 
 * @param {Object} fragment to find.
 * @param {Function} callback to call.
 */
  count(fragment, callback)
  {
    //Should be overriden by children classes.
    throw new Error("Not Implemented");
  }

/**
 * Must be implemented by specialized sub-classes and return the object's contents as an array.
 * Should always return an array of its values to be iterated
 */
  toArray()
  {
    //Should be overriden by children classes.
    throw new Error("Not Implemented");
  }
/**
 * appends content to the current object
 */
  append()
  {
    //Should be overriden by children classes.
    throw new Error("Not Implemented");
  }

  iterator()
  {

  }
/**
 * Calculates an array with all the items in the object and sends it to a callback function. Only usable by sub-classes
 * which implement the iterator() and the toArray() methods. 
 * @param {Function} callback function, the first argument is an array with all the words contained in the statement.
 * @param {Boolean} chainCaller if true, will chain the caller object again instead of the iterator object.
 * @example consider.a.<object>(?)
      .where.each.<determiner>((content)=>{
      }); 
 */
  determinerDefault(callback, chainCaller = false){
    if(callback) { 
      callback(this.values()); 
    }
    if(this.iterator) {
      return this.iterator;
    }
    if (chainCaller) {
      return this;
    }
  }
/**
 * Must be implemented by specialized sub-classes
 * @returns {Array} the overriden method should return an array of functions, which can be accessed by the object
 */
  setDeterminer()
  {
  	//Should return the array of functions allowed after the determiner.
    throw new Error("You should set the determiner of the object by inheriting it. HINT: do not use object class directly");
  }
}
/**
 * Specialized file object implementation it expresses a real existing file on disk, specified by a file path in the constructor.
 * @example consider.a.file(file_name)
 * @returns {Object} the object itself.
 */
class file extends object{
  constructor(file_name)
  {
  	super();
  	if (file_name && typeof(file_name) === "string"){
  	  if (fs.existsSync(file_name)) {
  	    this.file_name = file_name;
  	  }
  	  else
  	  {
  	  	throw new Error(`File "${file_name}" not found`);
  	  }
  	} else {
      throw new Error("File path is a mandatory field and it must be a string.");      
    }
  	this.contents;
  	//This state allows re-reading if the determiner is used instead of read
  	this.hasRead = false;
  }
/**
 * Reads a file's contents and sends these as parameters to a callback function.
 * A file can be read in 2 ways:
 * (1) Either by calling the method below, or
 * (2) (preferred method for big files) by using the determiner file.where.each.line below
 * @param {Function} callback to call. The first argument of the callback is a string with the full contents of the file.
 * @example     let file1 = consider.a.file("./test/test_file1.txt");
    file1.read((contents)=>{
      console.log(contents);
      contents.should.equal("This is just a test content.");
      done();
    });
 */
  read(callback)
  {
  	let _this = this;
  	fs.readFile(this.file_name, "utf-8", function read(err, data) {
      if (err) {
        throw err;
      }
      _this.contents = _this.deserialize(data);
      _this.hasRead = true;
      callback(data);
    });
  }
/**
 * If required, deserializes the content while performing a read operation
 * @param {String} text is the serialized data to parse.
 * @returns {Object} the parsed/deserialized object.
 * @private
 */
  deserialize(text){
    return text;
  }
/**
 * Sets which specialized methods are accessible by the specialized class
 * @private
 */
  setDeterminer(){
  	//this.line = new statement();
    return [ this.line ];
  }

/**
 * truncates the file on disk, but not any in-memory data already loaded
 */
  clearFileInDisk(){
    fs.writeFileSync(this.file_name,'');
  }
/**
 * truncates the file
 */
  isEmpty(){
    return fs.readFileSync(this.file_name) == '';
  }
/**
 * Reads a file's contents via a line assessor. Preferred method for large files.
 * @param {Function} callback to call. The first argument of the callback is an array of lines (string) of the file's contents.
 * @example    let file1 = consider.a.file("./test/test_file2.txt")
    file1.where.each.line((content)=>{
      content.length.should.equal(2);
      done();
    });
 * @returns {Object} an {iterator} of the {object} (WIP, not ready to be used).
 */
  line(callback){
  	//if there are not yet contents, will read
  	if(!this.caller.hasRead){ 
  	  this.caller.read((data)=>{
        //this.caller.content = data;
        callback(this.values());
  	  })
  	}
    return new iterator();
  }
/**
 * Returns the file's contents as an Array of {statement} objects
 * @returns {Object} an array of {statement} objects.
 */
  toArray(){
    let result = utils.splitLines(this.contents);
    //Will convert into statements
    let content = [];
    for(let s in result)
    {
      content.push(new statement(result[s].replace(/\n/,"").replace(/\r/,""))); // exclude newlines
    }
    return content;
  }
/**
 * Appends statements' contents to a file.
 * @param {Object} s, the statement object to add
 * @param {Function} option callback to call, in case provided will append in async way, and re-send the object as first argument of the callback
 * @returns {Object} the curent object
 */
  append(s, callback){
    console.log("  >> Calling append to file...");
    if(s instanceof statement){
      if (!callback){
        fs.appendFileSync(this.file_name, this.isEmpty() ? s.contents : `\n${s.contents}`);
        console.log("  >> Sync way, no callback, finished.");
      } else {
        let _this = this;
        fs.appendFile(this.file_name, s.contents, function (err) {
          if (err) throw err;
          //Verifying that the data is really there
          console.log("  >> Async way, callback successfull, confirming the file's contents by doing a readSync...");
          let data = fs.readFileSync(_this.file_name)
          console.log(`  >> Contents read from file are: ${data}`);
          //Only then calling callback
          callback(_this);
        });
      }
    }
    else{
      throw new Error("Only statements are allowed to append to a file's contents.");
    }
    return this;
  }
}

/**
 * Specialized statementsFile which allows storing more contextual information on files (e.g. Tags, etc...)
 * @example consider.a.statementsFile(file_name)
 * @returns {Object} the object itself.
 */
class statementsFile extends file{
  constructor(file_name)
  {
    super(file_name);
  }
/**
 * Appends statements to a file (serialized object)
 * @param {Object} s, the statement object to add
 * @param {Function} mandatory callback to call, in this case mandatory because the file needs to be read and that is an async operation
 * @returns {Object} the curent object
 */
  append(s, callback){
    console.log(">> Calling append to statementsFile...");
    if (!callback) throw new Error("callback must be provided for statementsFile read as this only supports async reading.");
    //statementsFile Object works differently because we are appending to the existing object and for that we first must read.
    //Making it sync to avoid race condition
    let data = fs.readFileSync(this.file_name, "utf-8");
    console.log(">>>>> Contents of file before appending: ", data);
    if(!this.contents) this.contents = [];
    this.contents.push(s);
    //We will now append a tring using the super.append as we'd be just creating data from scratch, so we actually delete the contents of the file
    this.clearFileInDisk();
    super.append(new statement(JSON.stringify(this.contents)), callback);
  }
/**
 * Override of the read method from the file class
 * @param {Function} callback to call. The first argument of the callback is a string with the full contents of the file.
 * @example     let file1 = consider.a.statementsFile("./test/test_file1.txt");
    file1.read((contents)=>{
      console.log(contents);
      contents.should.equal("This is just a test content.");
      done();
    });
 */
  read(callback)
  {
    console.log(`  >> Calling read async ${this.file_name}`);
    //TODO: Allow sync reading as well?
    let _this = this;
    fs.readFile(this.file_name, "utf-8", (err, data) => {
      if (err) {
        throw err;
      }
      console.log(`  >> read async successful. Raw data is: '${data}'`);
      let deserialized;
      try {
        deserialized = _this.isEmpty() ? {} : JSON.parse(data);
      } catch(e) {
        if(e instanceof SyntaxError) {
          console.error("data is in invalid Json format!, is the file corrupted?");
        }
      } 
      console.log(`  >> deserialized data: ${deserialized[0].tags}, ${deserialized[0].contents}`);
      _this.contents = _this.deserialize(data);
      _this.hasRead = true;
      console.log(`  >> callback with final content: ${JSON.stringify(_this.contents)}`);
      callback(_this.contents);
    });
  }
 /**
  * override of the default line assessor for statementFiles, it returns the line or lines depending on the
  * determiner used.
  * @param {Function} callback is a function to handled the result.
  * @param {String} match is criteria for selecting the statements based on the mathing tag 
  * @returns {Object} the current object iterator
  * @example  consider.a.statementsFile('./some/file.path').where.eachTagged.line((content)=>{
            console.log(`This is a content tagged as "User Story": ${content.contents}`);
          }, "User Story" ); 
  */
  line(callback, match){
    //if there are not yet contents, will read
    if(!this.caller.hasRead){
      this.caller.read((data)=>{
        callback(this.values(match)); //data);
      })
    }
    return new iterator();
  }
/**
 * Returns the statementFile's contents as an Array of {statement} objects => in this case just returns this.contents
 * @returns {Object} an array of {statement} objects.
 */
  toArray(){
    return this.contents;
  }
/**
 * deserializes text from a statementFile into an actual array of statement objects.
 * @param {String} text is the serialized data to parse.
 * @returns {Object} the parsed/deserialized object.
 * @private
 */
  deserialize(text){
    let deserialized = this.isEmpty() ? {} : JSON.parse(text);
    let result = [];
    //Reconstructing the actual objects...
    for(let d in deserialized){
      let s = new statement(deserialized[d].contents);
      for(let t in deserialized[d].tags){
        s.tag(deserialized[d].tags[t]);
      }
      result.push(s);
    }
    return result;
  }
/**
 * Returns basic summary information about current statements, with regards to user story stats.
 * @param {Function} callback to send the results to. The first argument of the callback is a 
 * JSON output json explaining the facts.
 * @param {Bool} by default re-reads the file's contents (true), if false skips reading
 */
  getUserStorySummary(callback, read = true){
    if(callback)
    {
      if(read){
        this.read(()=>{
          let valid = lodash.filter(this.contents, x => x.isUserStoryFormat());
          let invalid = lodash.filter(this.contents, x => !x.isUserStoryFormat());
          let tags = lodash.flatten(lodash.map(this.contents, 'tags'));
          //sumBy
          this.lastSummary = {
            totals: {
              valid: valid.length,
              invalid: invalid.length,
              tags: tags.length
            },
            invalidStatements: invalid,
            invalid: {
              getInvalidUserItems : ()=>{
                return lodash.filter(this.lastSummary.invalidStatements, x => !x.hasUser(false));
              },
              getInvalidActionItems : ()=>{
                return lodash.filter(this.lastSummary.invalidStatements, x => !x.hasAction(false));
              },
              getInvalidPurposeItems : ()=>{
                return lodash.filter(this.lastSummary.invalidStatements, x => !x.hasPurpose(false));
              }
            },
            validUserStories: lodash.map(valid, x => x.convertToUserStory()),
          };
          callback(this.lastSummary);
        });
      }
    }
  }
}

/**
 * Specialized statement object implementation (inherits {object}). It expresses any text statement (e.g. a sentence).
 * @example consider.a.statement(text)
 * @returns {Object} the object itself.
 */
class statement extends object{
  constructor(text)
  {
  	super();
    if(typeof text != "string") throw new Error(`Expected "string" to be provided as parameter but got "${typeof text}" instead.`);
    this.contents = text;
    this.setContents = (contents) => this.contents = contents;
    this.getContents = () => this.contents;
    this.hasContents = () => !this.contents !== true;
  }
/**
 * Finds all instances of the text on the same content
 * This function is blocking, which is not super-ideal for large statements...
 * @param {String} fragment is the String to search for.
 * @param {Function} callback to send the results to. The first argument of the callback is an array of matching indexes.
 * @example     consider.a.statement("As a user, I want to be able to create user stories so that I record my needs too.")
      .find("to", (response)=>{
        JSON.stringify(response).should.equal(JSON.stringify([18, 29, 45, 78]));
        done();
      });
 * @returns {Object} the current object, to allow chaining
 */  
  find(fragment, callback)
  {
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
    return this;
  }

/**
 * Counts all instances of the text on the same content
 * This function is blocking, which is not super-ideal for large statements...
 * @param {String} fragment is the String to search for.
 * @param {Function} callback to send the count results to. The first argument of the Integer number of occurencies.
 * @example         consider.a.statement("As a user, I want to be able to create user stories so that I record my needs.")
      .count("to", (response)=>{
        response.should.equal(3);
        done();
      });
 * @returns {Object} the current object, to allow chaining
 */ 
  count(fragment, callback)
  {
    this.find(fragment, (response)=>{
      callback(response.length);
    });
    return this;
  }
/**
 * Returns the function names which can be attached to this object. In this case "word", which allows to write the code as in the example.
 * @internal
 * @example consider.a.statement("As a user,I want to be able to create user stories, so that I record my needs , alright ? ")
      .where.each.word((content)=>{
        content.length.should.equal(19);
        done();
      });
 */ 
  setDeterminer()
  {
    return [this.word];
  }
/**
 * Calculates an array with all the words in a statement and sends it to a callback function.
 * @param {Function} callback function, the first argument is an array with all the words contained in the statement.
 * @example consider.a.statement("As a user,I want to be able to create user stories, so that I record my needs , alright ? ")
      .where.each.word((content)=>{
        content.length.should.equal(19);
        done();
      });
 */ 
  word(callback){
    //this function is called by the injected determiner
    if(callback) { callback(this.values()); } //values is actually a method of the determiner, not the object itself, see the determiner classes
    return this.iterator;
  }
/**
 * Converts the statement object contents to an array of words
 * @returns {Array} array of words (String)
 */
  toArray(){
    return this.contents.replace(/[.,?!;()"'-]/g, " ") //Exclude punctuation
      .replace(/(^\s*)|(\s*$)/gi,"") //exclude  start and end white-space
      .replace(/[ ]{2,}/gi," ") //2 or more space to 1
      .replace(/\n /,"\n") // exclude newline with a start spacing
      .replace(/\r /,"") // exclude \r
      .split(" ");
  }
/**
 * Checks if the current statement has a user, from a valid User Story perspective
 * @param {Boolean} throwsError defaults to true, will throw an error if statement has no user, false otherwise
 * @example     let statement = consider.a.statement("As a <<user>>, I want to be able to create user stories so that I record my needs.")
    statement.hasUser().should.equal(true);
 * @returns {Boolean} true if the user exists
 */
  hasUser(throwsError = true)
  {
    try{
      return userStory.userExists(this);
    } catch(e){
      if (throwsError) throw e;
      return false;
    }
  }

/**
 * Checks if the current statement has an action, from a valid User Story perspective
 * @param {Boolean} throwsError defaults to true, will throw an error if statement has no action, false otherwise
 * @example     let statement = consider.a.statement("As a user, I want to <<be able to create>> user stories so that I record my needs.")
    statement.hasAction().should.equal(true);
 * @returns {Boolean} true if the action exists
 */
  hasAction(throwsError = true)
  {
    try{
      return userStory.actionExists(this);
    } catch(e){
      if (throwsError) throw e;
      return false;
    }
  }

/**
 * Checks if the current statement has a purpose, from a valid User Story perspective
 * @param {Boolean} throwsError defaults to true, will throw an error if statement has no purpose, false otherwise
 * @example     let statement = consider.a.statement("As a user, I want to be able to create user stories so that <<I record my needs>>.")
    statement.hasPurpose().should.equal(true);
 * @returns {Boolean} true if the purpose exists
 */
  hasPurpose(throwsError = true)
  {
    try{
      return userStory.purposeExists(this);
    } catch(e){
      if (throwsError) throw e;
      return false;
    }
  }
/**
 * Checks if the current statement has a valid user story format, that is a user AND an action AND a purpose
 * @returns {Boolean} true if the purpose exists
 */
  isUserStoryFormat()
  {
    try{
      return this.hasUser() && this.hasAction() && this.hasPurpose();
    } catch(e){
      return false;
    }
  }
/**
 * Converts the current {statement} object into a {userStory} object
 * @returns {object} the userStory object
 */
  convertToUserStory()
  {
    let result;
    if (!this.isUserStoryFormat()){
      throw new errors.userStoryError("The current statement is not in a user story format.", this);
    }
    else{
      return new userStory(this.contents);
    }
  }
}

//This controls the Json output of the statement class, not printing
//unecessary (circular) members
statement.prototype.toJSON = function() {
  let copy = ko.toJS(this); //easy way to get a clean copy
  let props = Object.getOwnPropertyNames(copy);
  delete copy.where;
  return copy; //return the copy to be serialized
};

/**
 * Specialized userStory object implementation (inherits {statement}). It expresses any text statement (e.g. a sentence) in a valid user story format.
 * @param {String} contents is the text of the user story
 * @param {bool} throwError if true means the contructor will throw an exception if not in the correct format. By default does not thow Error.
 * @example consider.a.userStory(text)
 * @returns {Object} the object itself.
 */
class userStory extends statement{
  constructor(contents, throwError = false)
  {
    if (throwError){
      new statement(contents).convertToUserStory();
    }
    super(contents);
    let epicRef = undefined;
    this.getEpic = () => epicRef;
    this.setEpic = (e) => {
      if (e && (e instanceof epic)) {
        epicRef = e;
        epicRef.append(this);
      }
      else {
        throw new Error("Error: a valid epic object must be providing when setting the epic of a user story");
      }
    }
  }
/**
 * if successful
 * @param {function} the callback function, which as first argument returns if user story has a user and second argument the user text
 * @returns {object} the userStory object
 */
  user(callback)
  {
    callback(this.hasUser(), userStory.userIter(this).val());
    return this;
  }

  action(callback)
  {
    let _action = userStory.actionIter(this);
    callback(this.hasAction(), _action.val());
    return this;
  }

  purpose(callback)
  {
    //Todo: have a function create a correlation object, or create a class
    let correlation = {
      users: userStory.actionStatement(this)
    }
    callback(this.hasPurpose(), userStory.purposeIter(this).toEndString(), this.correlations());
    return this;
  }

  correlations(){
    return new correlation(this);
  }

  isUserStoryFormat(){
    //For this implementation we are not catching the errors meaning it could fail
    return this.hasUser() && this.hasAction() && this.hasPurpose()
  }
/**
 * groups the current user story with another one and into an epic, if not exists, creates the epic
 * @param {object} us, the user story to group with
 * @returns {object} the epic object
 */
  groupWith(us, epicName)
  {
    if(us && (us instanceof userStory)){
      if(!this.getEpic()) this.setEpic(new epic("Unnamed epic"))
      this.getEpic().append(us);
      return this.getEpic();
    } else {
      throw new Error("Error: correlation expects first argument of type UserStory");
    }
  }
}

/**
 * Class which encapsulates a correlation object
 * @param {UserStory} should receive as first argument a user story object
 * @returns {Object} the object itself.
 */
class correlation extends base{
  constructor(us){
    super();
    if(us && (us instanceof userStory)){
      this._parseActionStatement(us);
      this._parseUsers(us);        
    } else {
      throw new Error("Error: correlation expects first argument of type UserStory");
    }
  }

  _parseActionStatement(us){
    this.actionStatement = "";
    us.action((ok, action)=>{
      if(ok){
        this.action = action;
        let iter = userStory.actionIter(us);
        iter.getNext(); //Skip the action itself
        this.actionStatement = iter.toEndString("so");
      }
    });
  }

  _parseUsers(us){
    this.users = []
    us.user((ok, user)=>{
      if(ok){
        this.users.push(user);
      }
    });
  }
}

/**
 * Internal Static Function which checks if a user exists from a User Story perspective, given statement as parameter. Used by the {statement} object.
 * @param {Object} statement is the statement to check 
 * @internal
 * @returns {Boolean} true if the statement has a user, throws error if not
 */
 userStory.userExists = function(statement){
  //try{
    let iterator = userStory.userIter(statement);
    return (iterator.val() != undefined)
      && (iterator.peek() == "I");
  /*}catch(e){
    return false;
  }*/
}

userStory.userIter = function(statement){
  let iterator = statement.where.first.word((content)=>{
    }).is("As").nextIs("a").nextIsnt("I");
  return iterator;
}

/**
 * Internal Static Function which checks if an action exists from a User Story perspective, given statement as parameter. Used by the {statement} object.
 * @param {Object} statement is the statement to check 
 * @internal
 * @returns {Boolean} true if the statement has an action.
 */
userStory.actionExists = function(statement){
  let iterator = userStory.actionIter(statement);
  return verb.isValid(iterator.val());
}

userStory.actionIter = function(statement){
  let iterator = statement.where.first.word((content)=>{
    }).is("As").nextIs("a");
  iterator.goTo("I");
  return iterator.getNext();
}

userStory.actionStatement = function(statement){
  let iterator = userStory.actionIter(statement);
  return iterator.until(userStory.purposeIter(statement).getPrev(3)); //Needs to iterate back 3 times because needs to go back from "so that I"
}

/**
 * Internal Static Function which checks if a purpose exists from a User Story perspective, given statement as parameter. Used by the {statement} object.
 * @param {Object} statement is the statement to check 
 * @internal
 * @returns {Boolean} true if the statement has a purpose.
 */
 userStory.purposeExists = function(statement){
  let iterator = userStory.purposeIter(statement);
  return verb.isValid(iterator.peek());
}

userStory.purposeIter = function(statement){
  let iterator = statement.where.first.word((content)=>{
    }).is("As").nextIs("a");
  iterator.goTo("so");
  iterator.nextIs("that").getNext();
  return iterator;
}

/**
 * Specialized epic object implementation (inherits {statement}). It expresses any text statement (e.g. a sentence) in a valid user story format.
 * @param {String} contents is the text of the user story
 * @param {bool} throwError if true means the contructor will throw an exception if not in the correct format. By default does not thow Error.
 * @example consider.a.userStory(text)
 * @returns {Object} the object itself.
 */
class epic extends statement{
  constructor(contents)
  {
    super(contents);
  }

/**
 * appends a user story to the epic
 * @returns {Object} the object itself.
 */
  append(obj)
  {
    if(!(obj instanceof userStory)) throw new Error("The object appended is not of instance userStory.");
    this.children.push(obj);
    return this;
  }
/**
 * Returns the function names which can be attached to this object. In this case "userStory", which allows to write the code as in the example.
 * @returns {Array} An array with the user story object.
 */ 
  setDeterminer()
  {
    return [this.userStory];
  }
/**
 * Calculates an array with all the words in a statement and sends it to a callback function.
 * @param {Function} callback function, the first argument is an array with all the words contained in the statement.
 * @example consider.a.epic(epic1)
      .where.each.userStory((content)=>{
        content.length.should.equal(2); //Epic has 2 user stories
        done();
      });
 */ 
  userStory(callback){
    return super.determinerDefault(callback);
  }
/**
 * Returns the function names which can be attached to this object. In this case "userStory", which allows to write the code as in the example.
 * @param {String} text which the epic should be changed to
 * @returns {Object} the epic object
 */ 
  renameAs(text)
  {
    this.setContents(text);
    return this;
  }
/**
 * Overriden to simply returns the items
 */
  toArray(){
    return this.children;
  }
}

/**
 * Specialized userStoryFile which allows storing more contextual information on user Stories (e.g. user, action, purpose)
 * @example consider.a.userStoryFile(file_name)
 * @param {string} file_name the user stories file name
 * @param {Function} callback This constructor has a callback as internally reads automatically the file, it can run without a constructor, but it is best to use a callback
 * @returns {Object} the object itself.
 */
class userStoryFile extends epic {
  constructor(file_name, callback)
  {
    let file = new statementsFile(file_name);
    super(file_name);
    let that = this;
    let invalid = [];
    file.read((contents) => {
      //Appends each story
      for(let c in contents){
        if(contents[c].isUserStoryFormat()){
          that.append(new userStory(contents[c].contents));
        } else {
          console.warn(`User story is invalid!: ${contents[c].getContents()}`)
          invalid.push(contents[c]);
        }
      }
      if (callback) callback(that);
    });
/**
 * Gets the underlying statementsFile object
 * @example consider.a.userStoryFile(file_name).getStatementsFile()
 * @returns {Object} the underlying statementsFile object
 */
    this.getStatementsFile = () => file;
/**
 * Gets the invalid User Stories
 * @example consider.a.userStoryFile(file_name).getInvalidStatements()
 * @returns {Object} the underlying Array of statements object (invalid user stories)
 */
    this.getInvalidStatements = () => invalid;
}
/**
 * Returns the function names which can be attached to this object. In this case "userStory", which allows to write the code as in the example.
 * @returns {Array} An array with the user story object.
 */ 
  setDeterminer()
  {
    return [this.userStory, this.invalidUserStory];
  }
/**
 * Calculates an array with all the valid user stories and sends it to a callback function.
 * @param {Function} callback function, the first argument is an array with all the words contained in the statement.
 * @example consider.a.userStoryFile(<path>, (file) => {
      file.where.each.userStory((content)=>{
        content.length.should.equal(2); //Epic has 2 user stories
        done();
      });
    });
 */ 
  userStory(callback){
    //2nd arg is true => Means it will allow chaining returning the main object (caller)
    return super.determinerDefault(callback, true);
  }

/**
 * Returns an array with all the invalid valid user stories and sends it to a callback function.
 * @param {Function} callback function, the first argument is an array with all the words contained in the statement.
 * @example consider.a.userStoryFile(<path>, (file) => {
      file.where.each.invalidUserStory((content)=>{
        content.length.should.equal(2); //Epic has 2 user stories
        done();
      });
    });
 */ 
  invalidUserStory(callback){
    if(callback) { 
      callback(this.caller.getInvalidStatements()); 
    }
    //Automatically chained
    return this;
  }
}

/**
 * WIP (TODO: Document)
 */
class functionality extends object{
  constructor(f)
  {
    super();
  }
}

/**
 * Tag class. Used to tag objects such as statements and User Stories
 * @param {String} value is the tag text to match
 * @returns {Boolean} true if matched  
 */
 class tag extends object{
  constructor(value){
    super();
    this.value = value;
  }
/**
 * Returns true if value matches the tag's value
 * @private
 */
  equals(value){
    return this.value == value;
  }
/**
 * Sets which specialized methods are accessible by the specialized class
 * @private
 */
  setDeterminer(){
    //this.line = new statement();
    return [ ];
  }
}

/**
 * WIP (TODO: Document)
 */
 class verb extends base{
  constructor(value){
    super();
    this.value = value;
    if (!this.validate()){
      //Tranlates the class name into a friendly name
      throw new Error(`'${this.value}' is not a valid ${this.toFriendly()}.`);
    }
  }

/**
 * WIP (TODO: Document)
 */
  validate(){
    throw new Error("validate method is Not Implemented");
  }
}

/**
 * Gramatically an auxiliary verb that expresses necessity or possibility. 
 * English modal verbs include must, shall, will, should, would, 
 * can, could, may, and might.
 * WIP (TODO: Document)
 */
 class modalVerb extends verb {
  constructor(value){
    super(value);
  }

  validate(){
    return verb.isModal(this.value);
  }
}
/**
 * WIP (TODO: Document)
 */
class auxiliaryVerb extends verb {
  constructor(value){
    super(value);
  }

  validate(){
    return verb.isAuxiliary(this.value);
  }
}

/**
 * WIP (TODO: Document)
 */
 class otherVerb extends verb {
  constructor(value){
    super(value);
  }

/**
 * WIP (TODO: Document)
 */
  validate(){
    return verb.isOther(this.value);
  }
}

/**
 * @internal Checks if the verb is within the modal verbs supplied
 */
verb.isModal = function(val) { return modalVerbEnum.includes(val) }
/**
 * @internal Checks if the verb is within the auxiliary verbs supplied
 */
verb.isAuxiliary = function(val) { return auxiliaryVerbEnum.includes(val) }
/**
 * @internal Checks if the verb is within the other verbs supplied
 */
verb.isOther = function(val) { return otherVerbEnum.includes(val) }
/**
 * @internal Checks if the verb is within all the verbs supplied below
 */
 verb.isValid = function(val) { return (verb.isModal(val) || verb.isAuxiliary(val) || verb. isOther(val)) }

let modalVerbEnum = ["must", "shall", "will", "should", "would", "can", "could", "may", "might"];
let auxiliaryVerbEnum = ["be", "do", "have"];
let otherVerbEnum = ["want", "record"];

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
_consider.statementsFile = statementsFile;
_consider.userStoryFile = userStoryFile;
_consider.functionality = functionality;
_consider.statement = statement;
_consider.userStory = userStory;
_consider.epic = epic;
_consider.tag = tag;
_consider.iterator = iterator;
_consider.verb = verb;
_consider.modalVerb = modalVerb;
_consider.auxiliaryVerb = auxiliaryVerb;
_consider.otherVerb = otherVerb;
_consider.errors = errors;
_consider.correlation = correlation;
