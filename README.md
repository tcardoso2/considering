[![NPM info](https://nodei.co/npm/considering.png?downloads=true)](https://nodei.co/npm/considering.png?downloads=true)

[![Travis build status](https://travis-ci.org/tcardoso2/considering.png?branch=master)](https://travis-ci.org/tcardoso2/considering)

[![Unit tests](https://github.com/tcardoso2/considering/blob/master/badge.svg)](https://github.com/tcardoso2/considering/blob/master/badge.svg)  

# considering
An assertion to document business rules / user stories

# ROADMAP:  
**v 0.1.?:**  Integration with API.AI from Google for contextual content (WIP)  
**v 0.1.5-6:**  Work on user story unit tests  

# Changelog:  
**v 0.1.9:**  Started working on userStoryFile class (WIP for remaining general unit tests)
**v 0.1.8:**  More Bug fixes. Implemented eachTagged Determiner  
**v 0.1.7:**  Bug fixes. Implemented Reading and deserializing from a statements file  
**v 0.1.6:**  Working on tagging statements in files (WIP). Created byTagDeterminer which selects only elements with given criteria. Started creting a statementsFile entity which inherits file and allows saving more context of each sentence (e.g. Tags, etc...)  
**v 0.1.5:**  Working on statement files (WIP);  
**v 0.1.4:**  Working on file and user story test cases - added action and purpose iterators;  
**v 0.1.3:**  Working on user story unit tests - can extract the user from a user story.  
**v 0.1.2:**  Working on converting a statement object to a user story. Building user story members and use cases (WIP). Setup of badges and travis build (WIP).  
**v 0.1.1:**  Adding travis-ci configuration files (draft, WIP), declaring strict mode in JS files.  
**v 0.1.0:**  Working on whether a statement has a purpose. Added Error handler file. Continuing the documentation of the code. Current Unit tests are in progress.  
**v 0.0.10:** Minor changes, saving chai and chai-as-promised in the package as dependencies. Started building documentation using https://www.npmjs.com/package/documentation package. Started documenting code. Documentation output should be in "md" format to be easily accessible and readable from github and npm online.  
**v 0.0.9:**  Adding modal verbs, continuing on verification if statement has a proper user story format. Introducing base class 'base' where all other classes inherit from; Introducing types of verbs:  
* Modal verb;
* Auxiliary verb;  

**v 0.0.8:**  Working on determiner "first" and "last" for object statements. WIP on iterator object.  
**v 0.0.7:**  Continuation isUserStoryFormat, created userStory class, and static methods for checking if user, action and purpose exist, which can be caled without instantiating the class.  
**v 0.0.6:**  Added more user advanced Unit tests, added tag and unTag functions, WIP next on isUserStoryFormat  
**v 0.0.5:**  Added count, find functions and determiner "word" in statement class.  
**v 0.0.4:**  Added functions to handle file lines as statements  
**v 0.0.3:**  Added file reading. Created class conjunction (for where), and it's connecting determiners, each or every, which are instances of determiner class, created setDeterminer method to inject functions to the  determiners dinamically, like the 'file' object which will require a file.where.each."line" method.  
**v 0.0.2:**  Started creating first classes, stubs , main class, articles, objects, working on unit tests (WIP)  
**v 0.0.1:**  First versions with Unit tests;  
  
# DOCUMENTATION  
Consult the documentation [here](https://github.com/tcardoso2/considering/blob/master/DOCUMENTATION.md)  

For generating a coverage badge:  
export MOCHA_BADGE_SUBJECT=mocha
export MOCHA_BADGE_OK_COLOR=green
export MOCHA_BADGE_KO_COLOR=orange
export MOCHA_BADGE_STYLE=flat

mocha --reporter mocha-reporter-badge > badge.svg
