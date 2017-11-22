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

describe("Considering a JIRA,", function() {
  it("should be able to configure it using a file", function (done) {
    //Prepare
    consider.a.jira("<http:Link>");
    should.fail();
  });
  it("should be able to iterate on bugs", function (done) {
    //Prepare
    consider.a.jira("<http:Link>").where.each.bug((content)=>{
      content[0].contents.should.equal("This is the first line.");
      content[1].contents.should.equal("This is the second line.");
      done();
    })
    should.fail();
  });
  it("should be able to iterate on userStories", function (done) {
    //Prepare
    consider.a.jira("<http:Link>").where.each.userStory((content)=>{
      content[0].contents.should.equal("This is the first line.");
      content[1].contents.should.equal("This is the second line.");
      done();
    })
    should.fail();
  });
  it("should be able to iterate on JIRA type", function (done) {
    //Prepare
    consider.a.jira("<http:Link>").where.each.jiraType("Task", (content)=>{
      content[0].contents.should.equal("This is the first line.");
      content[1].contents.should.equal("This is the second line.");
      done();
    });
    should.fail();
  });
  it("should be able to convert Jiras to statements", function (done) {
    //Prepare
    consider.a.jira("<http:Link>").where.first.userStory((content)=>{
      let statement = content.convertToStatement();
      statement.convertToUserStory();
      done();
    })
    should.fail();
  });
});