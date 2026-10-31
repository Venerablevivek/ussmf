// Sky layer: sun and lavender glows, drifting clay clouds (mouse parallax via --mx/--my set on
// the hero by HeroScene) and rising sparkles. All loops are CSS keyframes.

const CLOUDS = [
  { wrap: { left: "3%", top: "16%", "--t": "46s" }, cloud: { "--w": "170px", "--dp": -14 } },
  { wrap: { left: "38%", top: "9%", "--t": "60s" }, cloud: { "--w": "110px", "--dp": -6, "--o": 0.8 } },
  { wrap: { right: "4%", top: "30%", "--t": "52s" }, cloud: { "--w": "220px", "--dp": -22 } },
  { wrap: { left: "-3%", bottom: "14%", "--t": "58s" }, cloud: { "--w": "240px", "--dp": -26 } },
  { wrap: { left: "44%", bottom: "5%", "--t": "40s" }, cloud: { "--w": "150px", "--dp": -12, "--o": 0.9 } },
  { wrap: { right: "18%", bottom: "20%", "--t": "66s" }, cloud: { "--w": "90px", "--dp": -5, "--o": 0.75 } },
];

const SPARKS = [
  { left: "12%", bottom: "12%", "--t": "10s", "--dl": ".5s" },
  { left: "31%", bottom: "22%", "--t": "12s", "--dl": "3s" },
  { left: "57%", bottom: "8%", "--t": "9s", "--dl": "1.5s" },
  { left: "78%", bottom: "26%", "--t": "11s", "--dl": "5s" },
  { left: "90%", bottom: "10%", "--t": "13s", "--dl": "2s" },
];

export default function Clouds() {
  return (
    <div className="hero-sky" aria-hidden="true">
      <div className="sunglow" />
      <div className="lavglow" />
      {CLOUDS.map((c, i) => (
        <div key={i} className="c-wrap" style={c.wrap}>
          <div className="cloud" style={c.cloud} />
        </div>
      ))}
      {SPARKS.map((s, i) => (
        <i key={i} className="spark" style={s} />
      ))}
    </div>
  );
}

/** The two soft clouds inside the newsletter card. */
export function JoinClouds() {
  return (
    <>
      <div className="c-wrap" style={{ right: "6%", top: "12%", "--t": "30s" }} aria-hidden="true">
        <div className="cloud" style={{ "--w": "140px", "--o": 0.35 }} />
      </div>
      <div className="c-wrap" style={{ left: "40%", bottom: "-6%", "--t": "36s" }} aria-hidden="true">
        <div className="cloud" style={{ "--w": "200px", "--o": 0.25 }} />
      </div>
    </>
  );
}
