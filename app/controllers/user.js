const validator = require('node-validator')

const UserSchema = require ('../models/user.js')
const userModel = require('../models/user.js')

/**
 * User
 * @Class
 * {Object} app - express context
 */
class User {
  constructor(app, connect) {
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
      .withRequired('name', validator.isString())
      .withRequired('age', validator.isNumber())

    this.app.post('/user/create', validator.express(check), (req, res) => {
      try {
        const userSchema = new this.UserSchema(req.body)

        userSchema.save().then(user => {
          res.status(200).json(user)
        }).catch(err => {
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
        }).catch(err => {
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
      .withOptional('age_max', validator.isNumber())
      .withOptional('age_min', validator.isNumber())
      .withOptional('limit', validator.isNumber())
      .withOptional('sort', validator.isNumber())

    this.app.post('/users/search', validator.express(check), (req, res) => {
      try {
        const filters = []

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
      .withOptional('name', validator.isString())
      .withOptional('age', validator.isNumber())

    this.app.put('/user/update/:id', validator.express(check), (req, res) => {
      try {
        this.UserSchema.findByIdAndUpdate(req.params.id, req.body, {new: true})
          .then(user => {
            res.status(200).json(user)
          }).catch(err => {
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