async function fetchProtectedData() {
  try {
    const response = await fetch("http://localhost:8000/api/users/auth", {
      method: "GET",
      credentials: "include", // Important: Include cookies in the request
    });

    if (!response.ok) {
      throw new Error("Failed to fetch protected data");
    }

    const data = await response.json();
    console.log("Protected data:", data);
  } catch (error) {
    console.error("Error fetching protected data:", error);
  }
}
