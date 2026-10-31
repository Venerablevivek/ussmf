import Image from "next/image";
import Bubble from "@/components/ui/Bubble";

const LOOK = {
  valid: { tone: "mint", icon: "check" },
  expired: { tone: "sun", icon: "clock" },
  suspended: { tone: "sun", icon: "alert" },
  revoked: { tone: "coral", icon: "x" },
  not_found: { tone: "coral", icon: "x" },
};

/** The design's verification result card (mint valid, sun expired/suspended, coral revoked/not found). */
export default function VerifyResult({ result }) {
  const look = LOOK[result.result] || LOOK.not_found;
  if (result.result === "not_found") {
    return (
      <div className={`vres t-${look.tone}`}>
        <Bubble icon={look.icon} />
        <div>
          <h4>Not found</h4>
          <p>
            No certificate matches <code>{result.certificateId}</code>. Ask the athlete to check the ID or
            contact info@ussmf.org.
          </p>
        </div>
      </div>
    );
  }
  return (
    <div className={`vres t-${look.tone}`}>
      <Bubble icon={look.icon} />
      <div>
        <h4>{result.title}</h4>
        <p>
          <b>{result.athleteName}</b> · {result.discipline} · {result.certificateClass}
          <br />
          {result.dateLine}
        </p>
      </div>
      {result.photoUrl ? (
        <span className="vphoto">
          <Image
            src={result.photoUrl}
            alt={`Photo of ${result.athleteName}`}
            width={54}
            height={54}
            unoptimized
          />
        </span>
      ) : null}
    </div>
  );
}
