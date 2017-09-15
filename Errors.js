"use strict"
class UserStoryError extends Error{
  constructor(message){
    super(message);
  }
}

exports.UserStoryError = UserStoryError;
