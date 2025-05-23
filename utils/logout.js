
export async function logoutUser() {
  await fetch("/api/auth/logout", { method: "POST" });
  window.location.href = "/login"; 
}
