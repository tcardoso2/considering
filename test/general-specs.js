"use strict" 
/*****************************************************
 * Internal tests
 *****************************************************/

let chai = require('chai');
let chaiAsPromised = require("chai-as-promised");
let should = chai.should();
let consider = require("../main.js");
let tag = consider.tag;
let file = consider.file;
let statementsFile = consider.statementsFile;
let userStoryFile = consider.userStoryFile;
let statement = consider.statement;
let article = consider.article;
let errors = consider.errors;
let userStory = consider.userStory;
let iter = consider.iterator;
let modalVerb = consider.modalVerb;
let fs = require('fs');

before(function(done) {
  done();
});

after(function(done) {
  // here you can clear fixtures, etc.
  done();
});

describe("Consider allows:", function() {
  it("declaring articles 'a' and 'the'", function () {
    //Prepare
    consider.a.should.not.equal(undefined);
    consider.the.should.not.equal(undefined);
  });
  it("'the' and 'a' are of instance article", function () {
    //Prepare
    (consider.a instanceof article).should.equal(true);
    (consider.the instanceof article).should.equal(true);
  });
  it("inheriting from the object class, provided you override the setDeterminer method.", function () {
    //Prepare
    try{
      let o = new consider.object();
    } catch (e) {
      e.message.should.equal("You should set the determiner of the object by inheriting it. HINT: do not use object class directly");
      return;
    }
    should.fail();
  });
});

describe("Considering a file,", function() {
  it("If path does not exist should throw an error", function () {
    //Prepare
    try{
      let file1 = consider.a.file("test_file1.txt");
    } catch(e){
      e.message.should.equal('File "test_file1.txt" not found');
      return;
    }
    should.fail();
  });
  it("should be of file instance", function () {
    //Prepare
    let file1 = consider.a.file("./test/test_file1.txt");
    (file1 instanceof file).should.equal(true);
  });
  it("should read a file's contents", function (done) {
    //Prepare
    let file1 = consider.a.file("./test/test_file1.txt");
    file1.read((contents)=>{
      console.log(contents);
      contents.should.equal("This is just a test content.");
      done();
    });
  });
  it("should be possible to address it's properties via a 'where' conjunction, and have pronouns such as 'each' and 'first'.", function () {
    //Prepare
    let conjunction1 = consider.a.file("./test/test_file2.txt").where;
    conjunction1.should.not.equal(undefined);
    conjunction1.each.should.not.equal(undefined);
    conjunction1.first.should.not.equal(undefined);
  });
  it("should be possible to get the array of lines ", function (done) {
    //Prepare
    let file1 = consider.a.file("./test/test_file2.txt")
    file1.where.each.line((content)=>{
      content.length.should.equal(2);
      done();
    });
  });
  it("should be possible to get the first line ", function (done) {
    //Prepare
    let file1 = consider.a.file("./test/test_file2.txt")
    file1.where.first.line((data)=>{
      data.contents.should.equal("This is the first line.");
      done();
    });
  });
  it("should be possible to get the last line ", function (done) {
    //Prepare
    let file1 = consider.a.file("./test/test_file2.txt")
    file1.where.last.line((data)=>{
      data.contents.should.equal("This is the second line.");
      done();
    });
  });
  it("should split the file into lines", function (done) {
    //Prepare
    let statements = consider.a.file("./test/test_file2.txt").where.each.line((content)=>{
      content[0].contents.should.equal("This is the first line.");
      content[1].contents.should.equal("This is the second line.");
      done();
    });
  });
});

