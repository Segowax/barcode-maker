export class ToastBar extends HTMLElement {
    connectedCallback() {
        this.setAttribute('role', 'status');
        this.setAttribute('aria-live', 'polite');
    }

    show(message) {
        this.textContent = message;
        this.hidden = false;

        clearTimeout(this.hideTimeout);
        this.hideTimeout = setTimeout(() => {
            this.hidden = true;
        }, 5000);
    }
}

customElements.define('toast-bar', ToastBar);