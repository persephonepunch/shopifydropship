import axios from 'axios'
import get from 'lodash/get'
import outsetaClient from '../../helpers/outseta-client'
import db from '../../helpers/firebase-client'
import { v4 as uuidv4 } from 'uuid'

const outsetaKey = `Outseta ${process.env.OUTSETA_API_KEY}:${process.env.OUTSETA_SECRET_KEY}`
const apiKeysDb = db.collection('apiKeys')

export default async function handler(req, res) {
	try {
		const teamId = req.body.team
    const name = req.body.name

		const client = await outsetaClient(req)

		// Get Outseta user information
		// Get Outseta team information
		// In parallel for better performance
		const [outsetaProfile, accountRes] = await Promise.all([
			client.user.profile.get(),
			axios.get(`https://${process.env.NEXT_PUBLIC_OUTSETA_SUBDOMAIN}.outseta.com/api/v1/crm/accounts/${teamId}?fields=CurrentSubscription.Plan.Uid,AccountStage`, {
				headers: {
					'Authorization': outsetaKey,
				},
			})
		]).catch(err => { throw err })
		const userId = outsetaProfile.Uid



		// Get subscription
		const accountData = accountRes.data
		const stage = accountData.AccountStage

		// If account expired or payment failed and is past due, throw
		// https://go.outseta.com/support/kb/articles/Kj9boWnd/how-billing-stages-are-defined
		if(stage >= 5){
			throw new Error(`Account expired or payment failed and is past due.`)
		}

		// Get Outseta teams user has access to
		const peopleRes = await axios.get(`https://${process.env.NEXT_PUBLIC_OUTSETA_SUBDOMAIN}.outseta.com/api/v1/crm/people/${userId}?fields=PersonAccount.Account.Uid,PersonAccount.Account.Name`, {
			headers: {
			'Authorization': outsetaKey,
			},
		}).catch(err => { throw err })
		const accounts = get(peopleRes, 'data.PersonAccount', []).map(account => account.Account)
		console.log(`accounts`, accounts)

		// Make sure user has access to team
		let hasAccessToTeam = false
		for(let account of accounts){
			if(teamId == account.Uid){
				hasAccessToTeam = true
				break
			}
		}
		if(!hasAccessToTeam){
			throw new Error(`User does not have access to team.`)
		}

		const key = uuidv4()
		const apiKeyData = {
			name,
			key,
			team: teamId,
		}

    
		const apiKeyRef = apiKeysDb.doc()
		await apiKeyRef.set(apiKeyData)
		console.log(`Created new key in Firestore`)


		res.status(200).json({
			body: `Success`,
		})
	}
	catch (err) {
		const apiError = get(err, `err.response`)
		if(apiError){
			console.error(apiError)
		}
		else{
			console.log(`No API error`)
			console.error(err)

		}
		res.status(500).json({
			error: err.message
		})
	}
}
