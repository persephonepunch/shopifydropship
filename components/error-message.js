import Icon from '@meronex/icons/bi/BiErrorCircle'

export default function ErrorMessage(props) {
  return <>
    <div className="error-message">
      <span className='icon-container'>
        <Icon size={30} />
      </span>
      <span className='message-container'>{props.children}</span>
    </div>
    <style jsx>{`
      .error-message {
        position: relative;
        align-items: center;
        justify-content: center;
        padding: 1em;
        border: 1px solid #f00;
        margin-top: 30px;
        background: #fdd;
        color: #f00;
      }
      .icon-container {
        position: absolute;
        top: 50%;
        left: 10px;
        transform: translateY(-50%);
        margin-top: 2px;
      }
      .message-container {
        margin-left: 50px;
      }

    `}</style>
  </>
}