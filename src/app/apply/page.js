import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/server/auth/session";
import { getWizardState } from "@/server/services/applicationService";
import ApplyWizard from "@/components/certification/ApplyWizard";
import { Icon } from "@/components/ui/Icon";

export const metadata = {
  title: "Apply for a Medical Fitness Certificate",
  description:
    "Apply for the U.S.S.M.F. Air Sports Medical Fitness Certificate and upload your medical records securely.",
  robots: { index: false },
};

export default async function ApplyPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/register?next=/apply");

  if (user.role !== "athlete") {
    return (
      <div className="app-main">
        <div className="wrap">
          <div className="auth-card clay" style={{ marginInline: "auto" }}>
            <span className="bubble t-sun">
              <Icon name="steth" />
            </span>
            <h1>Staff accounts can’t apply</h1>
            <p className="lead">
              You’re signed in as a {user.role}. Athletes apply from their own account; you review
              applications in the portal.
            </p>
            <Link className="btn btn-primary" href="/admin">
              Open the review portal <Icon name="arrow" className="arrow" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const initial = await getWizardState(user);
  return (
    <div className="app-main">
      <div className="wrap">
        <ApplyWizard initial={initial} />
      </div>
    </div>
  );
}
