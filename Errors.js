"use strict"

class userStoryError extends Error{
  constructor(message, statement){
    super(message);
    this.statement = statement;
  }
}

exports.userStoryError = userStoryError;
