import get from 'lodash/get'
import axios from 'axios'
import db from '../../helpers/firebase-client'
import getPlanData from '../../helpers/get-plan-data'

const apiKeysDb = db.collection('apiKeys')
const teamsDb = db.collection(`teams`)
const outsetaKey = `Outseta ${process.env.OUTSETA_API_KEY}:${process.env.OUTSETA_SECRET_KEY}`

export default async function handler(req, res) {
	try {
		const apiKey = req.body.apiKey

		if (!apiKey) {
			throw new Error('No apiKey provided')
		}

		// Query key from database
		const keyRes = await apiKeysDb.where('key', '==', apiKey).limit(1).get().catch(err => {
			throw new Error(`API key "${apiKey}" not found"`)
		})
		let keyData
		keyRes.forEach(doc => {
			keyData = doc.data()
		})
		if(!keyData){
			throw new Error(`API key "${apiKey}" not found"`)
		}



		// Try to get team document from database
		const ref = teamsDb.doc(keyData.team)
		const teamRes = await ref.get()
			.catch(err => {
				console.error(`Error getting team: ${err}`)
				throw err
			})
		let teamData = teamRes.data()
		console.log(`Get team data:`, teamData)
		// Create if document doesn't exist
		if(!teamData){
			teamData = { usage: 0 }
			console.log(`Creating team document...`)
			await ref.set(teamData)
				.catch(err => {
					console.error(`Error creating team: ${err}`)
					throw err
				})
		}
		else{
			console.log(`Found team`)
		}


		// Get subscription
		const accountRes = await axios.get(`https://${process.env.NEXT_PUBLIC_OUTSETA_SUBDOMAIN}.outseta.com/api/v1/crm/accounts/${keyData.team}?fields=CurrentSubscription.Plan.Uid,CurrentSubscription.SubscriptionAddOns.*,CurrentSubscription.SubscriptionAddOns.AddOn.*,AccountStage`, {
			headers: {
				'Authorization': outsetaKey,
			},
		})
		const accountData = accountRes.data
		console.log(`accountData`, JSON.stringify(accountData, null, 3))
		const currentSubscription = get(accountData, `CurrentSubscription.Plan.Uid`)
		const stage = accountData.AccountStage
		const planData = getPlanData(currentSubscription)
		console.log(`planData`, planData)

		let allowedUsage = planData.usage

		// Check add-on usage
		if(planData.usageAddon){
			const addOnUid = get(planData, `usageAddon.uid`)
			const addOnData = get(accountRes, `data.CurrentSubscription.SubscriptionAddOns`, []).find(item => {
				return item.AddOn.Uid === addOnUid
			})
			console.log(`addOnData`, addOnData)
			// Connection Uid in addOnData.Uid
			if(addOnData && addOnData.Quantity){
				const inc = (addOnData.Quantity * planData.usageAddon.qty)
				console.log(`inc`, inc)
				allowedUsage += inc
			}
		}

		console.log(`allowedUsage`, allowedUsage)



		// If account expired or payment failed and is past due, throw
		// https://go.outseta.com/support/kb/articles/Kj9boWnd/how-billing-stages-are-defined
		if(stage >= 5){
			throw new Error(`Account expired or payment failed and is past due.`)
		}

		if(teamData.usage >= allowedUsage){
			throw new Error(`Usage exceeded for current plan. Please add more usage from the dashboard or upgrade your plan.`)
		}





		teamData.usage = (teamData.usage || 0) + 1

		// Update database
		await ref.update(teamData)
			.catch(err => {
				console.error(`Error updating team: ${err}`)
				throw err
			})


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
