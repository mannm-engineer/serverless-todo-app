import { APIGatewayProxyEvent } from 'aws-lambda'
import { decode } from 'jsonwebtoken'

import { JwtPayload } from './JwtPayload'

/**
 * Get a user id from an API Gateway event
 * @param event an event from API Gateway
 *
 * @returns a user id from a JWT token
 */
export function getUserId(event: APIGatewayProxyEvent): string {
  const jwtToken = getToken(event)

  return parseUserId(jwtToken)
}

/**
 * Get JWT token from an API Gateway event
 * @param event an event from API Gateway
 * @returns JWT token string
 */
function getToken(event: APIGatewayProxyEvent): string {
  const authorization = event.headers.Authorization
  const split = authorization.split(' ')
  const jwtToken = split[1]

  return jwtToken
}

/**
 * Parse a JWT token and return a user id
 * @param jwtToken JWT token to parse
 * @returns a user id from the JWT token
 */
function parseUserId(jwtToken: string): string {
  const decodedJwt = decode(jwtToken) as JwtPayload
  return decodedJwt.sub
}