describe("Considering a statement,", function() {
  it("should be of statement instance", function () {
    //Prepare
    let statement1 = consider.a.statement("Some statement");
    (statement1 instanceof statement).should.equal(true);
  });
  it("first constructor argument equals the statement's contents", function () {
    //Prepare
    let statement1 = consider.a.statement("Some statement");
    statement1.contents.should.equal("Some statement");
  });
  it("should be able to search for text", function (done) {
    //Prepare
    consider.a.statement("As a user, I want to be able to create stories so that I record my needs.")
      .find("user", (response)=>{
        response.length.should.equal(1);
        response[0].should.equal(5);
        done();
      });
  });
  it("should be able to search for text happening multiple times", function (done) {
    //Prepare
    consider.a.statement("As a user, I want to be able to create user stories so that I record my needs too.")
      .find("to", (response)=>{
        JSON.stringify(response).should.equal(JSON.stringify([18, 29, 45, 78]));
        done();
      });
  });
  it("should return an empty array if no text is found", function (done) {
    //Prepare
    consider.a.statement("As a user, I want to be able to create user stories so that I record my needs.")
      .find("Considering", (response)=>{
        JSON.stringify(response).should.equal("[]");
        done();
      });
  });  
  it("should be able to count occurencies of a word / text in the statement", function (done) {
    //Prepare
    consider.a.statement("As a user, I want to be able to create user stories so that I record my needs.")
      .count("to", (response)=>{
        response.should.equal(3);
        done();
      });
  });
  it("should be able to return every word in an array", function (done) {
    //Prepare
    consider.a.statement("As a user,I want to be able to create user stories, so that I record my needs , alright ? ")
      .where.each.word((content)=>{
        content.length.should.equal(19);
        done();
      });
  });
  it("should be able to be tagged", function () {
    //Prepare
    let statement = consider.a.statement("As a user, I want to be able to create user stories so that I record my needs.")
      .tag(new tag("User Story"));
    statement.hasTags().should.equal(true);
    statement.hasTag("User Story").should.equal(true);
    statement.tags.should.be.eql(["User Story"]);
  });
  it("should be able to be un-tagged", function () {
    //Prepare
    let statement = consider.a.statement("As a user, I want to be able to create user stories so that I record my needs.")
      .tag(new tag("User Story"));
    statement.hasTags().should.equal(true);
    statement.unTag("User Story");
    statement.hasTags().should.equal(false);
  });
  it("should return an iterator", function () {
    //Prepare
    let statement = consider.a.statement("As a user, I want to be able to create user stories so that I record my needs.");
    let iterator = statement.where.first.word((content)=>{ 
      content.should.equal("As");
    });
    iterator.pointer.should.equal(0);
    iterator.followedBy.should.not.equal(undefined);
    iterator.values.should.not.equal(undefined);
    iterator.values.length.should.equal(18);
  });  
  it("should be able to iterate and get the first, check the next or get the next elements", function () {
    //Prepare
    let statement = consider.a.statement("As a user, I want to be able to create user stories so that I record my needs.");
    let iterator = statement.where.first.word((content)=>{ 
      content.should.equal("As");
    }).followedBy((content) => {
      content.val().should.equal("a");
    }).getNext();
    iterator.val().should.equal("user");
  });  
  it("should know if the statement has a valid user story structure", function () {
    //Prepare
    let statement = consider.a.statement("As a user, I want to be able to create user stories so that I record my needs.")
    statement.hasUser().should.equal(true);
    statement.hasAction().should.equal(true);
    statement.hasPurpose().should.equal(true);
    statement.isUserStoryFormat().should.equal(true);
  });
  it("should be able to chain to a followedBy function if the first element 'As' is found in the statement", function () {
    //Prepare
    let iterator = consider.a.statement("As a user, I want to be able to create user stories so that I record my needs.")
      .where.first.word((content)=>{
        content.should.equal("As");
      });
    iterator.followedBy.should.not.equal(undefined);
    iterator.followedBy((i)=>{
      i.val().should.equal("a");
    });
  });
  it("should be able to understand statements with missing element (tricky case)", function () {
    //Prepare
    let s = consider.a.statement("As a, I want to be able to combine 2 statement into a file.");
    let iterator = s.where.first.word((content)=>{
    }).is("As").nextIs("a");
    try{
      iterator.nextIsnt("I");
    } catch(e){
      //User
    }
    //Action, expects to have already iterated anyways
    iterator.val().should.equal("I");
    iterator.getNext().val().should.equal("want");
    //Purpose
    iterator.goTo("so").should.equal(false);
  });
  it("should be able to convert statement into a user story", function () {
    //Prepare
    let userStory1 = consider.a.statement("As a user, I want to be able to create user stories so that I record my needs.")
      .convertToUserStory();
    (userStory1 instanceof userStory).should.equal(true);
    userStory1.isUserStoryFormat().should.equal(true);
  });
  it("should throw an exception if the statement is attempted to be converted and is not in user story format", function () {
    //Prepare
    try{
      consider.a.statement("I want to be able to create some user story, I hope.").convertToUserStory();
    } catch (e){
      e.statement.contents.should.equal("I want to be able to create some user story, I hope.");
      e.statement.isUserStoryFormat().should.equal(false);
      (e instanceof errors.userStoryError).should.equal(true);
    }
  });
  it("should be able to be fixed given a search text and replacement", function () {
    //Prepare
    let userStory1 = consider.a.statement("As a user, I want to be able to create user stories so that I record my needs.")
      .fix("search this", "substitute");
    userStory1.isUserStoryFormat().should.equal(true);
  });
  it("if fixed should be tagged as 'fixed'", function () {
    //Prepare
    let userStory1 = consider.a.statement("As a user, I want to be able to create user stories so that I record my needs.")
      .fix("search this", "substitute");
    should.fail();
    userStory1.isUserStoryFormat().should.equal(true);
  });
  it("if fixed should keep a reference to the original version", function () {
    //Prepare
    let userStory1 = consider.a.statement("As a user, I want to be able to create user stories so that I record my needs.")
      .fix("search this", "substitute");
    should.fail();
    userStory1.isUserStoryFormat().should.equal(true);
  });
  it("should be able to iterate and a result based on a given function", function () {
    //Prepare
    let statement = consider.a.statement("As a user, I want to be able to create user stories so that I record my needs.");
    let findUser = function(val){
      return val == "user";
    }
    let iterator = statement.where.func(findUser);
    iterator.getNext().val().should.equal("user");
  }); 
});

