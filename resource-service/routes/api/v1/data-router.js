/**
 * API version 1 routes.
 *
 * @author Elida Arrechea
 * @version 1.0.0
 */

import express from 'express'
import createError from 'http-errors'
import { DataController } from '../../../controllers/api/data-controller.js'
import { AccountController } from '../../../../auth-service/controllers/api/account-controller.js'
import jwt from 'jsonwebtoken'

export const router = express.Router()
const controllerAuth = new AccountController()
const controller = new DataController()

// ------------------------------------------------------------------------------
//  Helpers
// ------------------------------------------------------------------------------

const PermissionLevels = Object.freeze({
  READ: 1,
  CREATE: 2,
  UPDATE: 4,
  DELETE: 8
})

/**
 * Authenticates requests.
 *
 * If authentication is successful, `req.user`is populated and the
 * request is authorized to continue.
 * If authentication fails, an unauthorized response will be sent.
 *
 * @param {object} req - Express request object.
 * @param {object} res - Express response object.
 * @param {Function} next - Express next middleware function.
 */
const authenticateJWT = (req, res, next) => {
  const authorization = req.headers.authorization?.split(' ')
  if (authorization?.[0] !== 'Bearer') {
    next(createError(401))
    return
  }

  try {
    const payload = jwt.verify(authorization[1], process.env.PERSONAL_ACCESS_TOKEN, {
      algorithm: 'HS256' // 'RS256'
    })
    req.user = {
      username: payload.username,
      email: payload.email,
      permissionLevel: payload.permissionLevel
    }
    next()
  } catch (err) {
    next(createError(403))
  }
}

/**
 * Authorize requests.
 *
 * If authorization is successful, that is the user is granted access
 * to the requested resource, the request is authorized to continue.
 * If authentication fails, a forbidden response will be sent.
 *
 * @param {object} req - Express request object.
 * @param {object} res - Express response object.
 * @param {Function} next - Express next middleware function.
 * @param {number} permissionLevel - ...
 */
const hasPermission = (req, res, next, permissionLevel) => {
  req.user?.permissionLevel & permissionLevel ? next() : next(createError(403))
}

// ------------------------------------------------------------------------------
//  Routes
// ------------------------------------------------------------------------------

// Provide req.data to the route if :username is present in the route path.
//router.param('username', (req, res, next, username) => controller.loadData(req, res, next, username))

// Provide req.data to the route if :id is present in the route path.
router.param('id', (req, res, next, id) => controller.loadData(req, res, next, id))

// GET entry point for API.
router.get('/', (req, res, next) => controller.getEntry(req, res, next))

// Provide req.data to the route if :id is present in the route path.
router.param('id', (req, res, next, id) => controller.loadData(req, res, next, id))

// Map HTTP verbs and route paths to controller actions.

// Get all users
router.get('/users', (req, res, next) => controllerAuth.getUsers(req, res, next))


// Login user
router.post('/users/login', (req, res, next) => controllerAuth.login(req, res, next))

// Register new user
router.post('/users/register', (req, res, next) => controllerAuth.register(req, res, next))


// GET all fishes from all users.
router.get('/users/catches/all',
  authenticateJWT,
  (req, res, next) => hasPermission(req, res, next, PermissionLevels.DELETE),
  (req, res, next) => controller.getAll(req, res, next)
)

// POST add a catch for one user
router.post('/users/catches',
  authenticateJWT,
  (req, res, next) => hasPermission(req, res, next, PermissionLevels.DELETE),
  (req, res, next) => controller.addCatch(req, res, next))

// GET all catches from the logged in user
router.get('/users/catches',
  authenticateJWT,
  (req, res, next) => hasPermission(req, res, next, PermissionLevels.DELETE),
  (req, res, next) => controller.getCatches(req, res, next))

// GET /:id specific catch from logged in user 
router.get('/users/catches/:id',
  authenticateJWT,
  (req, res, next) => hasPermission(req, res, next, PermissionLevels.DELETE),
  (req, res, next) => controller.getCatch(req, res, next))

// GET catch with specific parameters from the logged in user
router.get('/users/catches/fish/details',
  authenticateJWT,
  (req, res, next) => hasPermission(req, res, next, PermissionLevels.DELETE),
  (req, res, next) => controller.getParam(req, res, next))

// PUT data/:id
router.put('/users/catches/:id',
  authenticateJWT,
  (req, res, next) => hasPermission(req, res, next, PermissionLevels.DELETE),
  (req, res, next) => controller.update(req, res, next))

// DELETE data/:id
router.delete('/users/catches/:id',
  authenticateJWT,
  (req, res, next) => hasPermission(req, res, next, PermissionLevels.DELETE),
  (req, res, next) => controller.delete(req, res, next)
)
