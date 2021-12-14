import Link from "next/link";export default function RightNav(props) {
  return (
    <div className="div-block-4"> <Link href="/"><a className="_wf-nav-link on-white-nav-link w-nav-link">About</a></Link> <Link href="/pricing"><a aria-current="page"
          className="_wf-nav-link on-white-nav-link w-nav-link w--current"
        >
          Pricing
        </a></Link> <a href="http://docs.polymorph.so/"
        className="_wf-nav-link on-white-nav-link w-nav-link"
      >
        Docs
      </a> <Link href="/contact"><a className="_wf-nav-link on-white-nav-link w-nav-link">Contact</a></Link> <a href="https://polymorph.outseta.com/auth?widgetMode=login#o-anonymous"
        className="_wf-nav-link on-white-nav-link w-nav-link"
      >
        Sign In
      </a> <Link href="/#o-logout-link"><a className="_wf-nav-link on-white-nav-link w-nav-link">Log Out</a></Link> <a href="https://polymorph.outseta.com/auth?widgetMode=register#o-anonymous"
        className="button-navigation w-nav-link"
      >
        Convert for Free
      </a> <Link href="/dashboard"><a className="button-navigation w-nav-link">Dashboard</a></Link> </div>
  );
}