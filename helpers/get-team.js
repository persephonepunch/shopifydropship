import db from 'helpers/firebase-client'

const teamsDb = db.collection('teams')

export default async function getOrCreateTeam(teamDocId, teamData){
  console.log(`getOrCreateTeam`, teamDocId, teamData)
  const ref = teamsDb.doc(teamDocId)

  // Try to get document
  const teamRes = await ref.get()
    .catch(err => {
      console.error(`Error getting team: ${err}`)
      throw err
    })
  let data = teamRes.data()

  console.log(`Get team data:`, data)

  // Create if document doesn't exist
  if(!data){
    data = teamData || { buildMinutes: 0 }
    console.log(`Creating team document...`)
    await ref.set(data)
      .catch(err => {
        console.error(`Error creating team: ${err}`)
        throw err
      })
  }
  else{
    console.log(`Found team`)
  }

  return data
}