import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { email, firstName, lastName } = await request.json();
    console.log("Received data:", { email, firstName, lastName });

    const supabase = createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      console.log("No authenticated user found");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch the user's admin status from the users table
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("is_admin")
      .eq("id", user.id)
      .single();

    if (userError) {
      console.error("Error fetching user data:", userError);
      return NextResponse.json(
        { error: "Error fetching user data" },
        { status: 500 }
      );
    }

    if (!userData?.is_admin) {
      console.log("User is not an admin");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Create the new user
    const { data: newUser, error: createError } =
      await supabase.auth.admin.createUser({
        email: email,
        email_confirm: true,
        user_metadata: { first_name: firstName, last_name: lastName },
      });

    if (createError) {
      console.error("Error creating user:", createError);
      return NextResponse.json({ error: createError.message }, { status: 400 });
    }

    console.log("New user created:", newUser);

    // Update the users table in the public schema
    const { error: updateError } = await supabase
      .from("users")
      .update({ first_name: firstName, last_name: lastName })
      .eq("id", newUser.user.id);

    if (updateError) {
      console.error("Error updating user data:", updateError);
      return NextResponse.json(
        { error: "Error updating user data" },
        { status: 500 }
      );
    }

    // Send password reset email
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(
      email
    );

    if (resetError) {
      console.error("Error sending password reset email:", resetError);
      return NextResponse.json(
        { error: "Error sending password reset email" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: "User created and password reset email sent successfully",
    });
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
