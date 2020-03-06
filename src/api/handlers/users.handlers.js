const Company = require('../models/company.model')
const Users = require('../models/users.model')
const sendEmail = require('../../services/sendEmail')
const bcrypt = require('bcrypt')

exports.getAllUsers = async (req, res) => {
  try {
    const users = await Users.find({
      type: 'user',
    })
    res.status(200).send(
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
          amount,
          rating,
          createdTime,
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
            amount,
            rating,
            createdTime: Date.parse(createdTime),
          }
        }
      )
    )
  } catch (err) {
    return res.status(500).send({
      message: 'Something went wrong, try later',
      err,
    })
  }
}

exports.getUserById = async (req, res) => {
  const _id = req.params.id
  try {
    const user = await Users.findOne({
      _id,
    })
    res.status(200).send({
      id: user._id,
      name: user.name,
      lastName: user.name,
      email: user.email,
      phone: user.phone,
      address: user.address,
      type: user.type,
      approved: user.approved,
      passportURL: user.passportURL,
      avatar: user.avatar,
      amount: user.amout,
      rating: user.rating,
      createdTime: Date.parse(user.createdTime),
    })
  } catch (err) {
    return res.status(500).send({
      message: 'Something went wrong, try later',
      err,
    })
  }
}

exports.createUser = async (req, res) => {
  try {
    const company = await Company.findOne({
      email: req.body.email.toLowerCase(),
    })
    const user = await Users.findOne({ email: req.body.email.toLowerCase() })
    if (!company && !user) {
      bcrypt.hash(req.body.password, 10, (err, hash) => {
        if (err) {
          return status(500).send({
            message: 'Something went wrong, try later',
            error: err,
          })
        } else {
          const user = new Users({
            ...req.body,
            email: req.body.email.toLowerCase(),
            type: 'user',
            password: hash,
          })

          user.save(function(err, user) {
            if (err) {
              return res
                .status(500)
                .send({ message: 'Something went wrong, try later', err })
            }
            sendEmail.sendInfoSignUp(user)
            sendEmail.sendWaitEmailForReceiver(user)
            res.status(201).send({
              message: 'Deliverer created',
            })
          })
        }
      })
    } else {
      return res.status(406).send({
        message: 'Email already exists',
      })
    }
  } catch (err) {
    return res
      .status(500)
      .send({ message: 'Something went wrong, try later', err })
  }
}

exports.delUser = async (req, res) => {
  const _id = req.params.id
  try {
    await Users.findByIdAndRemove({
      _id,
    })
    res.status(202).send({
      message: 'Deliverer deleted',
    })
  } catch (err) {
    return res.status(500).send({
      message: 'Something went wrong, try later',
      err,
    })
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
      amount: user.amount,
      rating: user.rating,
      createdTime: Date.parse(user.createdTime),
    })
  } catch (err) {
    return res.status(500).send({
      message: 'Something went wrong, try later',
      err,
    })
  }
}
