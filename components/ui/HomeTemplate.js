export default function HomeTemplate(props) {
  return (
    <div id="Header" className="content">
      <div className="container-flex">
        <div className="hero-content">
          <h1 className="hero-h1">
            Create <span className="brand-span">UI Libraries</span> From Any Webflow Site
          </h1>
          <p className="hero-paragraph">
            Polymorph is a CLI tool for converting <strong>Webflow</strong> projects to UI libraries for various frameworks including <strong>React</strong>,<strong> Svelte</strong>, <strong> Vue.js</strong>,<strong> Shopify Liquid</strong>, <strong> Angular</strong>,<strong> SolidJS</strong>, <strong> Web Components</strong>,<strong> </strong> and <strong> JavaScript</strong>.
          </p>
        </div>
        <div className="hero-image-wrap">
          <img
            src="/ui/616db17b8be8e15811beb627/616def58a151ab23a5cce980_616b3a4942a4bcd38e0042b2_White%20Visualization.svg"
            width="707"
            height="651"
            alt="Diagram of Webflow sites funneling into Polymorph which creates a UI library"
            className="hero-image"
          />
        </div>
      </div>
    </div>
  );
}