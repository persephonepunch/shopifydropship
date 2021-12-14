import Link from "next/link";export default function SiteHeader(props) {
  return (
    <div
      data-collapse="medium"
      data-animation="default"
      data-duration="400"
      data-easing="ease"
      data-easing2="ease"
      role="banner"
      className="_wf-navbar-1 on-white w-nav"
    >
      <div className="nav-container w-container"> <Link href="/"><a className="brand w-nav-brand">
            <img
              src="/ui/616db17b8be8e15811beb627/616db1939b209b54cd42b744_white-logo.svg"
              width="170"
              height="37"
              alt="Polymorph logo"
              className="image-2"
            />
          </a></Link> <nav
          role="navigation"
          className="_wf-nav-menu-1 on-white-nav-menu w-nav-menu"
        >
          {props.rightNav}
        </nav>
        <div className="_wf-menu-button hamburger-icon w-nav-button">
          <img
            src="/ui/616db17b8be8e15811beb627/61756cdfcaccc3d40c1b84a7_nav-icon.svg"
            height="30"
            width="30"
            alt=""
            className="image"
          />
        </div>
      </div>
    </div>
  );
}