const Category = require('../models/Category');
const Bank = require('../models/Bank');
const Item = require('../models/Item');
const Image = require('../models/Image');
const Feature = require('../models/Feature');
const Booking = require('../models/Booking');
const Member = require('../models/Member');
const Users = require('../models/Users');
const fs = require('fs-extra');
const path = require('path');
const bcrypt = require('bcryptjs');
const cloudinary = require('../middlewares/cloudinary');

module.exports = {
   viewSignin: async (req, res) => {
      try {
         const alertMessage = req.flash('alertMessage');
         const alertStatus = req.flash('alertStatus');
         const alert = { message: alertMessage, status: alertStatus };

         // Yang bikin suka logOut sendiri
         if (req.session.user == null || req.session.user == undefined) {
            res.render('index', {
               alert,
               title: "ShootFutsal | Login"
            });
         } else {
            res.redirect('/admin/dashboard');
         }
      } catch (error) {
         res.redirect('/admin/signin');
      }
   },

   actionSignin: async (req, res) => {
      try {
         const { username, password } = req.body;
         const user = await Users.findOne({ username: username });
         if (!user) {
            req.flash('alertMessage', 'User yang anda masukan tidak ada!!');
            req.flash('alertStatus', 'danger');
            res.redirect('/admin/signin');
         }
         const isPasswordMatch = await bcrypt.compare(password, user.password);
         if (!isPasswordMatch) {
            req.flash('alertMessage', 'Password yang anda masukan tidak cocok!!');
            req.flash('alertStatus', 'danger');
            res.redirect('/admin/signin');
         }

         req.session.user = {
            id: user.id,
            username: user.username
         }

         res.redirect('/admin/dashboard');

      } catch (error) {
         res.redirect('/admin/signin');
      }
   },

   actionLogout: (req, res) => {
      req.session.destroy();
      res.redirect('/admin/signin');
   },

   viewDashboard: async (req, res) => {
      try {
         const member = await Member.find();
         const booking = await Booking.find();
         const item = await Item.find();
         res.render('admin/dashboard/view_dashboard', {
            title: "ShootFutsal | Dashboard",
            user: req.session.user,
            member,
            booking,
            item
         });
      } catch (error) {
         res.redirect('/admin/dashboard');
      }
   },

   viewCategory: async (req, res) => {
      try {
         const category = await Category.find();
         const alertMessage = req.flash('alertMessage');
         const alertStatus = req.flash('alertStatus');
         const alert = { message: alertMessage, status: alertStatus };
         res.render('admin/category/view_category', {
            category,
            alert,
            title: "ShootFutsal | Category",
            user: req.session.user
         });
      } catch (error) {
         res.redirect('/admin/category');
      }
   },

   addCategory: async (req, res) => {
      try {
         const { name } = req.body;
         await Category.create({ name });
         req.flash('alertMessage', 'Success Add Category');
         req.flash('alertStatus', 'success');
         res.redirect('/admin/category');
      } catch (error) {
         req.flash('alertMessage', `${error.message}`);
         req.flash('alertStatus', 'danger');
         res.redirect('/admin/category');
      }
   },

   editCategory: async (req, res) => {
      try {
         const { id, name } = req.body;
         const category = await Category.findOne({ _id: id });
         category.name = name;
         await category.save();
         req.flash('alertMessage', 'Success Update Category');
         req.flash('alertStatus', 'success');
         res.redirect('/admin/category');
      } catch (error) {
         req.flash('alertMessage', `${error.message}`);
         req.flash('alertStatus', 'danger');
         res.redirect('/admin/category');
      }
   },

   deleteCategory: async (req, res) => {
      try {
         const { id } = req.params;
         const category = await Category.findOne({ _id: id });
         await category.remove();
         req.flash('alertMessage', 'Success Delete Category');
         req.flash('alertStatus', 'success');
         res.redirect('/admin/category');
      } catch (error) {
         req.flash('alertMessage', `${error.message}`);
         req.flash('alertStatus', 'danger');
         res.redirect('/admin/category');
      }
   },

   viewBank: async (req, res) => {
      try {
         const bank = await Bank.find();
         console.log("Bank : ", bank)
         const alertMessage = req.flash('alertMessage');
         const alertStatus = req.flash('alertStatus');
         const alert = { message: alertMessage, status: alertStatus };
         res.render('admin/bank/view_bank', {
            title: "ShootFutsal | Bank",
            alert,
            bank,
            user: req.session.user
         });
      } catch (error) {
         req.flash('alertMessage', `${error.message}`);
         req.flash('alertStatus', 'danger');
         res.redirect('/admin/bank')
      }
   },

   addBank: async (req, res) => {
      try {
         const { name, nameBank, nomorRekening } = req.body;
         const result = await cloudinary.uploader.upload(req.file.path);
         console.log("result : ", result)
         await Bank.create({
            name,
            nameBank,
            nomorRekening,
            // imageUrl: `images/${req.file.filename}`,
            imageUrl: result.secure_url,
            cloudinary_id: result.public_id
         });
         req.flash('alertMessage', 'Success Add Bank');
         req.flash('alertStatus', 'success');
         res.redirect('/admin/bank');
      } catch (error) {
         req.flash('alertMessage', `${error.message}`);
         req.flash('alertStatus', 'danger');
         res.redirect('/admin/bank');
      }
   },

   editBank: async (req, res) => {
      try {
         const { id, name, nameBank, nomorRekening } = req.body;
         const bank = await Bank.findOne({ _id: id });
         if (req.file == undefined) {
            bank.name = name;
            bank.nameBank = nameBank;
            bank.nomorRekening = nomorRekening;
            await bank.save();
            req.flash('alertMessage', 'Success Update Bank');
            req.flash('alertStatus', 'success');
            res.redirect('/admin/bank');
         } else {
            await cloudinary.uploader.destroy(bank.cloudinary_id);
            const result = await cloudinary.uploader.upload(req.file.path);
            bank.name = name;
            bank.nameBank = nameBank;
            bank.nomorRekening = nomorRekening;
            bank.imageUrl = result.secure_url;
            bank.cloudinary_id = result.public_id
            await bank.save();
            req.flash('alertMessage', 'Success Update Bank');
            req.flash('alertStatus', 'success');
            res.redirect('/admin/bank');
         }
      } catch (error) {
         req.flash('alertMessage', `${error.message}`);
         req.flash('alertStatus', 'danger');
         res.redirect('/admin/bank');
      }
   },

   deleteBank: async (req, res) => {
      try {
         const { id } = req.params;
         const bank = await Bank.findOne({ _id: id });
         await cloudinary.uploader.destroy(bank.cloudinary_id);
         await bank.remove();
         req.flash('alertMessage', 'Success Delete Bank');
         req.flash('alertStatus', 'success');
         res.redirect('/admin/bank');
      } catch (error) {
         req.flash('alertMessage', `${error.message}`);
         req.flash('alertStatus', 'danger');
         res.redirect('/admin/bank');
      }
   },

   viewItem: async (req, res) => {
      try {
         const item = await Item.find()
            .populate({ path: 'imageId', select: 'id imageUrl' })
            .populate({ path: 'categoryId', select: 'id name' });

         const category = await Category.find();
         const alertMessage = req.flash('alertMessage');
         const alertStatus = req.flash('alertStatus');
         const alert = { message: alertMessage, status: alertStatus };
         res.render('admin/item/view_item', {
            title: "ShootFutsal | Item",
            category,
            alert,
            item,
            action: 'view',
            user: req.session.user
         });
      } catch (error) {
         req.flash('alertMessage', `${error.message}`);
         req.flash('alertStatus', 'danger');
         res.redirect('/admin/item');
      }
   },

   addItem: async (req, res) => {
      try {
         const { categoryId, title, price, village, city, about } = req.body;
         if (req.files.length > 0) {
            if (req.files.length == 3) {
               const category = await Category.findOne({ _id: categoryId });
               const newItem = {
                  categoryId,
                  title,
                  description: about,
                  price,
                  village,
                  city
               }
               const item = await Item.create(newItem);
               category.itemId.push({ _id: item._id });
               await category.save();
               for (let i = 0; i < req.files.length; i++) {
                  const result = await cloudinary.uploader.upload(req.files[i].path);
                  const imageSave = await Image.create({
                     // imageUrl: `images/${req.files[i].filename}`
                     imageUrl: result.secure_url,
                     cloudinary_id: result.public_id
                  });
                  item.imageId.push({ _id: imageSave._id });
                  await item.save();
               }
               req.flash('alertMessage', 'Success Add Item');
               req.flash('alertStatus', 'success');
               res.redirect('/admin/item');
            } else {
               req.flash('alertMessage', 'Photo harus berjumlah 3');
               req.flash('alertStatus', 'danger');
               res.redirect('/admin/item');
            }
         }
      } catch (error) {
         req.flash('alertMessage', `${error.message}`);
         req.flash('alertStatus', 'danger');
         res.redirect('/admin/item');
      }
   },

   showImageItem: async (req, res) => {
      try {
         const { id } = req.params;
         const item = await Item.findOne({ _id: id })
            .populate({ path: 'imageId', select: 'id imageUrl' });
         const alertMessage = req.flash('alertMessage');
         const alertStatus = req.flash('alertStatus');
         const alert = { message: alertMessage, status: alertStatus };
         res.render('admin/item/view_item', {
            title: "ShootFutsal | Show Image Item",
            alert,
            item,
            action: 'show image',
            user: req.session.user
         });
      } catch (error) {
         req.flash('alertMessage', `${error.message}`);
         req.flash('alertStatus', 'danger');
         res.redirect('/admin/item');
      }
   },

   showEditItem: async (req, res) => {
      try {
         const { id } = req.params;
         const item = await Item.findOne({ _id: id })
            .populate({ path: 'imageId', select: 'id imageUrl' })
            .populate({ path: 'categoryId', select: 'id name' });
         const category = await Category.find();
         const alertMessage = req.flash('alertMessage');
         const alertStatus = req.flash('alertStatus');
         const alert = { message: alertMessage, status: alertStatus };
         res.render('admin/item/view_item', {
            title: "ShootFutsal | Edit Item",
            alert,
            item,
            category,
            action: 'edit',
            user: req.session.user
         });
      } catch (error) {
         req.flash('alertMessage', `${error.message}`);
         req.flash('alertStatus', 'danger');
         res.redirect('/admin/item');
      }
   },

   editItem: async (req, res) => {
      try {
         const { id } = req.params;
         const { categoryId, title, price, village, city, about } = req.body;
         const item = await Item.findOne({ _id: id })
            .populate({ path: 'imageId', select: 'id imageUrl' })
            .populate({ path: 'categoryId', select: 'id name' });

         if (req.files.length > 0) {
            if (req.files.length == 3) {
               for (let i = 0; i < item.imageId.length; i++) {
                  const imageUpdate = await Image.findOne({ _id: item.imageId[i]._id });
                  await cloudinary.uploader.destroy(imageUpdate.cloudinary_id);
                  const result = await cloudinary.uploader.upload(req.files[i].path);
                  imageUpdate.imageUrl = result.secure_url;
                  imageUpdate.cloudinary_id = result.public_id
                  await imageUpdate.save();
               }
               item.title = title;
               item.price = price;
               item.village = village;
               item.city = city;
               item.description = about;
               item.categoryId = categoryId;
               await item.save();
               req.flash('alertMessage', 'Success update Item');
               req.flash('alertStatus', 'success');
               res.redirect('/admin/item');
            } else {
               req.flash('alertMessage', 'Photo harus berjumlah 3');
               req.flash('alertStatus', 'danger');
               res.redirect('/admin/item');
            }
         } else {
            item.title = title;
            item.price = price;
            item.village = village;
            item.city = city;
            item.description = about;
            item.categoryId = categoryId;
            await item.save();
            req.flash('alertMessage', 'Success update Item');
            req.flash('alertStatus', 'success');
            res.redirect('/admin/item');
         }
      } catch (error) {
         req.flash('alertMessage', `${error.message}`);
         req.flash('alertStatus', 'danger');
         res.redirect('/admin/item');
      }
   },

   deleteItem: async (req, res) => {
      try {
         const { id } = req.params;
         const item = await Item.findOne({ _id: id }).populate('imageId');
         for (let i = 0; i < item.imageId.length; i++) {
            Image.findOne({ _id: item.imageId[i]._id }).then((image) => {
               cloudinary.uploader.destroy(image.cloudinary_id);
               image.remove();
            }).catch((error) => {
               req.flash('alertMessage', `${error.message}`);
               req.flash('alertStatus', 'danger');
               res.redirect('/admin/item');
            });
         }
         await item.remove();
         req.flash('alertMessage', 'Success delete Item');
         req.flash('alertStatus', 'success');
         res.redirect('/admin/item');
      } catch (error) {
         req.flash('alertMessage', `${error.message}`);
         req.flash('alertStatus', 'danger');
         res.redirect('/admin/item');
      }
   },

   viewDetailItem: async (req, res) => {
      const { itemId } = req.params;
      try {
         const alertMessage = req.flash('alertMessage');
         const alertStatus = req.flash('alertStatus');
         const alert = { message: alertMessage, status: alertStatus };

         const feature = await Feature.find({ itemId: itemId });
         // const activity = await Activity.find({ itemId: itemId });
         console.log("Feature : ", feature)

         res.render('admin/item/detail_item/view_detail_item', {
            title: 'ShootFutsal | Detail Item',
            alert,
            itemId,
            feature,
            // activity,
            user: req.session.user
         })

      } catch (error) {
         req.flash('alertMessage', `${error.message}`);
         req.flash('alertStatus', 'danger');
         res.redirect(`/admin/item/show-detail-item/${itemId}`);
      }
   },

   addFeature: async (req, res) => {
      const { name, qty, itemId } = req.body;
      console.log("name : ", name)
      const obj = JSON.parse(name)

      try {
         const feature = await Feature.create({
            name: obj.nama,
            qty,
            itemId,
            imageUrl: `${obj.image}`
         });

         const item = await Item.findOne({ _id: itemId });
         item.featureId.push({ _id: feature._id });
         await item.save()
         req.flash('alertMessage', 'Success Add Feature');
         req.flash('alertStatus', 'success');
         res.redirect(`/admin/item/show-detail-item/${itemId}`);
      } catch (error) {
         req.flash('alertMessage', `${error.message}`);
         req.flash('alertStatus', 'danger');
         res.redirect(`/admin/item/show-detail-item/${itemId}`);
      }
   },

   editFeature: async (req, res) => {
      const { id, name, qty, itemId } = req.body;
      console.log("req.body : ", req.body)
      const obj = JSON.parse(name)
      try {
         const feature = await Feature.findOne({ _id: id });
         feature.name = obj.nama;
         feature.qty = qty;
         feature.imageUrl = `${obj.image}`
         await feature.save();
         req.flash('alertMessage', 'Success Update Feature');
         req.flash('alertStatus', 'success');
         res.redirect(`/admin/item/show-detail-item/${itemId}`);

      } catch (error) {
         req.flash('alertMessage', `${error.message}`);
         req.flash('alertStatus', 'danger');
         res.redirect(`/admin/item/show-detail-item/${itemId}`);
      }
   },

   deleteFeature: async (req, res) => {
      const { id, itemId } = req.params;
      try {
         const feature = await Feature.findOne({ _id: id });

         const item = await Item.findOne({ _id: itemId }).populate('featureId');
         for (let i = 0; i < item.featureId.length; i++) {
            if (item.featureId[i]._id.toString() === feature._id.toString()) {
               item.featureId.pull({ _id: feature._id });
               await item.save();
            }
         }
         await fs.unlink(path.join(`${feature.imageUrl}`));
         await feature.remove();
         req.flash('alertMessage', 'Success Delete Feature');
         req.flash('alertStatus', 'success');
         res.redirect(`/admin/item/show-detail-item/${itemId}`);
      } catch (error) {
         req.flash('alertMessage', `${error.message}`);
         req.flash('alertStatus', 'danger');
         res.redirect(`/admin/item/show-detail-item/${itemId}`);
      }
   },

   viewBooking: async (req, res) => {
      try {
         const booking = await Booking.find()
            .populate('memberId')
            .populate('bankId');

         res.render('admin/booking/view_booking', {
            title: "ShootFutsal | Booking",
            user: req.session.user,
            booking
         });
      } catch (error) {
         res.redirect('/admin/booking');
      }
   },

   showDetailBooking: async (req, res) => {
      const { id } = req.params
      try {
         const alertMessage = req.flash('alertMessage');
         const alertStatus = req.flash('alertStatus');
         const alert = { message: alertMessage, status: alertStatus };

         const booking = await Booking.findOne({ _id: id })
            .populate('memberId')
            .populate('bankId');

         res.render('admin/booking/show_detail_booking', {
            title: "ShootFutsal | Detail Booking",
            user: req.session.user,
            booking,
            alert
         });
      } catch (error) {
         res.redirect('/admin/booking');
      }
   },

   actionConfirmation: async (req, res) => {
      const { id } = req.params;
      try {
         const booking = await Booking.findOne({ _id: id });
         booking.payments.status = 'Accept';
         await booking.save();
         req.flash('alertMessage', 'Success Confirmation Pembayaran');
         req.flash('alertStatus', 'success');
         res.redirect(`/admin/booking/${id}`);
      } catch (error) {
         res.redirect(`/admin/booking/${id}`);
      }
   },

   actionReject: async (req, res) => {
      const { id } = req.params;
      try {
         const booking = await Booking.findOne({ _id: id });
         booking.payments.status = 'Reject';
         await booking.save();
         req.flash('alertMessage', 'Success Reject Pembayaran');
         req.flash('alertStatus', 'success');
         res.redirect(`/admin/booking/${id}`);
      } catch (error) {
         res.redirect(`/admin/booking/${id}`);
      }
   }
};