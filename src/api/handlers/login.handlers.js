const Company = require('../models/company.model')
const Users = require('../models/users.model')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

exports.login = async (req, res, next) => {
  try {
    const company = Company.findOne({ email: req.body.email })
    const user = Users.findOne({ email: req.body.email })
    if (Company) {
      if (company.approved === 'pending') {
        return res.status(401).send({
          message:
            'Our admin team is reviewing your sign up request. Please wait for the response!',
        })
      } else if (company.approved === 'declined') {
        return res.status(401).send({
          message:
            'Your sign-up request has unfortunately been declined. Please contact our administration for more information.',
        })
      }
      bcrypt.compare(req.body.password, company.password, (err, result) => {
        if (err) {
          return res.status(401).send({
            message: 'Auth failed',
          })
        }
        if (result) {
          const token = jwt.sign(
            {
              email: company.email,
              companyId: company._id,
            },
            process.env.JWT_KEY,
            {
              expiresIn: '12h',
            }
          )
          return res.status(200).send({
            id: company._id,
            type: company.type,
            token: token,
            message: 'Auth successful',
          })
        }
        res.status(401).send({
          message: 'Auth failed',
        })
      })
    } else if (user) {
      if (user.approved === 'pending') {
        return res.status(401).send({
          message:
            'Our admin team is reviewing your sign up request. Please wait for the response!',
        })
      } else if (user.approved === 'declined') {
        return res.status(401).send({
          message:
            'Your sign-up request has unfortunately been declined. Please contact our administration for more information.',
        })
      }
      bcrypt.compare(req.body.password, user.password, (err, result) => {
        if (err) {
          return res.status(401).send({
            message: 'Auth failed',
          })
        }
        if (result) {
          const token = jwt.sign(
            {
              email: user.email,
              userId: user._id,
            },
            process.env.JWT_KEY,
            {
              expiresIn: '12h',
            }
          )
          return res.status(200).send({
            id: user._id,
            type: user.type,
            token: token,
            message: 'Auth successful',
          })
        }
        res.status(401).send({
          message: 'Auth failed',
        })
      })
    } else {
      return res.status(401).send({
        message: 'Auth failed',
      })
    }
  } catch (err) {
    return res.status(500).send({
      message: 'Something went wrong, try later',
      err,
    })
  }
}
exports.loginAdmin = (req, res) => {
  Users.findOne({ email: req.body.email, type: 'admin' })
    .then(user => {
      if (!user) {
        return res.status(401).send({
          message: 'Auth failed: email or password is incorrect',
        })
      }
      bcrypt.compare(req.body.password, user.password, (err, result) => {
        if (err) {
          return res.status(401).send({
            message: 'Auth failed: email or password is incorrect',
          })
        }
        if (result) {
          const token = jwt.sign(
            {
              email: user.email,
              userId: user._id,
            },
            process.env.JWT_KEY,
            {
              expiresIn: '12h',
            }
          )
          return res.status(200).send({
            data: {
              type: user.type,
            },
            token: token,
            message: 'Auth successful',
          })
        }
        res.status(401).send({
          message: 'Auth failed: email or password is incorrect',
        })
      })
    })
    .catch(_ => {
      res.status(400).send({
        message: 'Auth failed: email or password is incorrect',
      })
    })
}
