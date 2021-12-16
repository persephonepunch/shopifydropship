import "react-loader-spinner/dist/loader/css/react-spinner-loader.css"
import Loader from "react-loader-spinner"

const size = 75

export default function LoadingAnimation() {
  return (
    <div className='loadingContainer'>
      <Loader
        type="Oval"
        color="#fff"
        height={size}
        width={size}
      />
      <style jsx>{`
        .loadingContainer {
          padding: 20px;
          text-align: center;
        }
      `}</style>
    </div>
  )
}