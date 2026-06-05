import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { isWallboxAdminAuthorized } from "@/lib/config/admin-auth";
import { createProjectKey, ensureProject, revokeProjectKey, rotateProjectKey } from "@/lib/storage/project-store";

export const dynamic = "force-dynamic";

async function requireAdmin() {
  const token = (await cookies()).get("wallbox_admin")?.value;
  return isWallboxAdminAuthorized(token);
}

function redirect(request: Request, params: Record<string, string>) {
  const url = new URL("/admin", request.url);
  for (const [key, value] of Object.entries(params)) url.searchParams.set(key, value);
  return NextResponse.redirect(url, { status: 303 });
}

export async function POST(request: Request) {
  if (!(await requireAdmin())) return redirect(request, { error: "admin_required" });

  const form = await request.formData().catch(() => null);
  const action = String(form?.get("action") || "");
  const projectId = String(form?.get("project_id") || "");
  const projectName = String(form?.get("project_name") || "");
  const label = String(form?.get("label") || "");
  const keyId = String(form?.get("key_id") || "");

  try {
    if (action === "create_project") {
      const project = ensureProject(projectId, projectName);
      return redirect(request, { ok: `project:${project.projectId}` });
    }

    if (action === "create_key") {
      const created = createProjectKey({ projectId, projectName, label });
      return redirect(request, { ok: `key:${created.keyRecord.projectId}`, new_key: created.key, project_id: created.keyRecord.projectId });
    }

    if (action === "revoke_key") {
      const ok = revokeProjectKey(keyId);
      return redirect(request, { ok: ok ? "revoked" : "not_found" });
    }

    if (action === "rotate_key") {
      const created = rotateProjectKey(keyId);
      if (!created) return redirect(request, { error: "key_not_found" });
      return redirect(request, { ok: `rotated:${created.keyRecord.projectId}`, new_key: created.key, project_id: created.keyRecord.projectId });
    }

    return redirect(request, { error: "unknown_action" });
  } catch (error) {
    const message = error instanceof Error ? error.message : "failed";
    return redirect(request, { error: message.slice(0, 120) });
  }
}
