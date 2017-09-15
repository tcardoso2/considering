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

describe("Considering a functionality,", function() {
  it("should have a component, a group and a category", function (done) {
    //Prepare
    let f1 = consider.a.functionality();
    f1.component().should.not.equal(undefined);
    f1.group().should.not.equal(undefined);
    f1.category().should.not.equal(undefined);
  });
});
