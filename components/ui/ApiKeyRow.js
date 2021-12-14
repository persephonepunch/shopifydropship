export default function ApiKeyRow(props) {
  return (
    <div className="row">
      <div className="key-name cell">{props.keyName}</div>
      <div className="key-value cell">{props.keyValue}</div>
    </div>
  );
}