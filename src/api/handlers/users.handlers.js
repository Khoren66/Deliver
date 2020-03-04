const Company = require('../models/company.model')
const Users = require('../models/users.model')
const sendEmail = require('../../services/sendEmail')
const bcrypt = require('bcrypt')

exports.getAllUsers = async (req, res) => {
  try {
    const users = await Users.find({
      type: 'user',
    })
    res.json(
      users.map(
        ({
          _id,
          name,
          lastName,
          email,
          phone,
          address,
          type,
          approved,
          passportURL,
          avatar,
          amount
        }) => {
          return {
            id: _id,
            name,
            lastName,
            email,
            phone,
            address,
            type,
            approved,
            passportURL,
            avatar,
            amount
          }
        }
      )
    )
  } catch (err) {
    return res
      .status(500)
      .send({ message: 'Something went wron try later', err })
  }
}

exports.getUserById = async (req, res) => {
  const { id: _id } = req.params
  try {
    const {
      _id,
      name,
      lastName,
      email,
      phone,
      address,
      type,
      approved,
      passportURL,
      avatar,
      amount
    } = await Users.findOne({
      _id,
    })
    res.json({
      id: _id,
      name,
      lastName,
      email,
      phone,
      address,
      type,
      approved,
      passportURL,
      avatar,
      amount
    })
  } catch (err) {
    return res
      .status(500)
      .send({ message: 'Something went wron try later', err })
  }
}

exports.createUser = (req, res) => {
  console.log(req.body)
  Company.find({
    email: req.body.email,
  }).then(company => {
    if (company.length >= 1) {
      return res.status(409).json({
        message: 'Mail exists',
      })
    } else {
      bcrypt.hash(req.body.password, 10, (err, hash) => {
        if (err) {
          return status(500).json({
            error: err,
          })
        } else {
          const user = new Users({
            ...req.body,
            type: 'user',
            password: hash,
          })

          user.save(function(err, user) {
            if (err) {
              return res.status(500).json(err)
            }
            sendEmail.sendInfoSignUp(user)
            sendEmail.sendWaitEmailForReceiver(user)
            res.status(201).json({
              message: 'Deliverer created',
            })
          })
        }
      })
    }
  })
}

exports.delUser = async (req, res) => {
  const _id = req.params.id
  try {
    await Users.findByIdAndRemove({
      _id,
    })
    res.status(201).send({
      message: 'Deliverer deleted',
    })
  } catch (err) {
    return res
      .status(500)
      .send({ message: 'Something went wron try later', err })
  }
}

exports.updateUser = async (req, res) => {
  const _id = req.params.id
  try {
    const user = await Users.findByIdAndUpdate(
      _id,
      {
        ...req.body,
      },
      {
        new: true,
      }
    )
    if (user.approved === 'accepted') {
      sendEmail.sendAcceptEmail(user)
    } else if (user.approved === 'declined') {
      sendEmail.sendDeclineEmail(user)
    }
    res.status(201).send({
      id: user._id,
      name: user.name,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
      address: user.address,
      approved: user.approved,
      passportURL: user.passportURL,
      avatar: user.avatar,
      amount:user.amount,
    })
  } catch (err) {
    return res
      .status(500)
      .send({ message: 'Something went wron try later', err })
  }
}
