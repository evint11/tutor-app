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
            window.location.href = "login.html?redirect=dashboard";
        }
    }

    // === Booking List on Dashboard ===
    const bookingList = document.getElementById("booking-list");
    if (bookingList) {
        const user = JSON.parse(localStorage.getItem("user"));
        if (!user) return;
        fetch(`http://localhost:3000/api/bookings?userId=${user._id}`)
            .then((res) => res.json())
            .then((bookings) => {
                if (bookings.length === 0) {
                    bookingList.innerHTML = "<li>No sessions yet.</li>";
                    return;
                }
                bookings.forEach((b) => {
                    const li = document.createElement("li");
                    const who = user._id === b.studentId._id ? b.tutorId.name : b.studentId.name;
                    li.innerHTML = `<strong>With:</strong> ${who} <br><strong>On:</strong> ${b.date} <br><strong>Note:</strong> ${b.message}<br><br>`;
                    bookingList.appendChild(li);
                });
            });
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
                const res = await fetch("http://localhost:3000/api/auth/login", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(user),
                });
                const data = await res.json();
                if (res.ok) {
                    localStorage.setItem("user", JSON.stringify(data.user));
                    window.location.href = "dashboard.html";
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

        // Show tutor-only fields if role is "tutor"
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
                subjects: rawSubjects
                    .split(",")
                    .map((s) => s.trim())
                    .filter((s) => s.length > 0),
                bio: document.getElementById("bio")?.value || "",
                availability: document.getElementById("availability")?.value || "",
            };

            try {
                const res = await fetch("http://localhost:3000/api/auth/register", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(user),
                });
                const data = await res.json();
                if (res.ok) {
                    alert("Registered successfully!");
                    window.location.href = "login.html";
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
            const res = await fetch("http://localhost:3000/api/tutors");
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
        tutors.forEach((tutor) => {
            const card = document.createElement("div");
            card.classList.add("tutor-card");
            card.innerHTML = `
            <h3>${tutor.name}</h3>
            <p><strong>Subjects:</strong> ${tutor.subjects?.join(", ") || "N/A"}</p>
            <p><strong>Bio:</strong> ${tutor.bio || "No bio provided."}</p>
            <p><strong>Availability:</strong> ${tutor.availability || "Not specified."}</p>
            <a href="tutor-profile.html?id=${tutor._id}">View Profile</a>
        `;
        
            tutorList.appendChild(card);
        });
    }

    if (searchInput) {
        searchInput.addEventListener("input", () => {
            const query = searchInput.value.toLowerCase();
            const filteredTutors = allTutors.filter((tutor) => {
                const nameMatch = tutor.name.toLowerCase().includes(query);
                const subjectMatch = tutor.subjects?.some((s) => s.toLowerCase().includes(query));
                return nameMatch || subjectMatch;
            });
            renderTutors(filteredTutors);
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
    const user = JSON.parse(localStorage.getItem("user"));
    if (user && user.role === "tutor") {
        const tutorControls = document.getElementById("tutor-controls");
        if (tutorControls) {
            tutorControls.style.display = "block";
        }
    }
    
    // === Logout Button ===
    if (logoutBtn) {
        logoutBtn.addEventListener("click", () => {
            localStorage.removeItem("user");
            window.location.href = "login.html";
        });
    }
// === Suggested Tutors Section on Dashboard ===
if (currentPage.includes("dashboard.html")) {
    fetch("http://localhost:3000/api/tutors")
        .then((res) => res.json())
        .then((tutors) => {
            const suggestedList = document.getElementById("suggested-tutor-list");
            if (!suggestedList) return;

            // Shuffle tutors randomly
            tutors.sort(() => Math.random() - 0.5);

            // Pick top 3 tutors to suggest
            const suggestedTutors = tutors.slice(0, 3);

            suggestedTutors.forEach((tutor) => {
                const card = document.createElement("div");
                card.classList.add("tutor-card");
                card.innerHTML = `
                    <h3>${tutor.name}</h3>
                    <p><strong>Subjects:</strong> ${tutor.subjects?.join(", ") || "N/A"}</p>
                    <p><strong>Bio:</strong> ${tutor.bio || "No bio provided."}</p>
                    <a href="tutor-profile.html?id=${tutor._id}">View Profile</a>
                `;
                suggestedList.appendChild(card);
            });
        })
        .catch((err) => {
            console.error("Failed to load suggested tutors:", err);
        });
}

    // === Tutor Profile Page Enhancements ===
    if (currentPage.includes("tutor-profile.html")) {
        const params = new URLSearchParams(window.location.search);
        const tutorId = params.get("id");

        if (!tutorId) return;

        fetch(`http://localhost:3000/api/tutors/${tutorId}`)
            .then((res) => res.json())
            .then((tutor) => {
                document.getElementById("tutor-name").textContent = tutor.name;
                document.getElementById("tutor-email").textContent = tutor.email;
                document.getElementById("tutor-email").href = `mailto:${tutor.email}`;
                document.getElementById("tutor-subjects").textContent = tutor.subjects?.join(", ") || "N/A";
                document.getElementById("tutor-bio").textContent = tutor.bio || "No bio provided.";
                document.getElementById("tutor-availability").textContent = tutor.availability || "Not specified.";
            });
    }
});
