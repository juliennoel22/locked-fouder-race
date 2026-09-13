import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
      return NextResponse.json({ success: false, error: "Non authentifié" }, { status: 401 });
    }

    const metadata = user.user_metadata || {};
    return NextResponse.json({
      success: true,
      onboarding: {
        completed: metadata.onboarding_completed === true,
        step: metadata.onboarding_step || 1,
        level: metadata.study_level || "",
        goal: metadata.study_goal || "",
        userName: metadata.full_name || "",
        painPoint: metadata.pain_point || "",
      },
    });
  } catch (err) {
    console.error("Erreur GET /api/user/onboarding :", err);
    return NextResponse.json({ success: false, error: "Erreur serveur" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
      return NextResponse.json({ success: false, error: "Non authentifié" }, { status: 401 });
    }

    const body = await request.json();
    const { step, level, goal, userName, painPoint, completed } = body;

    const currentMeta = user.user_metadata || {};
    const updatedMeta = {
      ...currentMeta,
      ...(completed !== undefined ? { onboarding_completed: Boolean(completed) } : {}),
      ...(step !== undefined ? { onboarding_step: Number(step) } : {}),
      ...(level !== undefined ? { study_level: String(level) } : {}),
      ...(goal !== undefined ? { study_goal: String(goal) } : {}),
      ...(userName !== undefined ? { full_name: String(userName) } : {}),
      ...(painPoint !== undefined ? { pain_point: String(painPoint) } : {}),
      updated_at: new Date().toISOString(),
    };

    const { error: updateError } = await supabase.auth.updateUser({
      data: updatedMeta,
    });

    if (updateError) {
      throw updateError;
    }

    return NextResponse.json({
      success: true,
      onboarding: {
        completed: updatedMeta.onboarding_completed,
        step: updatedMeta.onboarding_step,
        level: updatedMeta.study_level,
        goal: updatedMeta.study_goal,
        userName: updatedMeta.full_name,
        painPoint: updatedMeta.pain_point,
      },
    });
  } catch (err) {
    console.error("Erreur POST /api/user/onboarding :", err);
    return NextResponse.json({ success: false, error: "Impossible de sauvegarder l'onboarding" }, { status: 500 });
  }
}
