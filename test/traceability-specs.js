"use strict" 
/*****************************************************
 * Internal tests
 *****************************************************/

let chai = require('chai');
let chaiAsPromised = require("chai-as-promised");
let should = chai.should();
let consider = require("../main.js");
let tag = consider.tag;
let functionality = consider.functionality;
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
  xit("should be able to be mapped to a functionality", function (done) {
    //Prepare
    consider.a.userStory("As a user, I want to be able to create user stories so that I record my needs.")
      .mapFunction(new functionality());
  });
});
