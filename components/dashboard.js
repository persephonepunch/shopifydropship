import { useEffect, useState } from 'react'
import axios from 'axios'
import { Formik } from 'formik'
import get from 'lodash/get'
import * as Yup from 'yup'
import ApiKeysTable from '../components/api-keys-table'
import Loading from '../components/loading-animation'

export default function Dashboard() {
  const [teams, setTeams] = useState({ loading: true })
  const [apiKeys, setApiKeys] = useState({ loading: true })
  const [selectedTeam, setSelectedTeam] = useState(null)

  
  // Fetch teams
  useEffect(() => {
    // Get access_token from query string
    const accessToken = window.location.search.match(/access_token=([^&]+)/)
    let outsetaAccessToken
    if(accessToken){
      outsetaAccessToken = accessToken[1]
    }
    else{
      outsetaAccessToken = window.Outseta ? window.Outseta.getAccessToken() : ``
    }
    axios.get('/api/teams', {
      headers: {
        'Authorization': `Bearer ${outsetaAccessToken}`
      },
    }).then(res => {
      setTeams({
        data: res.data,
      })
      setSelectedTeam(get(res.data, `0.Uid`))
    }).catch(err => {
      console.error(err)
      setTeams({
        error: err,
      })
    })
  }, [])


  // Fetch API keys for selected team
  useEffect(() => {
    if (selectedTeam) {
      const outsetaAccessToken = window.Outseta ? window.Outseta.getAccessToken() : ``
      axios.get(`/api/api-keys/${selectedTeam}`, {
        headers: {
          'Authorization': `Bearer ${outsetaAccessToken}`
        },
      }).then(res => {
        setApiKeys({
          data: res.data,
        })
      }).catch(err => {
        console.error(err)
        setApiKeys({
          error: err,
        })
      })
    }
  }, [selectedTeam])

  

  if(teams.loading || apiKeys.loading) {
    return (
      <Loading />
    )
  }


  
  return <>
    <div style={styles.teamSelector}>
      <label>
        <span style={styles.label}>Team:</span>
        <select
          onChange={e => {
            setSelectedTeam(e.target.value)
          }}
          value={selectedTeam}
          name="team"
          style={styles.input}
        >
          {teams.data.map(team => (
            <option key={team.Uid} value={team.Uid}>{team.Name}</option>
          ))}
        </select>
      </label>
    </div>

    <ApiKeysTable apiKeys={apiKeys} />

    <div style={styles.newKeyForm}>
      <h3 style={styles.newKeyHeader}>Create New Key</h3>
      <Formik
        initialValues={{
          keyName: ``,
        }}
        validationSchema={Yup.object().shape({
          keyName: Yup.string().required('Key name is required'),
        })}
        onSubmit={async (values, actions) => {
          const outsetaAccessToken = window.Outseta ? window.Outseta.getAccessToken() : ``
          axios.post(`/api/create-api-key`, {
            name: values.keyName,
            team: selectedTeam,
          }, {
            headers: {
              'Authorization': `Bearer ${outsetaAccessToken}`,
            },
          }).then(() => {
            window.location = window.location.href
          }).catch(err => {
            console.error(err)
            actions.setSubmitting(false)
            actions.setErrors({
              form: err.response.data.error || err,
            })
          })
        }}
      >
        {({
          values,
          handleChange,
          handleBlur,
          handleSubmit,
          isSubmitting,
          errors,
        }) => <>
          <form onSubmit={handleSubmit}>
            {/* Display Error */}
            {errors.form && <div style={styles.error}>{errors.form}</div>}

            <label>
              <span style={styles.label}>Name:</span>
              <input
                type="text"
                name="keyName"
                onChange={handleChange}
                onBlur={handleBlur}
                value={values.keyName}
                style={styles.input}
              />
            </label>
            <button
              type="submit"
              className='button-navigation'
              disabled={isSubmitting || !values.keyName}
              style={{
                ...styles.button,
                ...(isSubmitting || !values.keyName) ? styles.disabledButton : {},
              }}
            >
              Add Key
            </button>
          </form>

        </>}
      </Formik>
    </div>


  </>
}


const styles = {
  teamSelector: {
    marginTop: 30,
  },
  newKeyForm: {
    marginTop: 60,
  },
  newKeyHeader: {
    marginBottom: 20,
  },
  error: {
    border: `1px solid red`,
    padding: 10,
    marginTop: 10,
    marginBottom: 10,
    backgroundColor: `#fdd`,
    color: `red`,
    display: `inline-block`,
  },
  input: {
    background: `transparent`,
    padding: 5,
    outline: `none`,
    borderRight: 0,
    borderTop: 0,
    borderLeft: 0,
    borderBottom: `2px solid #aaa`,
  },
  label: {
    marginRight: 10,
  },
  button: {
    marginTop: 30,
  },
  disabledButton: {
    opacity: 0.5,
    pointerEvents: `none`,
  },
}