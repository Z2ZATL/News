(() => {
  const reactionIds = ["like", "love", "haha", "wow", "sad", "angry"];

  const isState = (value, slug) => {
    if (!value || typeof value !== "object" || value.slug !== slug) return false;
    if (!value.counts || typeof value.counts !== "object") return false;
    return reactionIds.every((id) => {
      const count = value.counts[id];
      return Number.isSafeInteger(count) && count >= 0;
    });
  };

  const text = (widget, key, label) => {
    const thai = widget.dataset.locale === "th";
    if (key === "unavailable") {
      return thai
        ? "ระบบแสดงความรู้สึกไม่พร้อมใช้งานชั่วคราว"
        : "Reactions are temporarily unavailable";
    }
    if (key === "selected") {
      return thai
        ? `คุณเลือก “${label}” กดอีกครั้งเพื่อยกเลิก`
        : `You reacted “${label}”. Press it again to remove it.`;
    }
    return thai ? "เลือกได้หนึ่งความรู้สึก" : "Choose one reaction";
  };

  const render = (widget, state) => {
    widget.dataset.selectedReaction = state.selected ?? "";
    for (const button of widget.querySelectorAll("[data-reaction]")) {
      const id = button.dataset.reaction;
      const count = state.counts[id];
      const active = state.selected === id;
      const label = button.dataset.label ?? "";
      button.disabled = false;
      button.dataset.active = active ? "true" : "";
      button.setAttribute("aria-pressed", String(active));
      button.setAttribute("aria-label", `${label} ${String(count)}`);
      const countNode = button.querySelector("[data-reaction-count]");
      if (countNode) countNode.textContent = String(count);
    }
    const selected = widget.querySelector(
      `[data-reaction="${CSS.escape(state.selected ?? "")}"]`,
    );
    const status = widget.querySelector("[data-reaction-status]");
    if (status) {
      status.textContent = state.selected
        ? text(widget, "selected", selected?.dataset.label ?? "")
        : text(widget, "ready", "");
    }
  };

  const setUnavailable = (widget) => {
    for (const button of widget.querySelectorAll("[data-reaction]")) {
      button.disabled = true;
    }
    const status = widget.querySelector("[data-reaction-status]");
    if (status) status.textContent = text(widget, "unavailable", "");
  };

  const load = async (widget) => {
    if (widget.dataset.reactionLoaded === "true") return;
    widget.dataset.reactionLoaded = "true";
    const slug = widget.dataset.slug ?? "";
    try {
      const response = await fetch(
        `/api/reactions?slugs=${encodeURIComponent(slug)}`,
        { cache: "no-store" },
      );
      if (!response.ok) throw new Error("Reaction state unavailable");
      const payload = await response.json();
      const state = payload.states?.[0];
      if (!isState(state, slug)) throw new Error("Invalid reaction state");
      render(widget, state);
    } catch {
      setUnavailable(widget);
    }
  };

  const choose = async (widget, button) => {
    if (widget.dataset.reactionPending === "true") return;
    const reaction = button.dataset.reaction;
    const slug = widget.dataset.slug ?? "";
    const selected = widget.dataset.selectedReaction;
    widget.dataset.reactionPending = "true";
    for (const option of widget.querySelectorAll("[data-reaction]")) {
      option.disabled = true;
    }
    try {
      const response = await fetch("/api/reactions", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          reaction: selected === reaction ? null : reaction,
          slug,
        }),
      });
      if (!response.ok) throw new Error("Reaction update failed");
      const payload = await response.json();
      if (!isState(payload.state, slug)) throw new Error("Invalid reaction state");
      render(widget, payload.state);
    } catch {
      setUnavailable(widget);
    } finally {
      delete widget.dataset.reactionPending;
    }
  };

  const observer = "IntersectionObserver" in window
    ? new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (!entry.isIntersecting) continue;
            observer.unobserve(entry.target);
            void load(entry.target);
          }
        },
        { rootMargin: "600px 0px" },
      )
    : null;

  const initialize = (widget) => {
    if (widget.dataset.reactionReady === "true") return;
    widget.dataset.reactionReady = "true";
    widget.addEventListener("click", (event) => {
      const button = event.target instanceof Element
        ? event.target.closest("[data-reaction]")
        : null;
      if (!(button instanceof HTMLButtonElement)) return;
      void choose(widget, button);
    });
    if (observer) observer.observe(widget);
    else void load(widget);
  };

  const scan = (root = document) => {
    if (root instanceof Element && root.matches("[data-reaction-widget]")) {
      initialize(root);
    }
    for (const widget of root.querySelectorAll?.("[data-reaction-widget]") ?? []) {
      initialize(widget);
    }
  };

  scan();
  new MutationObserver((records) => {
    for (const record of records) {
      for (const node of record.addedNodes) {
        if (node instanceof Element) scan(node);
      }
    }
  }).observe(document.documentElement, { childList: true, subtree: true });
})();
