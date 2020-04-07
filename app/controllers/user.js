const validator = require('node-validator')

const UserSchema = require ('../models/user-mongo.js')
const userModel = require('../models/user.js')

/**
 * User
 * @Class
 * {Object} app - express context
 */
class User {
  constructor(app, connect) {
    this.app = app
    this.userModel = userModel // mock
    this.UserSchema = connect.model('User', UserSchema) // mongodb

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
        const user = this.userModel.find(user => user.id === req.params.id) || {}

        this.userModel = this.userModel.filter( user => user.id != req.params.id)

        res.status(200).json(user)
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
    this.app.post('/users/search', (req, res) => {
      try {

        if (req.body.age_min && req.body.age_max) {
          res.status(200).json(this.userModel.filter(user => user.age >= req.body.age_min && user.age <= req.body.age_max))

          return
        }

        if (req.body.age_min) {
          res.status(200).json(this.userModel.filter(user => user.age <= req.body.age_min))

          return
        }

        if (req.body.age_max) {
          res.status(200).json(this.userModel.filter(user => user.age >= req.body.age_max))

          return
        }

        res.status(200).json([])
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
        res.status(200).json(this.userModel.find(user => user.id === req.params.id) || {})
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
      .withOptional('id', validator.isString())
      .withOptional('name', validator.isString())
      .withOptional('age', validator.isNumber())

    this.app.put('/user/update/:id', validator.express(check), (req, res) => {
      try {
        let user = this.userModel.find(user => user.id === req.params.id) || {}
        this.userModel = this.userModel.filter( user => user.id != req.params.id)
        Object.assign(user, req.body)

        this.userModel.push(user)

        res.status(200).json(user)
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