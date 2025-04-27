 const publicIp = 'http://localhost:4000';
//const publicIp = 'http://3.109.143.245:4000';

document.getElementById("signup-form").addEventListener("submit", async (e) => {
    e.preventDefault();

    const name = e.target.nameInput.value.trim();
    const email = e.target.emailInput.value.trim();
    const password = e.target.passwordInput.value.trim();

    if (!name || !email || !password) {
        showError("All fields are mandatory!");
        return;
    }

    await addNewUser(name, email, password);
});

// Function to send POST request to the server
async function addNewUser(name, email, password) {
    try {
        const obj = { name, email, password };
        const response = await axios.post(`/user/signup`, obj);

        if (response.status === 201) {
            showSuccess(response.data.UserAddedResponse);

            // Optional: Scroll to top
            window.scrollTo({ top: 0, behavior: 'smooth' });

            // Redirect after 2 seconds
            setTimeout(() => {
                window.location.href = '/view/login.html';
            }, 2000);
        } else {
            throw new Error("Error creating user");
        }
    } catch (err) {
        showError(err.response?.data?.message || 'Signup failed. Try again!');
    }
}

// Function to show error alert
function showError(message) {
    const errorBox = document.querySelector("#errorAlert");
    errorBox.innerText = message;
    errorBox.classList.remove("hidden");

    setTimeout(() => {
        errorBox.classList.add("hidden");
    }, 1500);
}

// Function to show success alert
function showSuccess(message) {
    const successBox = document.querySelector("#successAlert");
    successBox.innerText = message;
    successBox.classList.remove("hidden");

    setTimeout(() => {
        successBox.classList.add("hidden");
    }, 2000);
}
