import { Icon } from "./Icon";

/** The clay dot used in status timelines (done / current / warn / stop / waiting). */
export default function StatusDot({ icon }) {
  return <span className="sdot">{icon ? <Icon name={icon} /> : null}</span>;
}
