"use strict" 
/*****************************************************
 * Internal tests
 *****************************************************/

let chai = require('chai');
let chaiAsPromised = require("chai-as-promised");
let should = chai.should();
let consider = require("../main.js");
let tag = consider.tag;
let epic = consider.epic;
let file = consider.file;
let errors = consider.errors;
let userStory = consider.userStory;
let correlation = consider.correlation;
let statementsFile = consider.statementsFile;

before(function(done) {
  done();
});

after(function(done) {
  // here you can clear fixtures, etc.
  done();
});

describe("Considering a user story,", function() {
  it("if throwError = true should throw an Error if the user story is not in a valid format", function (done) {
    //Prepare
    try{
      consider.a.userStory("As a user want to be able to create user stories.", true);
    } catch(e){
      (e instanceof errors.userStoryError).should.equal(true);
      done();
      return;
    }
    should.fail();
  });
  it("if throwError = false should not throw an Error if the user story is not in a valid format", function (done) {
    //Prepare
    consider.a.userStory("As a user want to be able to create user stories.");
    done();
  });
  it("should be able detect the user in the user story", function (done) {
    //Prepare
    consider.a.userStory("As a user, I want to be able to create user stories so that I record my needs.")
      .user((success, user)=>{
        success.should.equal(true);
        user.should.equal("user");
      }).isUserStoryFormat().should.equal(true);
      done();
  });
  it("should be able detect the intended action", function (done) {
    //Prepare
    consider.a.userStory("As a user, I want to create user stories so that I record my needs.")
      .action((success, action)=>{
        success.should.equal(true);
        action.should.equal("want");
      }).isUserStoryFormat().should.equal(true);
      done();
  });
  it("should be able detect the benefit / reason", function (done) {
    //Prepare
    consider.a.userStory("As a user, I want to be able to create user stories so that I record my needs.")
      .purpose((success, reason)=>{
        //success
        success.should.equal(true);
        reason.should.equal("I record my needs");
      }).isUserStoryFormat().should.equal(true);
      done();
  });
  it("should be able detect to correlate if in the benefit, the user is mentioned and establish a relationship", function (done) {
    //Prepare
    let us = consider.a.userStory("As a user1, I want to be able to create user stories so that I record the needs of the user1.");
    us.hasPurpose().should.equal(true);
    us.purpose((success, benefit, correlations)=>{
        success.should.equal(true);
        benefit.should.equal("I record the needs of the user1");
        (correlations == undefined).should.not.equal(true);
        console.log(correlations)
        correlations.users.length.should.equal(1);
        correlations.users[0].should.equal("user1");
        done();
      });
  });
  xit("should be able to get the action verb and the full statement of the action", function (done) {
    //Prepare
    consider.a.userStory("As a user, I want to be able to give permissions to other user so that I record my needs.")
      .action((success, action, correlations)=>{
        success.should.equal(true);
        action.should.equal("want")
        correlations.actionStatement.contents.should.equal("to be able to give permissions to other user");
        done();
      });
  });
  xit("should be able to correlate if in the action, the user is mentioned and establish a relationship", function (done) {
    //Prepare
    consider.a.userStory("As a user, I want to be able to give permissions to other user so that I record my needs.")
      .action((success, action, correlations)=>{
        success.should.equal(true);
        action.should.equal("want")
        correlations.actionStatement.contents.should.equal("to be able to give permissions to other user");
        correlations.actionStatement.hasUser().should.equal(true); //TODO: Should be able to look for non-user-story statements for users through finding patterns
        //such as "to <bla bla>, but distinguish it from a verb, e.g. to do different from to other user, what follows to?"
        correlations.users[0].should.equal("user");
        iter.val().should.equal("user");
        done();
      });
  });
});

