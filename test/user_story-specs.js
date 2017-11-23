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
    consider.a.userStory("As a user, I want to be able to create user stories so that I record the needs of the user.")
      .purpose((success, benefit, correlations)=>{
        success.should.equal(true);
        benefit.should.equal("I record the needs of the user");
        correlations.users[0].should.equal("user");
        iter.val().should.equal("user");
        done();
      });
  });
  it("should be able detect to correlate if in the action, the user is mentioned and establish a relationship", function (done) {
    //Prepare
    consider.a.userStory("As a user, I want to be able to add permissions to other user so that I record my needs.")
      .action((success, action, correlations)=>{
        success.should.equal(true);
        action.should.equal("I want to be able to add permissions to other user")
        correlations.users[0].should.equal("user");
        iter.val().should.equal("user");
        done();
      });
  });
});

describe("Considering a set of user stories,", function() {
  it("should be able to group them an epic", function (done) {
    //Prepare
    let us1 = consider.a.userStory("As a user, I want to be able to create user stories so that I record my needs.");
    let us2 = consider.a.userStory("As a user, I want to be able to delete user stories so that I eliminate unecessary requirements.");

    let epic1 = us1.groupWith(us2).renameAs("User Stories epic");
    (epic1 instanceof epic).should.equal(true);
    (consider.a.userStory(epic1) instanceof epic).should.equal(true) 
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
  it("should be able to list the users in the user stories", function (done) {
    //Prepare
    should.fail();
  });
  it("should be able to show stats about the user stories", function (done) {
    //Prepare
    should.fail();
  });
});

describe("Considering a file with User Stories,", function() {
  it("it should be able to output count stats on existing users, action, purpose", function () {
    should.fail();
  });
  it("it should be able to save the results in an output file", function () {
    should.fail();
  });
  it("it should return a promise with the successfull stories and detect errors on invalid formats", function () {
    consider.a.userStoryfile("./test/test_file2.txt").where.each
      .userStory((userStories) => {

      })
      .errors((errors) => {

      });
    should.fail();
  });
});
