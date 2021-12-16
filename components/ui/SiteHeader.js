import Link from "next/link";export default function SiteHeader(props) {
  return (
    <div
      data-collapse="medium"
      data-animation="default"
      data-duration="400"
      data-easing="ease"
      data-easing2="ease"
      role="banner"
      className="navigation w-nav"
    >
      <div className="navigation-wrap"> <Link href="/"><a aria-current="page" className="logo-link w-nav-brand w--current">
            <img
              src="/ui/61b9163cf77f055e0766de10/61b9163cf77f05da6d66de35_business-logo%402x.png"
              width="108"
              alt=""
              className="logo-image"
            />
          </a></Link> <div className="menu">
          <nav role="navigation" className="navigation-items w-nav-menu"> <Link href="/about"><a className="navigation-item w-nav-link">About</a></Link> <Link href="/projects"><a className="navigation-item w-nav-link">Work</a></Link> <Link href="/team"><a className="navigation-item w-nav-link">team</a></Link> <Link href="/blog"><a className="navigation-item w-nav-link">Blog</a></Link> <Link href="/contact"><a className="navigation-item w-nav-link">Contact</a></Link> </nav>
          <div className="menu-button w-nav-button">
            <img
              src="/ui/61b9163cf77f055e0766de10/61b9163cf77f053e2566de36_menu-icon.png"
              width="22"
              alt=""
              className="menu-icon"
            />
          </div>
        </div> <a href="mailto:mail@business.com?subject=You've%20got%20mail!"
          className="button cc-contact-us w-inline-block"
        >
          <div>Contact US</div>
        </a> </div>
    </div>
  );
}