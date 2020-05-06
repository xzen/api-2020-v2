const validator = require('node-validator')

const UserSchema = require('../models/user.js')

/**
 * User
 * @Class
 * {Object} app - express context
 */
class User {
  constructor (app, connect) {
    this.app = app
    this.UserSchema = connect.model('User', UserSchema)

    this.create()
    this.delete()
    this.search()
    this.show()
    this.update()
  }

  /**
   * Create
   */
  create () {
    const check = validator.isObject()
      .withRequired('firstName', validator.isString())
      .withRequired('lastName', validator.isString())
      .withRequired('gender', validator.isString())
      .withRequired('age', validator.isNumber())
      .withRequired('adressNumber', validator.isNumber())
      .withRequired('adressType', validator.isString())
      .withRequired('adressName', validator.isString())
      .withRequired('cityCode', validator.isString())
      .withRequired('cityName', validator.isString())

    this.app.post('/user/create', validator.express(check), (req, res) => {
      try {
        const userSchema = new this.UserSchema(req.body)

        userSchema.save().then(user => {
          res.status(200).json(user)
        }).catch(() => {
          res.status(500).json({
            code: 500,
            message: 'Internal Server Error'
          })
        })
      } catch (err) {
        res.status(500).json({
          code: 500,
          message: 'Internal Server Error'
        })
      }
    })
  }

  /**
   * Delete
   */
  delete () {
    this.app.delete('/user/delete/:id', (req, res) => {
      try {
        this.UserSchema.findByIdAndDelete(req.params.id).then(user => {
          res.status(200).json(user)
        }).catch(() => {
          res.status(500).json({
            code: 500,
            message: 'Internal Server Error'
          })
        })
      } catch (err) {
        res.status(500).json({
          code: 500,
          message: 'Internal Server Error'
        })
      }
    })
  }

  /**
   * Search
   */
  search () {
    const check = validator.isObject()
      .withOptional('firstName', validator.isString())
      .withOptional('gender', validator.isString())
      .withOptional('age_max', validator.isNumber())
      .withOptional('age_min', validator.isNumber())
      .withOptional('limit', validator.isNumber())
      .withOptional('sort', validator.isNumber())

    this.app.post('/users/search', validator.express(check), (req, res) => {
      try {
        const filters = []

        if (req.body.firstName) {
          filters.push({
            $match: {
              firstName: req.body.firstName
            }
          })
        }

        if (req.body.gender) {
          filters.push({
            $match: {
              gender: req.body.gender
            }
          })
        }

        if (req.body.age_max) {
          filters.push({
            $match: {
              age: {
                $gte: req.body.age_max
              }
            }
          })
        }

        if (req.body.age_min) {
          filters.push({
            $match: {
              age: {
                $lte: req.body.age_min
              }
            }
          })
        }

        if (req.body.sort) {
          filters.push({
            $sort: {
              age: req.body.sort
            }
          })
        }

        filters.push({ $limit: req.body.limit || 10 })

        this.UserSchema.aggregate(filters)
          .then(users => {
            res.status(200).json(users.map(user => {  
              user.id = user._id

              delete user._id

              return user
            }) || [])
          }).catch(err => {
            res.status(500).json({
              code: 500,
              message: err
            })
          })
      } catch (err) {
        res.status(500).json({
          code: 500,
          message: 'Internal Server Error'
        })
      }
    })
  }

  /**
   * Show
   */
  show () {
    this.app.get('/user/show/:id', (req, res) => {
      try {
        this.UserSchema.findById(req.params.id)
          .then(user => {
            res.status(200).json(user || {})
          }).catch(err => {
            res.status(500).json({
              code: 500,
              message: err
            })
          })
      } catch (err) {
        res.status(500).json({
          code: 500,
          message: 'Internal Server Error'
        })
      }
    })
  }

  /**
   * Update
   */
  update () {
    const check = validator.isObject()
      .withOptional('firstName', validator.isString())
      .withOptional('lastName', validator.isString())
      .withOptional('gender', validator.isString())
      .withOptional('age', validator.isNumber())
      .withOptional('adressNumber', validator.isNumber())
      .withOptional('adressType', validator.isString())
      .withOptional('adressName', validator.isString())
      .withOptional('cityCode', validator.isString())
      .withOptional('cityName', validator.isString())

    this.app.put('/user/update/:id', validator.express(check), (req, res) => {
      try {
        this.UserSchema.findByIdAndUpdate(req.params.id, req.body, {new: true})
          .then(user => {
            res.status(200).json(user)
          }).catch(() => {
            res.status(500).json({
              code: 500,
              message: 'Internal Server Error'
            })
          })
      } catch (err) {
        res.status(500).json({
          code: 500,
          message: 'Internal Server Error'
        })
      }
    })
  }
}

module.exports = User
