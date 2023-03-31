import crypto from 'crypto'
import JWT from 'jsonwebtoken'

const JWT_secret = crypto.randomBytes(256).toString('base64')

export const createTokens = username => { return JWT.sign({ username: username }, JWT_secret) }
