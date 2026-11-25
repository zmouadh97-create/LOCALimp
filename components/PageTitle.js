export default function PageTitle({ eyebrow, title, text, children }) {
  return (
    <div className="page-title">
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
        {text && <p className="muted lead">{text}</p>}
      </div>
      {children}
    </div>
  );
}
