import { useCopyToClipboard } from "react-use-copy-to-clipboard"
import CopyIcon from '@meronex/icons/fa/FaCopy'
import CheckIcon from '@meronex/icons/fa/FaCheck'

const iconSize = 18

export default function CopyButton(props) {
  const [copied, setCopied] = useState(false)
  const copyRef = useCopyToClipboard(props.text,
    () => {
      setCopied(true)
      setTimeout(() => {
        setCopied(false)
      }, 3 * 1000)
    },
    () => {
      console.error("Unable to copy!")
    })
  
  return (
    <button
      className='icon copyIcon'
      title={props.title}
      type='button'
      ref={copyRef}
    >
      {copied ? (
        <CheckIcon size={iconSize} />
      ) : (
        <CopyIcon size={iconSize} />
      )}
      <style jsx>{`
        .copyIcon{
          border: 0;
          background: transparent;
          width: 30px;
          height: 30px;
          opacity: .6;
        }
        .copyIcon:hover{
          opacity: .9;
        }
      `}</style>
    </button>
  )
}