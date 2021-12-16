import axios from 'axios'
import get from 'lodash/get'
import outsetaClient from '../../../helpers/outseta-client'
import db from '../../../helpers/firebase-client'

const outsetaKey = `Outseta ${process.env.OUTSETA_API_KEY}:${process.env.OUTSETA_SECRET_KEY}`
const apiKeysDb = db.collection('apiKeys')

export default async function handler(req, res) {
	try {
		const teamId = req.query.team

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
		// const userId = outsetaProfile.Uid



		// Get subscription
		const accountData = accountRes.data
		const stage = accountData.AccountStage

		// If account expired or payment failed and is past due, throw
		// https://go.outseta.com/support/kb/articles/Kj9boWnd/how-billing-stages-are-defined
		if(stage >= 5){
			throw new Error(`Account expired or payment failed and is past due.`)
		}
		

		// Get accounts
		const [peopleRes] = await Promise.all([
			axios.get(`https://${process.env.NEXT_PUBLIC_OUTSETA_SUBDOMAIN}.outseta.com/api/v1/crm/people/${outsetaProfile.Uid}?fields=PersonAccount.Account.Uid,PersonAccount.Account.Name,PersonAccount.Account`, {
				headers: {
					'Authorization': outsetaKey,
				},
			}),
		]).catch(err => {
			console.error(err)
			throw err
		})


		const accounts = get(peopleRes, 'data.PersonAccount', []).map(account => account.Account)

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

		// Get websites in Firestore
		const keysRes = await apiKeysDb.where('team', '==', teamId).get()
		const keys = []
		keysRes.forEach(doc => {
			keys.push(doc.data())
		})


		res.status(200).json(keys)
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