describe("Considering a file of statements, ", function() {
  it("File path is mandatory", function (done) {
    //Prepare
    try{
      new file();
    } catch(e){
      e.message.should.equal("File path is a mandatory field.");
      done();
      return;
    }
    should.fail();
  });
  it("If appending content, must be of type statement", function (done) {
    //Prepare
    try{
      let f = new file("./test/test_file3.txt");
      f.append("Whatever, this will fail");
    } catch(e){
      e.message.should.equal("Only statements are allowed to append to a file's contents.");
      done();
      return;
    }
    should.fail();
  });
  it("should be able to combine statements into a file (sync)", function (done) {
    //Prepare
    //Note: Node 8.5.0 allows fs.copyFile and fs.CopyFileSync
    let data = fs.readFileSync('./test/test_file2.txt');
    fs.writeFileSync('./test/test_file3.txt', data);
    let file3 = consider.a.file("./test/test_file3.txt");
    let statement1 = consider.a.statement("As a user, I want to be able to create user stories so that I record my needs.");
    let statement2 = consider.a.statement("As a user, I want to be able to combine 2 statement into a file.");
    consider.a.file(file3.append(statement2).append(statement1)).where.each.line((content)=>{
      content[0].contents.should.equal("This is the first line.");
      content[1].contents.should.equal("This is the second line.");
      content[2].contents.should.equal("As a user, I want to be able to combine 2 statement into a file.");
      content[3].contents.should.equal("As a user, I want to be able to create user stories so that I record my needs.");
      done();
    });
  });
});

