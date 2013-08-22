// Define routes for simple SSJS web app. 
// Writes Coinbase orders to database.
var async   = require('async')
  , express = require('express')
  , fs      = require('fs')
  , http    = require('http')
  , https   = require('https')
  , db      = require('./models');

var app = express();
app.use(express.bodyParser());          // Request Body Parsing middleware
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.set('port', process.env.PORT || 8080);

// Render homepage (note trailing slash): example.com/
app.get('/', function(request, response) {
  // var data = fs.readFileSync('index.html').toString();
  // response.send(data);
  var header = fs.readFileSync('header.html').toString();
  var body = fs.readFileSync('home.html').toString();
  var footer = fs.readFileSync('footer.html').toString();
  response.send( header + body + footer );
});

// contact
app.get('/contact', function(request, response) {
  var header = fs.readFileSync('header.html').toString();
  var body = fs.readFileSync('contact.html').toString();
  response.send( header + body );
});

// signup : form post
app.post('/signup', function(request, response) {
  var email = request.param('email');
  var name = request.param('name');
  var interest = request.param('interest');

  var header = fs.readFileSync('header.html').toString();
  var user_json = {email: email, name: name, interest: interest};
  var status = addUser(user_json, function(code, message) {
            response.send( header + buildAlert(code, message) );
  });
});

// signin
app.get('/signin', function(request, response) {
  var header = fs.readFileSync('header.html').toString();
  response.send( header + "<html> Not implemented yet ! </html>" );
});

// Render example.com/orders
app.get('/orders', function(request, response) {
  global.db.Order.findAll().success(function(orders) {
    var orders_json = [];
    orders.forEach(function(order) {
      orders_json.push({id: order.coinbase_id, amount: order.amount, time: order.time});
    });
    // Uses views/orders.ejs
    response.render("orders", {orders: orders_json});
  }).error(function(err) {
    console.log(err);
    response.send("error retrieving orders");
  });
});

// Hit this URL while on example.com/orders to refresh
app.get('/refresh_orders', function(request, response) {
  https.get("https://coinbase.com/api/v1/orders?api_key=" + process.env.COINBASE_API_KEY, function(res) {
    var body = '';
    res.on('data', function(chunk) {body += chunk;});
    res.on('end', function() {
      try {
        var orders_json = JSON.parse(body);
        if (orders_json.error) {
          response.send(orders_json.error);
          return;
        }
        // add each order asynchronously
        async.forEach(orders_json.orders, addOrder, function(err) {
          if (err) {
            console.log(err);
            response.send("error adding orders");
          } else {
            // orders added successfully
            response.redirect("/orders");
          }
        });
      } catch (error) {
        console.log(error);
        response.send("error parsing json");
      }
    });

    res.on('error', function(e) {
      console.log(e);
      response.send("error syncing orders");
    });
  });

});

// sync the database and start the server
db.sequelize.sync().complete(function(err) {
  if (err) {
    throw err;
  } else {
    http.createServer(app).listen(app.get('port'), function() {
      console.log("Listening on " + app.get('port'));
    });
  }
});

// add order to the database if it doesn't already exist
var addOrder = function(order_obj, callback) {
  var order = order_obj.order; // order json from coinbase
  if (order.status != "completed") {
    // only add completed orders
    callback();
  } else {
    var Order = global.db.Order;
    // find if order has already been added to our database
    Order.find({where: {coinbase_id: order.id}}).success(function(order_instance) {
      if (order_instance) {
        // order already exists, do nothing
        callback();
      } else {
        // build instance and save
          var new_order_instance = Order.build({
          coinbase_id: order.id,
          amount: order.total_btc.cents / 100000000, // convert satoshis to BTC
          time: order.created_at
        });
          new_order_instance.save().success(function() {
          callback();
        }).error(function(err) {
          callback(err);
        });
      }
    });
  }
};


// add a user
var addUser = function(user, callback) {
    var User = global.db.User;
    // find if user has already been added to our database
    User.find({where: {email: user.email}}).success(function(user_instance) {
      if (user_instance) {
        // user already exists, do nothing
        callback(1, "'" + user.email + "' is already on the Mailing List ! ");
      } else {
          // build instance and save
          var new_user_instance = User.build({
                      email: user.email,
                      name: user.name,
                      interest: user.interest
          });
          new_user_instance.save().success(function() {
          callback(0, "Thanks for signing up !");
        }).error(function(err) {
          callback(9, "%%Unexpected error " + err);
        });
      }
    });
};

// Render Catalog items
app.get('/items', function(request, response) {
  global.db.Item.findAll().success(function(items) {
    var items_json = [];
    items.forEach(function(item) {
      items_json.push({item_id: item.item_id, country_of_origin: item.country_of_origin, description: item.description, cost: item.cost});
    });
    response.render("items", {items: items_json});
  }).error(function(err) {
    console.log(err);
    response.send("error retrieving catalog items");
  });
});

 // Show Mailing List
app.get('/users', function(request, response) {
  global.db.User.findAll().success(function(users) {
    var users_json = [];
    users.forEach(function(user) {
      users_json.push({email: user.email, name: user.name, interest: user.interest});
    });
    response.render("users", {users: users_json});
  }).error(function(err) {
    console.log(err);
    response.send("error retrieving Mailing List");
  });
});


function buildAlert( code, message ) {
      var alert = "alert-error";
      if (code == 0) {
          alert = "alert-success";
      } else if (code == 1) {
          alert = "alert-info";
      }
      var html = 	
	'<html lang="en"> \n' +    
	'   <style type="text/css"> \n' +   
	'    body { \n' +   
	'        padding: 50px; \n' +   
	'    }  \n' +  
	'   </style> \n' +   
	'   <body>  \n' +  
	'    <div class="alert ' + alert + '"> \n' +   
	'      <a class="close" data-dismiss="alert">×<a/>\n ' +  
	'        <strong>' + message + ' </strong>\n' +
	'    </div>  \n' +  
	'   </body>  \n' +  
	'</html>  \n';  

      return html;
}
