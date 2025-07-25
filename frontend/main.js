document.addEventListener("DOMContentLoaded", () => {
  const API_BASE_URL = window.API_CONFIG.API_URL;

  const subscriptionForm = document.getElementById("subscriptionForm");

  const feedback = document.getElementById("feedback");

  subscriptionForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const submitBtn = subscriptionForm.querySelector(".submit-btn");
    const originalBtnText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = "Subscribing...";

    const formData = new FormData(subscriptionForm);
    const data = Object.fromEntries(formData.entries());

    try {
      const response = await fetch(`${API_BASE_URL}/api/subscribe`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || "Something went wrong");
      }
      showFeedback(
        "Please check your email to confirm your subscription.",
        "success"
      );
    } catch (error) {
      showFeedback(error.message, "error");
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = originalBtnText;
    }
  });

  function showFeedback(message, type) {
    feedback.textContent = message;
    feedback.className = `feedback ${type}`;
    feedback.classList.remove("hidden");

    setTimeout(() => {
      feedback.classList.add("hidden");
    }, 5000);
  }
});
