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

    // === Dashboard Protection ===
    if (currentPage.includes("dashboard.html")) {
        const user = JSON.parse(localStorage.getItem("user"));
        if (!user) {
            window.location.href = "/login.html?redirect=dashboard";
        }
    }

    // === Booking List on Dashboard ===
    const bookingList = document.getElementById("booking-list");
    if (bookingList) {
        const user = JSON.parse(localStorage.getItem("user"));
        if (!user) return;
        fetch(`/api/bookings?userId=${user._id}`)
            .then(res => res.json())
            .then(bookings => {
                bookingList.innerHTML = "";
                if (bookings.length === 0) {
                    bookingList.innerHTML = "<li>No sessions yet.</li>";
                    return;
                }
                bookings.forEach(b => {
                    const li = document.createElement("li");
                    const who = user._id === b.studentId._id ? b.tutorId.name : b.studentId.name;
                    li.innerHTML = `<strong>With:</strong> ${who} <strong>Date:</strong> ${b.date} <br><strong>Note:</strong> ${b.message}<br><br>`;
                    bookingList.appendChild(li);
                });
            })
            .catch(err => console.error("Failed to load bookings:", err));
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
            const user = {
                email: document.getElementById("email").value,
                password: document.getElementById("password").value,
            };
            try {
                const res = await fetch("/api/auth/login", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(user),
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
            const user = {
                name: document.getElementById("name").value,
                email: document.getElementById("email").value,
                password: document.getElementById("password").value,
                role: document.getElementById("role").value.toLowerCase(),
                subjects: rawSubjects.split(",").map(s => s.trim()).filter(s => s.length > 0),
                bio: document.getElementById("bio")?.value || "",
                availability: document.getElementById("availability")?.value || "",
            };
            try {
                const res = await fetch("/api/auth/register", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(user),
                });
                const data = await res.json();
                if (res.ok) {
                    alert("Registered successfully!");
                    window.location.href = "/login.html";
                } else {
                    alert("Error: " + data.error);
                }
            } catch (err) {
                console.error(err);
                alert("Something went wrong during registration.");
            }
        });
    }

    // === Tutor Listing + Search ===
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

    if (tutorList) loadTutors();

    // === Dashboard Greeting ===
    if (welcomeMessage) {
        const user = JSON.parse(localStorage.getItem("user"));
        if (user) {
            welcomeMessage.textContent = `Welcome, ${user.name}!`;
            const roleText = document.getElementById("user-role");
            if (roleText) {
                roleText.textContent = `You are logged in as a ${user.role}.`;
            }
        }
    }

    // === Logout Button ===
    if (logoutBtn) {
        logoutBtn.addEventListener("click", () => {
            localStorage.removeItem("user");
            window.location.href = "/login.html";
        });
    }

    // === Suggested Tutors Section on Dashboard ===
    const suggestedList = document.getElementById("suggested-tutor-list");
    if (suggestedList) {
        const user = JSON.parse(localStorage.getItem("user"));
        if (user) {
            fetch("/api/tutors")
                .then(res => res.json())
                .then(tutors => {
                    // exclude current user if tutor
                    const filtered = tutors.filter(t => t._id !== user._id);
                    const suggestions = filtered.slice(0, 5);
                    suggestions.forEach(tutor => {
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
                })
                .catch(err => console.error("Failed to load suggested tutors:", err));
        }
    }
});
