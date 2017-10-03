const express = require('express');
const bcrypt = require('bcrypt');
const passport = require('passport');

const UserModel = require('../models/user-model');

const router = express.Router();


router.post('/process-signup', (req,res,next) => {
    if(!req.body.signupFullName || !req.body.signupUsername || !req.body.signupPassword) {
        res.status(400).json({ errorMessage: 'We need both username and password'});
        return;
    }

    UserModel.findOne(
      { username: req.body.signupUsername },
      (err,userFromDb) => {
          if (err){
              console.log('User find err', err);
              res.status(500).json({ errorMessage: 'Error finding username'});
              return;
            }

          if (userFromDb) {
              res.status(400).json({ errorMessage: 'Username was taken'});
              return;
            }

            const salt = bcrypt.genSaltSync(10);
            const hashPass = bcrypt.hashSync(req.body.signupPassword, salt);

            const theUser = new UserModel({
                fullName: req.body.signupFullName,
                username: req.body.signupUsername,
                encryptedPassword: hashPass
            });

            theUser.save((err) => {
                if (err) {
                    console.log('User save error', err);
                    res.status(500).json({ errorMessage: 'Error saving user.'});
                    return;
                }
                //"req.login" is a passport method/logs in automatically
                req.login(theUser, (err) => {
                    if (err) {
                        console.log('User auto-login error', err);
                        res.status(500).json({ errorMessage: 'Error loggin in user'});
                        return;
                    }
                    //clear out the password before
                    theUser.encryptedPassword = undefined;
                    res.status(200).json(theUser);
                });
            });
      }
    );// UserModel.findOne()
});// POST /api/process-signup

router.post('/process-login', (req, res, next) => {
    const customAuthCallback =
      passport.authenticate('local', (err, theUser, extraInfo) => {
          if (err){
              console.log(err);
              res.status(500).json({errorMessage: 'Login failed'});
              return;
          }
          if (!theUser){
              console.log('Not USER');
              console.log(err);
              res.status(401).json({errorMessage: extraInfo.message});
              return;
          }

          req.login(theUser, (err) => {
              if(err) {
                console.log('Req Login');
                console.log(err);
                res.status(500).json({errorMessage: 'Login failed'});
                return;
              }
              console.log(req.user);
              theUser.encryptedPassword = undefined;
              res.status(200).json(theUser)
          });
      }); //passport.authenticate('local')

      customAuthCallback(req,res,next);
}); // POST /api/process-login

router.delete('/logout', (req,res,next) => {
    req.logout();
    res.status(200).json({ successMessage: 'Log out success!'});
});

router.get('/checklogin', (req, res, next) => {
  let amIloggedIn = false;

    if (req.user) {
      req.user.encryptedPassword = undefined;
      amIloggedIn = true;
    }

    res.status(200).json(
      {
        isLoggedIn: amIloggedIn,
        userInfo: req.user
      }
    ); // res.status(200)
});






module.exports = router;
