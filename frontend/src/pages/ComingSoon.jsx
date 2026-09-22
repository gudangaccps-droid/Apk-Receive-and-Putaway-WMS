export default function ComingSoon({ title, description }) {
  return (
    <div className="page">
      <h1>{title}</h1>
      <div className="coming-soon">
        <span className="badge-status">Dalam Pengembangan</span>
        <p>{description}</p>
      </div>
    </div>
  );
}
