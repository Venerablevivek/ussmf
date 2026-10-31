import Reveal from "@/components/motion/Reveal";
import Eyebrow from "@/components/ui/Eyebrow";
import PhaseFill from "./PhaseFill";

const PHASES = [
  { knob: "I", name: "Foundation", state: "Complete" },
  { knob: "II", name: "Framework", state: "Complete" },
  { knob: "III", name: "Leadership", state: "Complete" },
  { knob: "IV", name: "Nationwide launch", state: "In progress", now: true },
];

export default function PhaseBand() {
  return (
    <section className="phase" aria-labelledby="phase-h">
      <div className="wrap">
        <Reveal className="phase-card clay">
          <div>
            <Eyebrow tone="coral" icon="heart">
              Official announcement
            </Eyebrow>
            <h2 id="phase-h">The future of air sports medicine in America is coming.</h2>
            <p>
              We are preparing a nationwide sports medicine ecosystem focused on athlete safety, injury
              prevention, rehabilitation, insurance protection, research and education.
            </p>
          </div>
          <div className="track" aria-label="Launch progress: Phases I to III complete, Phase IV in progress">
            <PhaseFill />
            {PHASES.map((p) => (
              <div key={p.knob} className={p.now ? "ph now" : "ph"}>
                <span className="knob">{p.knob}</span>
                {p.name}
                <small>{p.state}</small>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
