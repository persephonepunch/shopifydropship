import axios from 'axios'
import get from 'lodash/get'
import outsetaClient from '../../helpers/outseta-client'
import db from '../../helpers/firebase-client'

const outsetaKey = `Outseta ${process.env.OUTSETA_API_KEY}:${process.env.OUTSETA_SECRET_KEY}`
const apiKeysDb = db.collection('apiKeys')

export default async function handler(req, res) {
	try {
		const apiKey = req.body.apiKey

		if (!apiKey) {
			throw new Error('No apiKey provided')
		}

		// Query key from database
		const keyRes = await apiKeysDb.where('key', '==', apiKey).limit(1).get()
		let keyData
		let keyId
		keyRes.forEach(doc => {
			keyId = doc.ref.path.replace('apiKeys/', '')
			keyData = doc.data()
		})
		if(!keyData){
			throw new Error(`API key "${apiKey}" not found"`)
		}

		const teamId = keyData.team


		const client = await outsetaClient(req)

		// Get Outseta user information
		const [outsetaProfile] = await Promise.all([
			client.user.profile.get(),
			axios.get(`https://${process.env.NEXT_PUBLIC_OUTSETA_SUBDOMAIN}.outseta.com/api/v1/crm/accounts/${teamId}?fields=CurrentSubscription.Plan.Uid,AccountStage`, {
				headers: {
					'Authorization': outsetaKey,
				},
			})
		]).catch(err => { throw err })
		const userId = outsetaProfile.Uid




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

		// Delete key from database
		await apiKeysDb.doc(keyId).delete()
			.catch(err => { throw err })


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
