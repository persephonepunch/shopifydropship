import OutsetaApiClient from 'outseta-api-client'
import fetch from 'node-fetch'
import get from 'lodash/get'

global.fetch = fetch

export default async function outsetaClient(req){
  const outsetaUserId = typeof req === `string` ? req : process.env.NEXT_PUBLIC_OUTSETA_USER_ID

  // If logging in as user with their email
  let outsetaCreds
  if(outsetaUserId){
    outsetaCreds = {
      subdomain: process.env.NEXT_PUBLIC_OUTSETA_SUBDOMAIN,
      apiKey: process.env.OUTSETA_API_KEY,
      secretKey: process.env.OUTSETA_SECRET_KEY,
    }
  }
  // If logging in as user with their auth token
  else{
    const headers = req.headers || {}
    let userToken = headers.Authorization || headers.authorization
    if(!userToken) {
      console.log(`Getting token from body...`)
      get(req, `body.outsetaAccessToken`)
    }
    userToken = userToken.replace(`Bearer `, ``)
    outsetaCreds = {
      subdomain: process.env.NEXT_PUBLIC_OUTSETA_SUBDOMAIN,
      accessToken: userToken,
    }
  }

  const client = new OutsetaApiClient(outsetaCreds)

  if(outsetaUserId){
    await client.user.impersonate(outsetaUserId)
  }

  return client
}