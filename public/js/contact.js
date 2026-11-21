document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("contactForm");
    const status = document.getElementById("contactStatus");
    const submit = form.querySelector('[type="submit"]');

    form.addEventListener("submit", async event => {
        event.preventDefault();
        const fields = Object.fromEntries(
            Array.from(new FormData(form), ([key, value]) => [key, value.trim()])
        );

        if (!fields.name || !fields.email || !fields.subject || !fields.message) {
            status.dataset.state = "error";
            status.textContent = "Complete all required fields.";
            return;
        }

        submit.disabled = true;
        status.dataset.state = "";
        status.textContent = "Sending your message…";

        try {
            const response = await fetch(form.action, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(fields)
            });
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || "Unable to send the message.");
            }

            form.reset();
            status.dataset.state = "success";
            status.textContent = "Thanks! Your message was received.";
        } catch (error) {
            status.dataset.state = "error";
            status.textContent = error instanceof SyntaxError
                ? "The contact service is unavailable. Please try again."
                : error.message || "Unable to send the message.";
        } finally {
            submit.disabled = false;
        }
    });
});
