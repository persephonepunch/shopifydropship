import admin from 'firebase-admin'

let app
if(!admin.apps.length){
	console.log(`Initializing Firebase`)
	const firebaseCreds = JSON.parse(process.env.FIREBASE_CREDENTIALS)
	app = admin.initializeApp({
		credential: admin.credential.cert({
			...firebaseCreds,
			databaseUrl: `https://${firebaseCreds.projectId}.firebaseio.com`,
		}),
	})
}
else{
	console.log(`Firebase already initialized`)
}

const db = admin.firestore()

module.exports = db