describe("Considering a statementsFile object, ", function() {
  it("File path is mandatory", function (done) {
    //Prepare
    try{
      new statementsFile();
    } catch(e){
      e.message.should.equal("File path is a mandatory field.");
      done();
      return;
    }
    should.fail();
  });
  it("Writing a statementsFile should result in a file with serialized JSON statement objects", function (done) {
    //Prepare
    let f = new statementsFile('./test/test_statement_file1.txt');
    f.clearFileInDisk();
    f.append(new statement("Some statement"), ()=>{
      fs.readFile('./test/test_statement_file1.txt', "utf-8", (err, data)=>{
        let deserializedData = f.deserialize(data);
        deserializedData[0].contents.should.equal("Some statement");
        done();    
      });
    });
  });
  it("Deserializing a statementsFile content should result in an arran of statement objects", function () {
    //Prepare
    let f = new statementsFile('./test/test_statement_file3.txt');
    let obj = f.deserialize('[{"tags":["ABC", "DEFG"],"contents":"Some other statement"}]');
    obj.length.should.equal(1);
    obj[0].tags.length.should.equal(2);
    (obj[0] instanceof statement).should.equal(true);
    obj[0].contents.should.equal("Some other statement");
    obj[0].tags[1].should.equal("DEFG");
  });
  it("Deserializing a statementsFile content with more than one statement should result in an arran of statement objects", function () {
    //Prepare
    let f = new statementsFile('./test/test_statement_file3.txt');
    let obj = f.deserialize('[{"tags":["ABC", "DEFG"],"contents":"Some other statement"},{"tags":["KLMN"],"contents":"Yet another statement"}]');
    obj.length.should.equal(2);
    obj[1].tags.length.should.equal(1);
    (obj[0] instanceof statement).should.equal(true);
    (obj[1] instanceof statement).should.equal(true);
    obj[0].tags[0].should.equal("ABC");
    obj[0].contents.should.equal("Some other statement");
    obj[1].tags[0].should.equal("KLMN");
    obj[1].contents.should.equal("Yet another statement");
  });
  it("Reading a statementsFile from file with serialized JSON statement objects should result in properly parsed objects", function (done) {
    //Prepare
    let f = new statementsFile('./test/test_statement_file3.txt');
    f.clearFileInDisk();
    f.append(new statement("Some statement").tag(new tag("ABC")), (appended)=>{
      consider.a.statementsFile('./test/test_statement_file3.txt').where.first.line((content)=>{
        //Asserting object appended
        appended.should.not.equal({});
        appended.contents.length.should.equal(1);
        appended.contents[0].contents.should.equal("Some statement");
        appended.contents[0].tags[0].should.equal("ABC");
        //Asserting file contents
        (content == undefined).should.not.equal(true);
        content.contents.should.equal("Some statement");
        content.tags.length.should.equal(1);
        content.hasTag("ABC").should.equal(true);
        done();
      });
    });
  });
  it("should be able to select the statements by tag", function (done) {
    //Prepare
    let f = new statementsFile('./test/test_statement_file2.txt');
    f.clearFileInDisk();
    f.append(new statement("Some statement"), (appended)=>{
      let statement1 = consider.a.statement("As a user, I want to be able to combine 2 statement into a file.")
        .tag(new tag("Invalid"));
      let statement2 = consider.a.statement("As a user, I want to be able to create user stories so that I record my needs.")
        .tag(new tag("User Story"));
      f = consider.a.statementsFile('./test/test_statement_file2.txt').append(statement2, (appended)=>{
        appended.append(statement1, (appended2)=>{
          appended2.where.eachTagged.line((content)=>{
            content.length.should.equal(1);
            content[0].contents.should.equal("As a user, I want to be able to create user stories so that I record my needs.");
            (content[0].hasTag("User Story")).should.equal(true);
            done();
          }, "User Story" );          
        });
      })
    });
  });
});

describe("Considering a tag, ", function() {
  it("should be able to store a value", function () {
    let t = new tag("Some value");
    t.value.should.equal("Some value");
  });  
});

describe("Considering an iterator, ", function() {
  it("should start by pointing to the first value", function () {
    let i = new iter([1,2,3,4,5]);
    i.getNext().val().should.equal(1);
  });
  it("should go to next value after get next", function () {
    let i = new iter([1,2,3,4,5]);
    i.getNext().getNext().val().should.equal(2);
  });
  it("getPrevious should start by pointing to nothing", function () {
    let i = new iter([1,2,3,4,5]);
    i.getPrev();
    (i.val() == undefined).should.equal(true);
  });
  it("getPrevious points to previous value", function () {
    let i = new iter([1,2,3,4,5]);
    i.getNext().getPrev().val().should.equal(1);
    i.isFirst().should.equal(true);
  });
  it("Once reaching the end, next values should always point to the last value", function () {
    let i = new iter([1,2,3,4,5]);
    i = i.getNext().getNext().getNext().getNext().getNext();
    i.val().should.equal(5);
    //Nothing changes
    i.getNext().val().should.equal(5);
    i.isLast().should.equal(true);
  });
  it("While possible should be able to iterate back and forth", function () {
    let i = new iter([1,2,3]);
    while(i.hasNext()){
      i.getNext();
    }
    i.getNext().val().should.equal(3);
    while(i.hasPrev()){
      i.getPrev();
    }
    i.getPrev().val().should.equal(1);
  });
  it("should be able to peek without iterating to the next value", function () {
    let i = new iter([1,2]);
    i.getNext().peek().should.equal(2);
    i.val().should.equal(1);
    i.getNext().val().should.equal(2);
    (i.peek() === undefined).should.equal(true);
  });
  it("should be able to assert if value is followed by a certain value and still iterate.", function () {
    let i = new iter([1,2,3]);
    i = i.getNext().followedBy((content)=>{
      content.val().should.equal(2);
    }).getNext().val().should.equal(3);
  });
  it("should be able to iterate (via goTo function) to an existing value", function () {
    let i = new iter([1,2,3,4,5]);
    if(i.goTo(3)) {
      i.peek().should.equal(4);
    }
    else {
      should.fail();
    }
  });
  it("should return false if goTo value does not exist in iterator", function () {
    let i = new iter([1,2,3,4,5]);
    if(i.goTo(6)) {
      should.fail();
    }
  });
  it("should be able to know if a given item is a verb", function () {
    let i = new iter(["I","do","not","want","to", "sleep"]);
    if(i.goTo(6)) {
      should.fail();
    }
  });
});

