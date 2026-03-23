export const signupUser = (user) => {
  let users = JSON.parse(localStorage.getItem("users")) || [];

  const exists = users.find(u => u.email === user.email);
  if (exists) {
    return { success: false, message: "User already exists" };
  }

  users.push(user);
  localStorage.setItem("users", JSON.stringify(users));
  return { success: true };
};

export const loginUser = (email, password) => {
  let users = JSON.parse(localStorage.getItem("users")) || [];

  const user = users.find(
    u => u.email === email && u.password === password
  );

  if (!user) return null;

  localStorage.setItem("currentUser", JSON.stringify(user));
  return user;
};

export const getCurrentUser = () => {
  return JSON.parse(localStorage.getItem("currentUser"));
};

export const logout = () => {
  localStorage.removeItem("currentUser");
};