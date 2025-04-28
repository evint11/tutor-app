// public/client/Script.js

document.addEventListener("DOMContentLoaded", () => {
    const loginForm = document.getElementById("loginForm");
    const registerForm = document.getElementById("registerForm");
    const tutorList = document.getElementById("tutor-list");
    const searchInput = document.getElementById("searchInput");
    const welcomeMessage = document.getElementById("welcome-message");
    const logoutBtn = document.getElementById("logout-btn");

    const currentPage = window.location.pathname;
    let allTutors = [];

    // === Dashboard Protection & Booking List & Edit Profile ===
    if (currentPage.includes("dashboard.html")) {
        const user = JSON.parse(localStorage.getItem("user"));
        if (!user) {
            window.location.href = "/login.html?redirect=dashboard";
            return;
        }

        // Booking List
        const bookingList = document.getElementById("booking-list");
        (async () => {
            if (bookingList) {
                try {
                    const res = await fetch(`/api/bookings?userId=${encodeURIComponent(user._id)}`);
                    const bookings = await res.json();
                    console.log("Fetched bookings:", bookings);
                    bookingList.innerHTML = "";
                    if (!bookings.length) {
                        bookingList.innerHTML = "<li>No sessions yet.</li>";
                    } else {
                        bookings.forEach(b => {
                            const li = document.createElement("li");
                            const who = user._id === b.studentId._id ? b.tutorId.name : b.studentId.name;
                            const dateStr = new Date(b.date).toLocaleString();
                            li.innerHTML = `<strong>With:</strong> ${who} <strong>Date:</strong> ${dateStr}<br><strong>Note:</strong> ${b.message}`;
                            bookingList.appendChild(li);
                        });
                    }
                } catch (err) {
                    console.error("Failed to load bookings:", err);
                    bookingList.innerHTML = "<li>Error loading sessions.</li>";
                }
            }

            // Show Edit Profile Button for Tutors
            const tutorControls = document.getElementById("tutor-controls");
            if (tutorControls && user.role === "tutor") {
                tutorControls.style.display = "block";
            }
        })();
    }

    // === Redirect Message on Login ===
    if (currentPage.includes("login.html")) {
        const params = new URLSearchParams(window.location.search);
        if (params.get("redirect") === "dashboard") {
            const message = document.createElement("p");
            message.textContent = "Please log in to access your dashboard.";
            message.style.color = "red";
            message.style.textAlign = "center";
            message.style.marginBottom = "1rem";
            loginForm?.parentNode?.insertBefore(message, loginForm);
        }
    }

    // === Login Handler ===
    if (loginForm) {
        loginForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            const userCreds = {
                email: document.getElementById("email").value,
                password: document.getElementById("password").value,
            };
            try {
                const res = await fetch("/api/auth/login", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(userCreds),
                });
                const data = await res.json();
                if (res.ok) {
                    localStorage.setItem("user", JSON.stringify(data.user));
                    window.location.href = "/dashboard.html";
                } else {
                    alert("Login failed: " + data.error);
                }
            } catch (err) {
                console.error("Login error:", err);
                alert("Something went wrong during login.");
            }
        });
    }

    // === Register Handler ===
    if (registerForm) {
        const roleSelect = document.getElementById("role");
        const extraFields = document.getElementById("tutor-extra-fields");

        roleSelect.addEventListener("change", () => {
            extraFields.style.display = roleSelect.value === "tutor" ? "block" : "none";
        });

        registerForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            const rawSubjects = document.getElementById("subjects").value;
            const newUser = {
                name: document.getElementById("name").value,
                email: document.getElementById("email").value,
                password: document.getElementById("password").value,
                role: document.getElementById("role").value.toLowerCase(),
                subjects: rawSubjects.split(",").map(s => s.trim()).filter(s => s),
                bio: document.getElementById("bio")?.value || "",
                availability: document.getElementById("availability")?.value || "",
            };
            try {
                const res = await fetch("/api/auth/register", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(newUser),
                });
                const data = await res.json();
                if (res.ok) {
                    alert("Registered successfully!");
                    window.location.href = "/login.html";
                } else {
                    alert("Error: " + data.error);
                }
            } catch (err) {
                console.error("Registration error:", err);
                alert("Something went wrong during registration.");
            }
        });
    }

    // === Tutor Listing + Search ===
    if (tutorList) {
        async function loadTutors() {
            try {
                const res = await fetch("/api/tutors");
                const tutors = await res.json();
                allTutors = tutors;
                renderTutors(tutors);
            } catch (err) {
                console.error("Failed to load tutors:", err);
                tutorList.innerHTML = "<p>Error loading tutors.</p>";
            }
        }

        function renderTutors(tutors) {
            tutorList.innerHTML = "";
            if (tutors.length === 0) {
                tutorList.innerHTML = "<p>No tutors found.</p>";
                return;
            }
            tutors.forEach(tutor => {
                const card = document.createElement("div");
                card.classList.add("tutor-card");
                card.innerHTML = `
                    <h3>${tutor.name}</h3>
                    <p><strong>Subjects:</strong> ${tutor.subjects?.join(", ") || "N/A"}</p>
                    <p><strong>Bio:</strong> ${tutor.bio || "No bio provided."}</p>
                    <p><strong>Availability:</strong> ${tutor.availability || "Not specified."}</p>
                    <a href="/tutor-profile.html?id=${tutor._id}">View Profile</a>
                `;
                tutorList.appendChild(card);
            });
        }

        loadTutors();

        searchInput?.addEventListener("input", () => {
            const query = searchInput.value.toLowerCase();
            const filtered = allTutors.filter(tutor => {
                const nameMatch = tutor.name.toLowerCase().includes(query);
                const subjectMatch = tutor.subjects?.some(s => s.toLowerCase().includes(query));
                return nameMatch || subjectMatch;
            });
            renderTutors(filtered);
        });
    }

    // === Dashboard Greeting ===
    if (welcomeMessage) {
        const user = JSON.parse(localStorage.getItem("user"));
        if (user) {
            welcomeMessage.textContent = `Welcome, ${user.name}!`;
            const roleText = document.getElementById("user-role");
            if (roleText) roleText.textContent = `You are logged in as a ${user.role}.`;
        }
    }

    // === Logout Button ===
    if (logoutBtn) {
        logoutBtn.addEventListener("click", () => {
            localStorage.removeItem("user");
            window.location.href = "/login.html";
        });
    }

    // === Suggested Tutors Section ===
    const suggestedList = document.getElementById("suggested-tutor-list");
    if (suggestedList) {
        (async () => {
            try {
                const res = await fetch("/api/tutors");
                const tutors = await res.json();
                tutors.filter(t => t._id !== JSON.parse(localStorage.getItem("user"))._id)
                      .slice(0,5)
                      .forEach(tutor => {
                          const card = document.createElement("div");
                          card.classList.add("tutor-card");
                          card.innerHTML = `
                              <h3>${tutor.name}</h3>
                              <p><strong>Subjects:</strong> ${tutor.subjects?.join(", ") || "N/A"}</p>
                              <p><strong>Bio:</strong> ${tutor.bio || "No bio provided."}</p>
                              <p><strong>Availability:</strong> ${tutor.availability || "Not specified."}</p>
                              <a href="/tutor-profile.html?id=${tutor._id}">View Profile</a>
                          `;
                          suggestedList.appendChild(card);
                      });
            } catch (err) {
                console.error("Failed to load suggested tutors:", err);
            }
        })();
    }
});
