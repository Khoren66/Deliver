const jwr = require('jsonwebtoken')

module.exports = (req, res, next) => {
  try {
    const token = req.headers.auth
    const decoded = jwt.verify(token, process.env.JWR_KEY)
    req.userData = decoded
    next()
  } catch (err) {
    return res.status(401).json({
      message: 'Auth failed',
    })
  }
}
