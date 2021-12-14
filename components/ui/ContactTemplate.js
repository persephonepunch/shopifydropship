export default function ContactTemplate(props) {
  return (
    <div id="Header" className="content">
      <div className="section">
        <div className="wrapper">
          <div className="row-2">
            <div className="col lg-5 bottom-margin-mobile">
              <h2>Contact us</h2>
              <p className="paragraph-small">
                We love to chat! Reach out to us with any questions, comments,
                or feature suggestions for Polymorph.
                <br />
              </p>
            </div>
            <div className="col lg-1 hidden-lg-down" />
            <div className="col lg-6">
              <div className="contact-form-container">
                <div className="form w-form">
                  <form
                    id="email-form"
                    name="email-form"
                    data-name="Email Form"
                  >
                    <input
                      type="text"
                      name="Name"
                      data-name="Name"
                      placeholder="Your name"
                      id="name"
                      maxLength="256"
                      className="form-field w-input"
                    />
                    <input
                      type="text"
                      name="Email"
                      data-name="Email"
                      placeholder="Your email"
                      id="email"
                      required=""
                      maxLength="256"
                      className="form-field w-input"
                    />
                    <textarea
                      id="message"
                      name="Message"
                      placeholder="Your message"
                      data-name="Message"
                      maxLength="5000"
                      className="text-area w-input"
                    />
                    <input
                      type="submit"
                      value="Send message"
                      data-wait="Please wait..."
                      className="button w-button"
                    />
                  </form>
                  <div className="success-message w-form-done">
                    <div>Thank you! Your submission has been received!</div>
                  </div>
                  <div className="error-message w-form-fail">
                    <div>
                      Oops! Something went wrong while submitting the form.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}