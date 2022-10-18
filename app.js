//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require('mongoose');
const date = require(__dirname + "/date.js");
const _ = require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://admin-jose:test1234@cluster0.gjh5mwg.mongodb.net/todolistDB");

const itemsSchema = { //creating the document Scheme or JSON like date
  name: {
    type: String,
    required: true
  }
};

const Item = mongoose.model("Item", itemsSchema); // creating the model/collections

const item1 = new Item({ // creating a document uisng the Model Schema
  name: "Welcome to your todolist!"
})

const item2 = new Item({
  name: "Hit the + button to add a new item."
})

const item3 = new Item({
  name: "<-- Hit this to delete an item."
})

const defaultItems = [item1, item2, item3];

const listSchema = {
  name: {
    type: String,
    required: true
  },

  items: [itemsSchema]
};

const List = mongoose.model("List", listSchema);

app.get("/", function(req, res) {
  Item.find({}, function(err, foundItems) {
    // console.log(foundItems);
    if (foundItems.length === 0) {
      Item.insertMany(defaultItems, function(err) { // Use model to indertMandy documents
        if (err) {
          console.log(err);
        } else {
          res.redirect("/");
        }
      });

    }
    else {


      res.render("list", {
        listTitle: "Today",
        newListItems: foundItems
      });

    }
  });
});


app.get("/:customListName", function(req, res) {
  const customListName = _.capitalize(req.params.customListName);

  List.findOne({name: customListName}, function (err, foundList) {
    if (!err) {
      if (!foundList) {
        const list = new List ({
          name: customListName,
          items: defaultItems
        });

        list.save();
        res.redirect("/" + customListName);

      } else {
        res.render("list", {
          listTitle: foundList.name,
          newListItems: foundList.items
        });
      }
    }
  });


});

app.post("/", function(req, res) {

  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item({
    name: itemName
  })

  if (listName === "Today") {
    item.save();
    res.redirect("/");
  } else {
    List.findOne({name: listName}, function(err, foundList) {
      foundList.items.push(item);
      foundList.save();
      res.redirect("/" + listName);
    });
  }


  // const item = req.body.newItem;

  // if (req.body.list === "Work") {
  //   workItems.push(item);
  //   res.redirect("/work");
  // } else {
  //   items.push(item);
  //   res.redirect("/");
  // }

});

app.post("/delete", function(req, res){
  // console.log(req.body.checkbox);
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;

  if (listName === "Today") {
    Item.findByIdAndRemove(checkedItemId, function(err) {
      if (err) {
        console.log(err);
      }

      else {
        res.redirect("/");
      }
    });
  }

  else {
    List.findOneAndUpdate(
      {name: listName},
      {$pull: {items: {_id: checkedItemId}}},
      function (err, foundList) {
        if (!err) {
          res.redirect("/" + listName)
        }
      }
    );
  }


});

app.get("/work", function(req, res) {
  res.render("list", {
    listTitle: "Work List",
    newListItems: workItems
  });
});

app.get("/about", function(req, res) {
  res.render("about");
});

app.set("port", process.env.PORT || 3000);

app.listen(app.get("port"), function() {
  console.log("Server started on port 3000");
});
