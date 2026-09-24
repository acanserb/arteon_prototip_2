"use client";

export default function Lighting() {
  return (
    <>
      {/* floor light kept extremely low so posterior/side surfaces can genuinely disappear into shadow */}
      <ambientLight intensity={0.02} color="#060d12" />
      <hemisphereLight args={["#0a1a20", "#010203", 0.04]} />

      {/* key — large soft neutral white, upper-left-front, sculpts the forms */}
      <directionalLight position={[-5, 6.5, 6.5]} intensity={2.8} color="#f3f6f7" />

      {/* fill — substantially weaker cool, front-right/lower-right, keeps shadows from crushing fully black */}
      <directionalLight position={[4.5, -1.5, 5]} intensity={0.1} color="#3f6270" />

      {/* rim — narrow, back/side grazing cyan; one dominant back-right, one weaker lower, one faint upper */}
      <pointLight position={[-2.6, 1.2, -8.5]} intensity={46} color="#19c5f4" distance={16} decay={2.4} />
      <pointLight position={[4, -2.6, -6.5]} intensity={16} color="#0b8fb7" distance={12} decay={2.4} />
      <pointLight position={[-3.5, 4.5, -5]} intensity={9} color="#19c5f4" distance={11} decay={2.6} />
    </>
  );
}
