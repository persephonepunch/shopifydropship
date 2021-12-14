export default function DashboardTemplate(props) {
  return (
    <div id="Header" className="content dashboard-content">
      <div className="container-flex container">
        <h1>API Keys</h1>
        <div>{props.apiKeys}</div>
      </div>
    </div>
  );
}