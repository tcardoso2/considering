class consider {
  constructor(){
  	this.a = "x";
  }
}

class article{
	constructor(){

	}

	//article points to an object, in this case we allow it to be a file
	file(src){
      return new file(src);
	}
}

class object{
  constructor(){

  }
}

class file extends object{
  constructor(file_name)
  {
  	super();
  	this.contents = "foo bar";
  }
}

let app = new consider();

module.exports = app;

//Articles
app.article = article;
app.a = new article();
app.the = new article();

//objects
app.file = file;