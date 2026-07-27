export function CosmicBackdrop() {
  return (
    <div className="cosmic-backdrop" aria-hidden="true">
      <span className="cosmic-backdrop__mist cosmic-backdrop__mist--one" />
      <span className="cosmic-backdrop__mist cosmic-backdrop__mist--two" />
      <span className="cosmic-backdrop__dust cosmic-backdrop__dust--near" />
      <span className="cosmic-backdrop__dust cosmic-backdrop__dust--far" />
      <span className="cosmic-backdrop__monolith cosmic-backdrop__monolith--left" />
      <span className="cosmic-backdrop__monolith cosmic-backdrop__monolith--right" />
    </div>
  );
}
