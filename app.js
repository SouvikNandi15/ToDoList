//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");


const app = express();
app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

// mongoose.connect("mongodb://localhost:27017/todolistDB");

// let items=["Buy food","Cook food","Eat food"];
// let workItems=[];
// const MongoClient = require('mongodb').MongoClient;
// const uri = "mongodb://localhost:27017/todolistDB";
// const client = new MongoClient(uri, { useNewUrlParser: true });
// client.connect(err => {
//   const collection = client.db("todolistDB").collection("lists");
//  // perform actions on the collection object
//   client.close();
// });

 // mongoose.connect('mongodb+srv://souviknandi25:Nandi@souvik2@cluster0.fi4hjob.mongodb.net/?retryWrites=true&w=majority/todolistDB');

const itemsSchema={
  name: String
};

const Item= mongoose.model("Items", itemsSchema);

const item1 = new Item({
  name: "Welcome to your todolist!"
});

const item2 = new Item({
  name: "Hit the + button to add a new item."
});

const item3 = new Item({
  name: "<-- Hit this to delete an item."
});

const defaultItems =[item1,item2,item3];
const listSchema={
  name:String,
  items:[itemsSchema]
};
const List = mongoose.model("List",listSchema);


app.get("/", function(req, res){

    Item.find({},function(err,foundItems){
      if(foundItems.length==0){
        Item.insertMany(defaultItems, function(err){
          if(err){
            console.log(err);
              }
          else{
            console.log("Successfully saved default items to DB.");
          }
        });
        res.redirect("/");
      }else{  res.render("list",{listTitle:"Today",newListItems:foundItems});
    }
        });
    });

app.get("/:customListName",function(req,res){
  const customListName = _.capitalize(req.params.customListName);

  List.findOne({name:customListName},function(err,foundList){
    if(!err){
      if(!foundList){
        // Create a new list

        const list=new List({
          name: customListName,
          items: defaultItems
        });
        list.save();
        res.redirect("/" + customListName);
      }else{
        // Show an existing list

         res.render("list",{ listTitle: foundList.name, newListItems: foundList.items});
      }
    }
  });
});


app.post("/",function(req,res){
  const itemName=req.body.newItem;
  const listName =req.body.list;

  const item=new Item({
    name: itemName
  });
if(listName === "Today"){
  item.save();
  res.redirect("/");
}else{
  List.findOne({name: listName},function(err, foundList){
    foundList.items.push(item);
    foundList.save();
    res.redirect("/" + listName);
  });
}


});

app.post("/delete",function(req,res){
  const checkedItemId =req.body.checkbox;
  const listName =req.body.listName;

  if(listName== "Today"){
    Item.findByIdAndRemove(checkedItemId,function(err){
      if(!err){
        res.redirect("/");
      }
    });
  }  else{
    List.findOneAndUpdate({name : listName} , {$pull: {items: {_id: checkedItemId}}} , function(err, foundList){
      if(!err){
        res.redirect("/" + listName);
      }
    });
  }

});

app.get("/work",function(req,res){
    res.render("list",{listTitle: "Work List",newListItems:workItems});
});

app.listen(3000, function(){
  console.log("Server started on port 3000.");
});
