import axios from 'axios'
import get from 'lodash/get'
import outsetaClient from '../../helpers/outseta-client'


const outsetaKey = `Outseta ${process.env.OUTSETA_API_KEY}:${process.env.OUTSETA_SECRET_KEY}`

export default async function handler(req, res) {
	try {

		const client = await outsetaClient(req)

		// Get Outseta user information
		const outsetaProfile = await client.user.profile.get()

		// Get accounts
		const peopleRes = await axios.get(`https://${process.env.NEXT_PUBLIC_OUTSETA_SUBDOMAIN}.outseta.com/api/v1/crm/people/${outsetaProfile.Uid}?fields=PersonAccount.Account.Uid,PersonAccount.Account.Name`, {
			headers: {
				'Authorization': outsetaKey,
			},
		})
		const accounts = get(peopleRes, 'data.PersonAccount', []).map(account => account.Account)

		res.status(200).json(accounts)

		return

	}
	catch (err) {
		console.log(`Error!`)
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
