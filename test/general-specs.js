  /*****************************************************
 * Internal tests
 *****************************************************/

let chai = require('chai');
let chaiAsPromised = require("chai-as-promised");
let should = chai.should();
let consider = require("../main.js");
let tag = consider.tag;
let file = consider.file;
let statement = consider.statement;
let article = consider.article;
let errors = consider.errors;
let userStory = consider.userStory;

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
      e.message.should.equal("File not found");
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
  it("should be possible to address it's properties via a 'where' conjunction, and have pronouns such as 'each' and 'every'.", function () {
    //Prepare
    let conjunction1 = consider.a.file("./test/test_file2.txt").where;
    conjunction1.should.not.equal(undefined);
    conjunction1.each.should.not.equal(undefined);
    conjunction1.every.should.not.equal(undefined);
  });
  it("should be possible to get the array of lines ", function (done) {
    //Prepare
    let file1 = consider.a.file("./test/test_file2.txt")
    file1.where.each.line((content)=>{
      content.length.should.equal(2);
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
    consider.a.statement("As a user, I want to be able to create user stories so that I record my needs.")
      .find("user", (response)=>{
        response.should.equal([5])
        done();
      });
  });
  it("should be able to search for text happening multiple times", function () {
    //Prepare
    consider.a.statement("As a user, I want to be able to create user stories so that I record my needs.")
      .find("to", (response)=>{
        response.should.equal([18, 29]);
        done();
      });
  });
  it("return an empty string if no text is found", function () {
    //Prepare
    consider.a.statement("As a user, I want to be able to create user stories so that I record my needs.")
      .find("Considering", (response)=>{
        response.should.equal([]);
        done();
      });
  });  
  it("should be able to count occurencies of a word / text in the statement", function () {
    //Prepare
    consider.a.statement("As a user, I want to be able to create user stories so that I record my needs.")
      .count("to", (response)=>{
        response.should.equal(2);
        done();
      });
  });
  it("should be able to return every word in an array", function () {
    //Prepare
    consider.a.statement("As a user, I want to be able to create user stories so that I record my needs.")
      .where.each.word((content)=>{
        content.length.should.equal(18);
        done();
      });
  });
  it("should be able to return every element in an array (words + punctuation)", function () {
    //Prepare
    consider.a.statement("As a user, I want to be able to create user stories so that I record my needs.")
      .where.each.element((content)=>{
        content.length.should.equal(20);
        done();
      });
  });
  it("should be able to be tagged", function () {
    //Prepare
    let statement = consider.a.statement("As a user, I want to be able to create user stories so that I record my needs.")
      .tag(new tag("User Story"));
    statement.hasTags().should.equal(true);
    statement.hasTag("User Story").should.equal(true);
    statement.tags.should.equal(["User Story"]);
  });
  it("should know if the statement has a valid user story structure", function () {
    //Prepare
    consider.a.statement("As a user, I want to be able to create user stories so that I record my needs.")
      .isUserStoryFormat().should.equal(true);
  });
  it("should be able to convert statement into a user story", function () {
    //Prepare
    let userStory1 = consider.a.statement("As a user, I want to be able to create user stories so that I record my needs.")
      .convertToUserStory();
    userStory1.isUserStoryFormat().should.equal(true);
  });
  it("should throw an exception if the statement is attempted to be converted and is not in user story format", function () {
    //Prepare
    try{
      consider.a.statement("I want to be able to create some user story, I hope.").convertToUserStory();
    } catch (e){
      (e instanceof errors.UserStoryError).should.equal(true);
      e.statement.text.should.equal("I want to be able to create some user story, I hope.");
      e.statement.isUserStoryFormat().should.equal(false);
    }
  });
});

describe("Considering a file of statements, ", function() {
  it("should be able to combine statements into a file", function (done) {
    //Prepare
    let statement1 = consider.a.statement("As a user, I want to be able to create user stories so that I record my needs.");
    let statement2 = consider.a.statement("As a user, I want to be able to combine 2 statement into a file.");
    consider.a.file(new file()).append(statement2).append(statement1).where.each.line((content)=>{
      content[0].text.should.equal("As a user, I want to be able to combine 2 statement into a file.");
      content[1].text.should.equal("As a user, I want to be able to create user stories so that I record my needs.");
      done();
    });
  });
  it("should be able to select the statements by tag", function (done) {
    //Prepare
    let statement1 = consider.a.statement("As a user, I want to be able to combine 2 statement into a file.")
      .tag(new tag("Invalid"));
    let statement2 = consider.a.statement("As a user, I want to be able to create user stories so that I record my needs.")
      .tag(new tag("User Story"));
    let file1 = consider.a.file(new file()).append(statement2).append(statement1);
    file1.where.each.element(tag.equals("User Story"), (content)=>{
      content[0].text.should.equal("As a user, I want to be able to create user stories so that I record my needs.");
    });
  });
});
