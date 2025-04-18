import { NextResponse } from "next/server";
import { db } from "../../../../firebaseConfig";
import { ref, get, set } from "firebase/database";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const adminId = searchParams.get("adminId");

    if (userId) {
      const userRef = ref(db, `users/${userId}`);
      const snapshot = await get(userRef);

      if (snapshot.exists()) {
        return NextResponse.json(snapshot.val());
      } else {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }
    }

    if (adminId) {
      const adminRef = ref(db, `users/${adminId}`);
      const adminSnapshot = await get(adminRef);

      if (!adminSnapshot.exists() || !adminSnapshot.val().isAdmin) {
        return NextResponse.json(
          { error: "Unauthorized: Only admins can list all users" },
          { status: 403 }
        );
      }

      const usersRef = ref(db, "users");
      const usersSnapshot = await get(usersRef);

      if (usersSnapshot.exists()) {
        const users = usersSnapshot.val();
        return NextResponse.json(users);
      } else {
        return NextResponse.json({});
      }
    }

    return NextResponse.json(
      { error: "User ID or admin ID is required" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { userId, isAdmin, adminId } = await request.json();

    if (!userId || !adminId) {
      return NextResponse.json(
        { error: "User IDs are required" },
        { status: 400 }
      );
    }

    const adminRef = ref(db, `users/${adminId}`);
    const adminSnapshot = await get(adminRef);

    if (!adminSnapshot.exists() || !adminSnapshot.val().isAdmin) {
      return NextResponse.json(
        { error: "Unauthorized: Only admins can set admin status" },
        { status: 403 }
      );
    }

    const userRef = ref(db, `users/${userId}`);
    const userSnapshot = await get(userRef);

    if (userSnapshot.exists()) {
      await set(userRef, {
        ...userSnapshot.val(),
        isAdmin: isAdmin || false,
        updatedAt: new Date().toISOString(),
      });

      return NextResponse.json(
        { message: `User admin status set to ${isAdmin}` },
        { status: 200 }
      );
    } else {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json(
      { error: "Failed to update user" },
      { status: 500 }
    );
  }
}
