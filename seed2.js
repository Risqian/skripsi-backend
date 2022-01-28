var seeder = require('mongoose-seed');
var mongoose = require('mongoose');

// Connect to MongoDB via Mongoose
// seeder.connect('mongodb://127.0.0.1:27017/db_shootfutsal', {
seeder.connect('mongodb+srv://risqian99:Trew5432_@cluster0.slkrb.mongodb.net/db_shootfutsal?retryWrites=true&w=majority', {
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: true,
  useUnifiedTopology: true
}, function () {

  // Load Mongoose models
  seeder.loadModels([
    './models/Category',
    './models/Bank',
    './models/Item',
    './models/Feature',
    './models/Member',
    './models/Image',
    './models/Member',
    './models/Booking',
    './models/Users'
  ]);

  // Clear specified collections
  seeder.clearModels([], function () {

    seeder.populateModels(data, function () {
      seeder.disconnect();
    });

  });
});

var data = [
  {
    'model': 'Users',
    'documents': [
      {
        _id: mongoose.Types.ObjectId('5e96cbe292b97300fc903346'),
        username: 'user1',
        password: 'pass1',
      },
      {
        _id: mongoose.Types.ObjectId('5e96cbe292b97300fc903347'),
        username: 'user2',
        password: 'pass2',
      },
      {
        _id: mongoose.Types.ObjectId('5e96cbe292b97300fc903348'),
        username: 'user3',
        password: 'pass3',
      },
    ]
  }
];