describe("When creating a correlation,", function() {
  it("the object should return an actionStatement and users members", function () {
    //Prepare
    let us1 = consider.a.userStory("As a user, I want to be able to create user stories so that I record my needs.");

    let c = new correlation(us1);
    (c.actionStatement == undefined).should.equal(false);
    (c.users == undefined).should.equal(false);
  });
  it("should throw an error if no argument is passed of type userStory", function () {
    //Prepare
    try{
      let c = new correlation();
    } catch(e){
      e.message.should.equal("Error: correlation expects first argument of type UserStory");
      return;
    }
    should.fail();
  });
  it("should throw an error if the argument is not a valid userStory object", function () {
    //Prepare
    try{
      let c = new correlation("Some other sentence.");
    } catch(e){
      e.message.should.equal("Error: correlation expects first argument of type UserStory");
      return;
    }
    should.fail();
  });
  it("the users should be identified and returned as an Array of strings", function () {
    //Prepare
    let us1 = consider.a.userStory("As a user, I want to be able to create user stories so that I record my needs.");

    let c = new correlation(us1);
    Array.isArray(c.users).should.equal(true);
    c.users.length.should.equal(1);
  })
  it("the action statement should be identified correctly", function () {
    //Prepare
    let us1 = consider.a.userStory("As a user, I want to be able to create user stories so that I record my needs.");

    let c = new correlation(us1);
    c.action.should.equal("want");
    c.actionStatement.should.equal("to be able to create user stories");
  })
});

describe("Considering a set of user stories,", function(done) {
  it("should be able to group them into an epic", function (done) {
    //Prepare
    let us1 = consider.a.userStory("As a user, I want to be able to create user stories so that I record my needs.");
    let us2 = consider.a.userStory("As a user, I want to be able to delete user stories so that I eliminate unecessary requirements.");

    let epic1 = us1.groupWith(us2).renameAs("User Stories epic");
    console.log(epic1);
    epic1.hasContents().should.equal(true);
    epic1.contents.should.equal("User Stories epic");
    (epic1 instanceof epic).should.equal(true);
    done();
  });
});

describe("Considering an epic", function() {
  it("should be able to add user stories", function () {
    //Prepare
    let epic1 = consider.a.epic("User Stories epic")
      .append(consider.a.userStory("As a user, I want to be able to create user stories so that I record my needs."))
      .append(consider.a.userStory("As a user, I want to be able to delete user stories so that I eliminate unecessary requirements."));
    epic1.toArray().length.should.equal(2);
  });
  it("if attampting to add an object not of instance userStory, it throws an Error", function () {
    //Prepare
    try{
      consider.a.epic("User Stories epic").append("This will fail");
    } catch(e) {
      e.message.should.equal("The object appended is not of instance userStory.");
      return;
    }
    should.fail();
  });
  it("should be able to iterate through the user stories", function (done) {
    //Prepare
    let epic1 = consider.a.epic("User Stories epic")
      .append(consider.a.userStory("As a user, I want to be able to create user stories so that I record my needs."))
      .append(consider.a.userStory("As a user, I want to be able to delete user stories so that I eliminate unecessary requirements."))
    .where.each.userStory((content)=>{
      content.length.should.equal(2);
      content[0].contents.should.equal("As a user, I want to be able to create user stories so that I record my needs.");
      content[1].contents.should.equal("As a user, I want to be able to delete user stories so that I eliminate unecessary requirements.");
      done();
    });
  });
  it("should be able to list the users in the user stories");
  it("should be able to show stats about the user stories");
});

describe("Considering a file with User Stories,", function() {
  xit("should be able to output count stats on existing users, action, purpose");
  xit("should be able to save the results in an output file");
  it("should be able to retrieve the underlying statementsFile object", function (done) {
    let sf = consider.a.userStoryFile("./test/test_user_story_file1.txt").getStatementsFile();
    (sf instanceof statementsFile).should.equal(true);
    done();
  });
  it("should return a promise with the successfull stories", function (done) {
    //Don't like the fact that I have to wait for the file to be read...
    consider.a.userStoryFile("./test/test_user_story_file1.txt", (file) =>  {
      file.where.each
      .userStory((userStories) => {
        userStories.length.should.equal(1);
        userStories[0].getContents().should.equal("As a user, I want to be able to create user stories so that I record my needs.");
        done();
      });
    });
  });
  it("should return a promise with the successful stories and also errors in case if finds those", function (done) {
    consider.a.userStoryFile("./test/test_user_story_file1.txt", (file) => {
      file.where.each
      .userStory((userStories) => {
        userStories.length.should.equal(1);
        userStories[0].getContents().should.equal("As a user, I want to be able to create user stories so that I record my needs.");
      })
      .invalidUserStory((errors) => {
        errors.length.should.equal(3);
        errors[0].getContents().should.equal("Some statement");
        done();
        //Show unsuccessful statements
      });
    });
  });
});
