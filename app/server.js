const express = require('express')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
const cors = require('cors')

const routes = require('./routes.js')

/**
 * Server
 * @class
 */
class Server {
  constructor () {
    this.app = express()
  }

  /**
   * DbConnect
   */
  dbConnect () {
    const host = 'mongodb://localhost:27017/api-2020-v2'
    const connect = mongoose.createConnection(host)

    connect.on('error', (err) => {
      setTimeout(() => {
        this.connect = this.dbConnect(host)
      }, 5000)

      console.log(`[ERROR] api dbConnect() -> ${err}`)
    })

    connect.on('disconnected', () => {
      setTimeout(() => {
        this.connect = this.dbConnect(host)
      }, 5000)

      console.log('[DISCONNECTED] api dbConnect()')
    })

    process.on('SIGINT', () => {
      connect.close(() => {
        console.log('[API END PROCESS] api dbConnect() -> close mongodb connection')
        process.exit(0)
      })
    })

    return connect
  }

  /**
   * Middleware
   */
  middleware () {
    this.app.use(cors())
    this.app.use(bodyParser.json())
    this.app.use(bodyParser.urlencoded({
      extended: true
    }))
  }

  /**
   * Routes
   */
  routes () {
    new routes.User(this.app, this.connect)

    this.app.use((req, res) => {
      res.status(404).json({
        code: 404,
        message: 'Not Found'
      })
    })
  }

  /**
   * Run
   */
  run () {
    try {
      this.connect = this.dbConnect()
      this.middleware()
      this.routes()
      this.app.listen(3000)
    } catch (err) {
      console.error(`[ERROR] Server -> ${err}`)
    }
  }
}

module.exports = Server
