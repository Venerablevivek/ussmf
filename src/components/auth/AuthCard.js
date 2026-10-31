import Entrance from "@/components/motion/Entrance";
import LogoSlot from "@/components/ui/LogoSlot";

/** Centered clay card used by the sign-in, registration and password pages. */
export default function AuthCard({ eyebrow, title, lead, children, footer }) {
  return (
    <div className="auth-wrap wrap">
      <Entrance variant="slidein" className="auth-card clay">
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <LogoSlot size={48} />
          <span className="eyebrow t-blue">{eyebrow}</span>
        </div>
        <h1>{title}</h1>
        {lead ? <p className="lead">{lead}</p> : null}
        {children}
        {footer ? <p className="auth-alt">{footer}</p> : null}
      </Entrance>
    </div>
  );
}
