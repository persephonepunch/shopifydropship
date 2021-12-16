import { useState } from 'react'
import EditIcon from '@meronex/icons/fa/FaEdit'
import DeleteIcon from '@meronex/icons/fa/FaTrash'
import CopyIcon from '@meronex/icons/fa/FaCopy'
import CheckIcon from '@meronex/icons/fa/FaCheck'
import axios from 'axios'
import get from 'lodash/get'
import ErrorMessage from './error-message'
import { useCopyToClipboard } from "react-use-copy-to-clipboard"

const purple = `#D000FE`

function CopyButton(props){
  console.log(`props.key`, props.apiKey)
  const [copied, setCopied] = useState(false)
  const clickRef = useCopyToClipboard(props.apiKey,
    () => {
      console.log("Copied!")
      setCopied(true)
      setTimeout(() => {
        setCopied(false)
      }, 3 * 1000)
    },
    () => {
      console.error("Unable to copy!")
    })



  return <>
    <button
      className='icon copyIcon'
      title='Copy API Key'
      type='button'
      ref={clickRef}
    >
      {copied ? (
        <CheckIcon />
      ) : (
        <CopyIcon />
      )}
    </button>
    <style jsx>{`
      .icon{
        float: right;
        background: transparent;
        outline: none;
        border: 0;
        position: relative;
        top: 2px;
      }
      .copyIcon{
        float: none;
        margin-left: 10px;
      }
    `}</style>
  </>
}

export default function Dashboard(props) {
  const { apiKeys } = props
  const [deletingKey, setDeletingKey] = useState(false)
  const [updatingKey, setUpdatingKey] = useState(false)
  const [errorMessage, setErrorMessage] = useState(false)
  
  async function deleteKey(apiKey){
    setDeletingKey(apiKey)
    const outsetaAccessToken = window.Outseta ? window.Outseta.getAccessToken() : ``
    axios.post(`/api/delete-api-key`, {
      apiKey,
    }, {
      headers: {
        'Authorization': `Bearer ${outsetaAccessToken}`,
      },
    }).then(() => {
      window.location = window.location.href
    }).catch(err => {
      setErrorMessage(get(err, `response.data.error`, `Something went wrong. Could not delete key.`))
    })
  }

  async function updateKey(name, apiKey){
    setUpdatingKey(apiKey)
    const outsetaAccessToken = window.Outseta ? window.Outseta.getAccessToken() : ``
    axios.post(`/api/update-api-key`, {
      apiKey: apiKey,
      name,
    }, {
      headers: {
        'Authorization': `Bearer ${outsetaAccessToken}`,
      },
    }).then(() => {
      window.location = window.location.href
    }).catch(err => {
      setErrorMessage(get(err, `response.data.error`, `Something went wrong. Could not update key.`))
    })
  }

  return <>

    {errorMessage && (
      <ErrorMessage>{errorMessage}</ErrorMessage>
    )}
  
    {(apiKeys.data && apiKeys.data.length) ? (
      <table className='table'>
        <thead>
          <tr>
            <th className='firstTh'>Name</th>
            <th>API Key</th>
          </tr>
        </thead>
        <tbody>
          {apiKeys.data.map(key => (
            <tr key={key.key}>
              <td className='keyName cell'>
                {key.name}
                <button
                  className='icon'
                  title='Edit Key Name'
                  type='button'
                  disabled={updatingKey === key.key}
                  style={{
                    opacity: updatingKey === key.key ? 0.5 : 1,
                  }}
                  onClick={() => {
                    const newName = window.prompt(`Key Name:`, key.name)
                    if(newName){
                      updateKey(newName, key.key)
                    }
                  }}
                >
                  <EditIcon />
                </button>
              </td>
              <td className='cell'>
                {key.key}
                <CopyButton apiKey={key.key} />
                <button
                  className='icon'
                  title='Delete API Key'
                  type='button'
                  disabled={deletingKey === key.key}
                  style={{
                    opacity: deletingKey === key.key ? 0.5 : 1,
                  }}
                  onClick={() => {
                    const confirmed = window.confirm(`Are you sure you want to delete the API key "${key.name}"? This action can't be undone.`)
                    if(confirmed) {
                      deleteKey(key.key)
                    }
                  }}
                >
                  <DeleteIcon />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>


    ) : (
      <div className='noKeysMessage'>No API keys found</div>
    )}

    <style jsx>{`
      table {
        width: 100%;
        border: 1px solid #999;
      }
      .firstTh{
        border-right: 1px solid #999;
      }
      th{
        background: #eee;
        color: #000;
      }
      th, td {
        padding: 0.5rem;
        text-align: left;
      }
      .keyName{
        border-right: 1px solid #999;
      }
      .cell{
        position: relative;
      }
      .icon{
        float: right;
        background: transparent;
        outline: none;
        border: 0;
        position: relative;
        top: 2px;
      }
      .icon:hover{
        color: ${purple};
      }
      .noKeysMessage{
        text-align: center;
        padding: 1rem;
        font-size: 1.2em;
        margin-top: 30px;
      }
    `}</style>

  </>
}