describe("Considering a modal verb, ", function() {
  it("When it's not a modal verb, should throw an error", function () {
    try{
      let v = new modalVerb("jump");
    } catch(e){
      e.message.should.equal("'jump' is not a valid modal Verb.");
      return;
    }
    should.fail();
  });
  it("When it's a modal verb, should not throw an error", function () {
    let v = new modalVerb("should");
  });
});

describe("Considering a file with statements, ", function() {
  it("it should be able to return a summary of how many user stories are not in a valid format", function (done) {
    //Prepare
    let u = new userStoryFile('./test/test_user_story_file1.txt');
    consider.a.statementsFile(u).getUserStorySummary((content)=>{
      content.totals.valid.should.equal(1);
      content.totals.invalid.should.equal(3);
      content.totals.tags.should.equal(5);
      content.invalidStatements.length.should.equal(3);
      (content.invalidStatements[0] instanceof statement).should.equal(true);
      (content.invalidStatements[0] instanceof statement).should.equal(true);
      (content.validUserStories[0] instanceof userStory).should.equal(true);
      done();
    });
  });
  it("it should be able to point which stories have missing user", function (done) {
    //Prepare
    let u = new userStoryFile('./test/test_user_story_file1.txt');
    consider.a.statementsFile(u).getUserStorySummary((content)=>{
      (content.invalid.getInvalidUserItems()[0] instanceof statement).should.equal(true);
      content.invalid.getInvalidUserItems()[0].contents.should.equal("Some statement");
      content.invalid.getInvalidUserItems()[1].contents.should.equal("As a, I want to be able to combine 2 statement into a file.");
      content.invalid.getInvalidUserItems().length.should.equal(2);
      done();
    });
  });
  it("it should be able to point which stories have missing action", function (done) {
    let u = new userStoryFile('./test/test_user_story_file1.txt');
    consider.a.statementsFile(u).getUserStorySummary((content)=>{
      (content.invalid.getInvalidActionItems()[0] instanceof statement).should.equal(true);
      content.invalid.getInvalidActionItems().length.should.equal(1);
      done();
    });
  });
  it("it should be able to point which stories have purpose", function (done) {
    let u = new userStoryFile('./test/test_user_story_file1.txt');
    consider.a.statementsFile(u).getUserStorySummary((content)=>{
      (content.invalid.getInvalidPurposeItems()[0] instanceof statement).should.equal(true);
      content.invalid.getInvalidPurposeItems().length.should.equal(3);
      done();
    });
  });
});

describe("Considering several files with statements, ", function() {
  it("it should be able to return a summary of how many user stories are not in a valid format", function () {
    //Prepare
    let u = new userStoryFile('./test/test_user_story_file1.txt');
    consider.a.statementsFile(u).getUserStorySummary((content)=>{
      content.totals.valid.should.equal(1);
      content.totals.invalid.should.equal(2);
      content.totals.tags.should.equal(4);
      content.invalidUserStories.length.should.equal(2);
      (content.invalidUserStories[0] instanceof userStory).should.equal(true);
      (content.invalidUserStories[0] instanceof userStory).should.equal(true);
    });
  });
  it("it should be able to point which stories have missing user", function () {
    should.fail();
  });
  it("it should be able to point which stories have missing action", function () {
    should.fail();
  });
  it("it should be able to point which stories have purpose", function () {
    should.fail();
  });
});