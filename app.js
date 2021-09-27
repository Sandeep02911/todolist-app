const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://admin-sandeep:Kiran1234@cluster0.b4fz1.mongodb.net/todolistDB");

const itemsSchema = {
  name: String
};

const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item({
  name: "Welcome to your todo list!"
});

const item2 = new Item({
  name: "Hit the + button to add a new item."
});

const item3 = new Item({
  name: "<-- Hit this to delete an item."
});

const defaultItems = [item1, item2, item3];

const listSchema = {
  name: String,
  items: [itemsSchema]
};

const List = mongoose.model("List", listSchema);

app.get("/", function(req, res) {
  Item.find({}, (err, docs) => {
    if(docs.length === 0) {
      Item.insertMany(defaultItems, (err) => {
        if(err) {
          console.log(err);
        } else {
          console.log("Successfully saved the default items to DB.");
        }
      });
      res.redirect("/");
    } else {
      res.render("list", {listTitle: "Today", newListItems: docs});
    }
  });
});

app.post("/", function(req, res) {
  const itemName = req.body.newItem;
  const listName = req.body.list;
  // console.log(req.body);
  const item = new Item({
    name: itemName
  });
  
  if(listName == "Today") {
    item.save();
    res.redirect("/");
  } else {
    List.findOne({name: listName}, (err, foundList) => {
      if(!err) {
        foundList.items.push(item);
        foundList.save();
        res.redirect("/" + listName);
      }
    });
  }
});

app.post("/delete", (req, res) => {
  // console.log(req.body);
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;

  if(listName === "Today") {
    Item.findByIdAndDelete(checkedItemId, (err) => {
      if(!err) {
        console.log("Successfully deleted the checked item.");
      } else {
        console.log(err);
      }
    });
    res.redirect("/");
  } else {
    List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItemId}}}, (err, foundList) => {
      if(!err) {
        console.log("Succesfully updated the document!");
        res.redirect("/" + listName);
      }
    })
  }
});

app.get("/:customListName", (req, res) => {
  customListName = _.capitalize(req.params.customListName);
  List.findOne({name: customListName}, (err, foundList) => {
    if(!err) {
      if(!foundList) {
        const list = new List({
          name: customListName,
          items: defaultItems
        });
        list.save();
        res.redirect("/" + customListName);
      } else {
        res.render("list", {listTitle: foundList.name, newListItems: foundList.items});
      }
    }
  });

});

app.get("/about", function(req, res){
  res.render("about");
});




let port = process.env.PORT;

if(port == null || port == "") {
  port = 3000;
}

app.listen(port, function() {
  console.log("Server started on port 3000");
});
