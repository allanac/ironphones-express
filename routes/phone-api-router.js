const express = require('express');

const PhoneModel = require('../models/phone-model');

const router = express.Router();

router.get('/phones', (req, res, next) => {
    PhoneModel.find()
      .limit(20)
      .sort({ _id: -1 })
      .exec((err, recentPhones) => {
          if (err){
            res.status(500).json({ errorMessage: 'Finding phones went wrong 💩'})
            return;
          }
          res.status(200).json(recentPhones);
      });
});

router.post('/phones', (req, res, next) => {
  console.log(req.user);
  if(!req.user) {
    res.status(401).json({errorMessage: 'Not logged in.'});
    return;
  }
    const thePhone = new PhoneModel({
        name:  req.body.phoneName,
        brand: req.body.phoneBrand,
        image: req.body.phoneImage,
        specs: req.body.phoneSpecs,
        phoner:req.user._id
    });

    thePhone.save((err) => {
        if (thePhone.errors){
            res.status(400).json({
                errorMessage: 'Validation failed 🤢',
                validationErrors: thePhone.errors
            });
            return;
        }
        if(err) {
            console.log('Error POSTING phone', err);
            res.status(500).json({ errorMessage: 'New phone went wrong 💩'});
            return;
        }
        res.status(200).json(thePhone);
    });
});

router.get('/phones/:phoneId', (req, res, next) => {
    console.log(req.user);
    PhoneModel.findById(
      req.params.phoneId,
      (err, phoneFromDb) => {
          if(err) {
            console.log('Phone details Error', err);
            res.status(500).json({ errorMessage: 'Phone details went wrong 💩'});
            return;
          }

          res.status(200).json(phoneFromDb);
      }
    );
});

router.put('/phones/:phoneId', (req,res,next) => {
  PhoneModel.findById(
    req.params.phoneId,
    (err, phoneFromDb) => {
        if(err) {
          console.log('Phone details Error', err);
          res.status(500).json({ errorMessage: 'Phone details went wrong 💩'});
          return;
        }

        phoneFromDb.set({
          name:  req.body.phoneName,
          brand: req.body.phoneBrand,
          image: req.body.phoneImage,
          specs: req.body.phoneSpecs
        });

        phoneFromDb.save((err) => {
          if (phoneFromDb.errors) {
              res.status(400).json({
                  errorMessage: 'Update validation failed 🤢',
                  validationErrors: phoneFromDb.errors
              });
              return;
          }

          if (err) {
              console.log('Phone update ERROR', err);
              res.status(500).json({ errorMessage: 'Phone update went wrong 💩'});
              return;
          }

          res.status(200).json(phoneFromDb);
    });
    }
  );
});

router.delete('/phones/:phoneId', (req, res, next) => {
  if(!req.user) {
    
    res.status(401).json({errorMessage: 'Not logged in.'});
    return;
  }

  PhoneModel.findById(
    req.params.phoneId,
      (err, phoneFromDb) => {

        if (err) {
          console.log('Phone owner confirm Error', err);
          res.staus(500).json(
            {errorMessage: 'Phone owner confirm went wrong'}
          );//res.status 500
          return;
        }
        if(phoneFromDb.phoner.toString() !== req.user._id.toString()) {
            res.status(403).json({errorMessage: 'Phone not yours.'});
            return
        }
        PhoneModel.findByIdAndRemove(
            req.params.phoneId,
            (err, phoneFromDb) => {
                if(err) {
                    console.log('Phone delete ERROR', err);
                    res.status(500).json({ errorMessage: 'Phone delete went wrong 💩'});
                    return;
                }

                res.status(200).json(phoneFromDb);
            }
        ); // findByIdandRemove()
      }
  ); //findById()

}); // DELETE /phones/:phonesId

router.get('/myphones', (req, res, next) => {
  if(!req.user) {
    console.log('Here!!! 1');
    res.status(401).json({errorMessage: 'Not logged in.'});
    return;
  }

  PhoneModel.find({phoner:req.user._id })
    .sort({ _id: -1 })
    .exec((err, myPhonesResults) => {
        if(err) {
            res.status(500).json({ errorMessage: 'My phones went wrong'});
            return;
        }
        res.status(200).json(myPhonesResults);

    }); //exec()
}); // Get /myPhones
module.exports = router;
