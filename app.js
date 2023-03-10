// express setup
const express = require('express');
const app = express();
app.use(express.static('public'));

// body-parser setup
const bodyParser = require ('body-parser');
app.use(bodyParser.urlencoded( {extended: true} ));

// db setup
const mongoose = require('mongoose');
mongoose.connect('mongodb://127.0.0.1:27017/todolistDB', {
  useNewUrlParser: true, 
  useUnifiedTopology: true
});

// lodash setup
const _ = require('lodash');

// setting engine
app.set('view engine', 'ejs');


// Generating item schema
const itemSchema = new mongoose.Schema({
  name: String
});

const Item = mongoose.model('Item', itemSchema);

// Generating 3 default tasks
const item1 = new Item({
  name: 'Welcome to my TODO List!'
});
const item2 = new Item({
  name: 'Hit the + button to add a new item.'
});
const item3 = new Item({
  name: '<-- Hit this to delete an item.'
});

const defaultItems = [item1, item2, item3];

const listSchema = new mongoose.Schema({
  name: String,
  items: [itemSchema]
});

const List = mongoose.model('List', listSchema);


// Rendering all items in db
app.get('/', (req, res) => {
  Item.find( {} )
  .then( (foundItems) => {

    // Adds default items to db only for initialization
    if (foundItems.length === 0) {
      Item.insertMany(defaultItems)
        .then( () => {
          console.log('Successfully inserted default items');
        })
        .catch( (err) => {
          console.log(err);
        });
      res.redirect('/');
    }

    // Rendering all items in db
    else {
      res.render('list', {
        listTitle: 'Today', 
        newListItems: foundItems,
      });
    };
  })
  .catch( (err) => {
    console.log(err);
  });
});


// Adds new item to list & redirects to get to render new item
app.post('/', (req, res) => {
  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item({
    name: itemName
  });

  // Checks request directory
  if (listName === 'Today') {
    item.save();
    res.redirect('/');
  }
  else {
    List.findOne({
      name: listName
    })
    .then( (foundList) => {
      foundList.items.push(item);
      foundList.save();
      res.redirect('/' + listName);
    })
    .catch( (err) => {
      console.log(err);
    });
  }
});


// Deleting checked item
app.post('/delete', (req, res) => {
  const checkedItemID = req.body.checkbox;
  const listName = req.body.listName;

  if (listName === 'Today'){
    Item.findByIdAndDelete(checkedItemID)
    .then( () => {
      console.log("Deleted item");
    })
    .catch( (err) => {
      console.log(err);;
    })
    res.redirect('/');
  }
  else {
    List.findOneAndUpdate(
      {name: listName}, // {condition}
      {$pull: {items: {_id: checkedItemID}}} // {action: {array: {query}}}
    )
    .then( (foundList) => {
      res.redirect('/' + listName);
    })
    .catch( (err) => {
      console.log(err);
    })    
  }
});


// Rendering all work list items
app.get('/:customRoute', (req, res) => {
  const customListName = _.capitalize(req.params.customRoute);

  List.findOne({
    name : customListName
  })
  .then( (foundList) => {
    if (!foundList) {
      const list = new List({
        name: customListName,
        items: defaultItems
      });

      list.save();
      res.redirect('/' + customListName);
    }
    else {
      res.render('list', {
        listTitle: foundList.name,
        newListItems: foundList.items,
      });
    }
  })
  .catch( (err) => {
    console.log(err);
  });
});


// Adding new work item & redirects to get to render new item
app.post('/work', (req, res) => {
  const regItem = req.body.newTask;
  workItems.push(regItem);

  res.redirect('/work');
});


// Rendering about page
app.get('/about', (req, res) => {
  res.render('about');
});


app.listen(process.env.PORT || 3000, () => {
  console.log('Server is running on port 3000...');
});