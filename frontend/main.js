document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("subscriptionForm");
  const feedback = document.getElementById("feedback");
  const feedbackTitle = document.getElementById("feedbackTitle");
  const feedbackMessage = document.getElementById("feedbackMessage");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const formData = new FormData(form);
    const data = {
      email: formData.get("email"),
      city: formData.get("city"),
      frequency: formData.get("frequency"),
    };

    try {
      const response = await fetch(`${window.API_CONFIG.apiUrl}/subscribe`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (response.ok) {
        showFeedback(
          "Success!",
          "Please check your email to confirm your subscription.",
          "success"
        );
        form.reset();
      } else {
        showFeedback(
          "Error",
          result.message || "Something went wrong. Please try again.",
          "error"
        );
      }
    } catch (error) {
      showFeedback(
        "Error",
        "Failed to connect to the server. Please try again later.",
        "error"
      );
    }
  });

  function showFeedback(title, message, type) {
    feedbackTitle.textContent = title;
    feedbackMessage.textContent = message;
    feedback.className = `feedback ${type}`;
    feedback.classList.remove("hidden");

    // Hide feedback after 5 seconds
    setTimeout(() => {
      feedback.classList.add("hidden");
    }, 5000);
  }
});
