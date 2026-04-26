const USERS_KEY = "pet4mateUsers";
const SESSION_KEY = "pet4mateSession";

const getUsers = () => {
  try {
    return JSON.parse(localStorage.getItem(USERS_KEY)) || [];
  } catch (error) {
    return [];
  }
};

const saveUsers = (users) => {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
};

const getSession = () => {
  try {
    return JSON.parse(localStorage.getItem(SESSION_KEY));
  } catch (error) {
    return null;
  }
};

const showMessage = (element, message, type) => {
  if (!element) return;

  element.textContent = message;
  element.className = `form-message ${type}`;
};

const getValue = (id) => document.getElementById(id)?.value.trim() || "";

const signupForm = document.getElementById("signupForm");
const loginForm = document.getElementById("loginForm");

const renderLoggedInNav = () => {
  const session = getSession();
  const navMenus = document.querySelectorAll(".navbar-nav");

  navMenus.forEach((menu) => {
    const loginItem = menu.querySelector('a[href$="login.html"]')?.closest(".nav-item");
    const signupItem = menu.querySelector('a[href$="signup.html"]')?.closest(".nav-item");
    const existingUserItem = menu.querySelector(".user-nav-item");

    if (!session?.fullName) {
      loginItem?.classList.remove("d-none");
      signupItem?.classList.remove("d-none");
      existingUserItem?.remove();
      return;
    }

    loginItem?.classList.add("d-none");
    signupItem?.classList.add("d-none");

    if (existingUserItem) {
      existingUserItem.querySelector(".user-name").textContent = session.fullName;
      return;
    }

    const userItem = document.createElement("li");
    const userWrap = document.createElement("div");
    const userName = document.createElement("span");
    const logoutButton = document.createElement("button");

    userItem.className = "nav-item user-nav-item";
    userWrap.className = "user-nav";
    userName.className = "user-name";
    userName.textContent = session.fullName;
    logoutButton.className = "btn btn-outline-dark rounded-pill logout-btn";
    logoutButton.type = "button";
    logoutButton.textContent = "Logout";

    userWrap.append(userName, logoutButton);
    userItem.appendChild(userWrap);

    menu.appendChild(userItem);
  });
};

document.addEventListener("click", (event) => {
  if (!event.target.matches(".logout-btn")) return;

  localStorage.removeItem(SESSION_KEY);
  renderLoggedInNav();

  if (window.location.pathname.endsWith("login.html") || window.location.pathname.endsWith("signup.html")) {
    return;
  }

  window.location.href = "./login.html";
});

renderLoggedInNav();

if (signupForm) {
  signupForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const message = document.getElementById("signupMessage");
    const email = getValue("signupEmail").toLowerCase();
    const password = document.getElementById("signupPassword")?.value || "";
    const termsAccepted = document.getElementById("termsCheck")?.checked;
    const users = getUsers();

    if (!termsAccepted) {
      showMessage(message, "Please accept the community rules before creating an account.", "error");
      return;
    }

    if (password.length < 6) {
      showMessage(message, "Password must be at least 6 characters long.", "error");
      return;
    }

    if (users.some((user) => user.email === email)) {
      showMessage(message, "An account with this email already exists. Please login.", "error");
      return;
    }

    const newUser = {
      fullName: getValue("fullName"),
      petName: getValue("petName"),
      email,
      city: getValue("city"),
      petType: getValue("petType"),
      petGender: getValue("petGender"),
      breed: getValue("breed"),
      petAge: getValue("petAge"),
      matchGoal: getValue("matchGoal"),
      password,
      createdAt: new Date().toISOString(),
    };

    saveUsers([...users, newUser]);
    showMessage(message, "Account created successfully. Redirecting to login...", "success");
    signupForm.reset();

    setTimeout(() => {
      window.location.href = "./login.html";
    }, 900);
  });
}

if (loginForm) {
  loginForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const message = document.getElementById("loginMessage");
    const email = getValue("loginEmail").toLowerCase();
    const password = document.getElementById("loginPassword")?.value || "";
    const rememberMe = document.getElementById("rememberMe")?.checked;
    const user = getUsers().find((savedUser) => savedUser.email === email);

    if (!user || user.password !== password) {
      showMessage(message, "Invalid email or password.", "error");
      return;
    }

    const session = {
      email: user.email,
      fullName: user.fullName,
      rememberMe: Boolean(rememberMe),
      loggedInAt: new Date().toISOString(),
    };

    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    showMessage(message, `Welcome back, ${user.fullName}! Redirecting...`, "success");

    setTimeout(() => {
      window.location.href = "./index.html";
    }, 900);
  });
}
