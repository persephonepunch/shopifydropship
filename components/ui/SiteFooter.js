export default function SiteFooter(props) {
  return (
    <div className="footer">
      <div className="container">
        <div className="footer-legal">
          <div className="footer-detail-left">
            <div>
              Polymorph © 2021 <a href="https://smarterlabs.com/"
                rel="noopener noreferrer"
                target="_blank"
                className="webflow-link"
              >
                Smarter Labs
              </a> </div>
          </div>
          <div className="footer-detail-right">
            <div className="social-icon-wrap"> <a href="https://twitter.com/polymorphcli"
                className="social-link w-inline-block"
              >
                <img
                  src="/ui/616db17b8be8e15811beb627/616db199bf17fc4dd9bef11f_twitter.svg"
                  width="30"
                  height="30"
                  alt="Twitter logo"
                  className="social-icon"
                />
              </a> </div>
          </div>
        </div>
      </div>
    </div>
  );
}