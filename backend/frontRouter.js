/**
 * Created by KIMSEONHO on 2016-08-16.
 */
const passport = require('passport'),
  express = require('express'),
  multer = require('multer'),

  multerConfig = require('./config/multer'),
  PublicController = require('./controllers/public'),
  AuthController = require('./controllers/authentication'),
  UserController = require('./controllers/user'),
  ConsultController = require('./controllers/consult'),
  BuildCaseController = require('./controllers/build-case'),
  BizStoreController = require('./controllers/biz-store'),

  // ChatController = require('./controllers/chat'),
  // CommunicationController = require('./controllers/communication'),
  // StripeController = require('./controllers/stripe'),
  passportService = require('./config/passport'),   // 설정값 로딩때문에 필요함

  quoter  = require('./tests/quoter');    // test route

var env = process.env.NODE_ENV || "development";
var config = require('./config/main')[env];

// Middleware to require login/auth
const requireAuth = passport.authenticate('jwt', { session: false });
const requireLogin = passport.authenticate('local', { session: false });


const buildCaseImageUpload = multer({ storage: multerConfig.buildCaseInfoStorage }).fields([
  { name: 'previewImage', maxCount: 1 }, { name: 'vrImage', maxCount: 15 }]);
const editorImageUpload = multer({ storage: multerConfig.editorImageStorage })
  .array('editorImage', 10);
var testFileUpload = multer({ dest: config.resourcePath + '/tests' }).any();


module.exports = function(app) {
  // Initializing route groups
  var apiRoutes = express.Router(),
    publicRoutes = express.Router(),
    authRoutes = express.Router(),
    userRoutes = express.Router(),
    consultRoutes = express.Router(),
    buildCaseRoutes = express.Router(),
    bizStoreRoutes = express.Router();

  // chatRoutes = express.Router(),
  // payRoutes = express.Router(),
  // communicationRoutes = express.Router();

  //=========================
  // Test Routes
  //=========================

  // Test normal route
  apiRoutes.get('/random', function(req, res) {
    res.status(200).json({ quote: quoter.getRandomOne() });
  });

  // Test protected route, 회원 id를 포함한 정보는 jwt값으로 인코딩해서 보내야 함.
  apiRoutes.get('/protected', requireAuth, function(req, res) {
    res.status(200).json({ content: 'The protected test route is functional!'});
  });

  //=========================
  // public Routes
  //=========================

  // Set public routes as subgroup/middleware to apiRoutes
  apiRoutes.use('/public', publicRoutes);

  // upload Image and return path when try to attaching device image
  publicRoutes.post('/image', editorImageUpload, PublicController.uploadEditorImage);

  // test - upload file and return path when try to attaching device file
  publicRoutes.post('/file/test', testFileUpload, PublicController.uploadFileTest);

  //=========================
  // Auth Routes
  //=========================

  // Set auth routes as subgroup/middleware to apiRoutes
  apiRoutes.use('/auth', authRoutes);

  // Registration route
  authRoutes.post('/register', AuthController.register);

  // Login route
  authRoutes.post('/login', requireLogin, AuthController.login);

  // Password reset request route (generate/send token)
  authRoutes.post('/forgot-password', AuthController.forgotPassword);

  authRoutes.post('/reset-password/:token', AuthController.verifyToken);

  //=========================
  // Member Routes
  //=========================

  // Set user routes as a subgroup/middleware to apiRoutes
  apiRoutes.use('/user', userRoutes);

  // View public user profile route
  userRoutes.get('/:memberIdx', requireAuth, UserController.viewProfile);

  // Update user profile route
  userRoutes.put('/:memberIdx', requireAuth, UserController.updateProfile, requireLogin, AuthController.login);

  // View business user profile route
  userRoutes.get('/biz/:memberIdx', requireAuth, UserController.viewBizProfile);

  // update business user profile route
  userRoutes.put('/biz/:memberIdx', requireAuth, UserController.updateBizProfile);


  //=========================
  // Build Case Routes
  //=========================

  // Set BuildCase routes as a subgroup/middleware to apiRoutes
  apiRoutes.use('/build-case', buildCaseRoutes);

  // View Build Case List from authenticated user(must get query(?pageSize={}&pageStartIndex={}) param)
  buildCaseRoutes.get('/', BuildCaseController.viewBuildCaseList);

  // View Build Case Info
  buildCaseRoutes.get('/:buildCaseIdx', BuildCaseController.viewBuildCase);

  // create new Build Case Info from authenticated user
  // buildCaseRoutes.post('/', requireAuth,  testImageUpload, BuildCaseController.createBuildCaseAndVRPano);

  // create new Build Case Info from authenticated user
  buildCaseRoutes.post('/', requireAuth,  buildCaseImageUpload, BuildCaseController.createBuildCaseAndVRPano);

  // update Build Case Info from authenticated user
  buildCaseRoutes.put('/:buildCaseIdx', requireAuth, buildCaseImageUpload, BuildCaseController.updateBuildCase);

  // delete Build Case Info from authenticated user
  buildCaseRoutes.delete('/:buildCaseIdx', requireAuth, BuildCaseController.deleteBuildCase);

  // search Build Case Info (must get query(?query={}) param)
  buildCaseRoutes.get('/search', BuildCaseController.searchBuildCase);

  //=========================
  // Biz Store Route - 업체 목록 조회
  //=========================

  // Set chat routes as a subgroup/middleware to apiRoutes
  apiRoutes.use('/biz-store', bizStoreRoutes);

  // View business user profile list route(must get query(?pageSize={}&pageStartIndex={}) param)
  bizStoreRoutes.get('/', BizStoreController.viewBizProfileList);

  // View business user profile to customer route
  bizStoreRoutes.get('/:memberIdx', BizStoreController.viewBizProfile);


  //=========================
  // Payment Routes
  //=========================
  // apiRoutes.use('/pay', payRoutes);

  // Webhook endpoint for Stripe
  // payRoutes.post('/webhook-notify', StripeController.webhook);

  // Create customer and subscription
  // payRoutes.post('/customer', requireAuth, StripeController.createSubscription);

  // Update customer object and billing information
  // payRoutes.put('/customer', requireAuth, StripeController.updateCustomerBillingInfo);

  // Delete subscription from customer
  // payRoutes.delete('/subscription', requireAuth, StripeController.deleteSubscription);

  // Upgrade or downgrade subscription
  // payRoutes.put('/subscription', requireAuth, StripeController.changeSubscription);

  // Fetch customer information
  // payRoutes.get('/customer', requireAuth, StripeController.getCustomer);

  //=========================
  // Communication Routes
  //=========================
  // apiRoutes.use('/communication', communicationRoutes);

  // Send email from contact form
  // communicationRoutes.post('/contact', CommunicationController.sendContactForm);

  //=========================
  // Consult Routes
  //=========================
  apiRoutes.use('/consult', consultRoutes);

  // insert consulting information
  consultRoutes.post('/', requireAuth, ConsultController.consultingCounsel);

  // consulting information list
  consultRoutes.get('/', ConsultController.consultingList);

  // consulting information list
  consultRoutes.get('/my/', requireAuth, ConsultController.consultingMyList);

  // consulting information detail
  consultRoutes.get('/:consultDataIdx', requireAuth, ConsultController.consultingDetail);

  // modify consulting information
  consultRoutes.put('/:consultDataIdx', requireAuth, ConsultController.consultingModify);

  // Set url for API group routes
  app.use('/api', apiRoutes);
};
