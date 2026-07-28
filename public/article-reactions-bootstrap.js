(() => {
  let loading = false;
  const watched = new WeakSet();
  const load = () => {
    if (loading) return;
    loading = true;
    const script = document.createElement("script");
    script.src = "/article-reactions.js";
    script.async = true;
    document.head.append(script);
  };
  const observer = "IntersectionObserver" in window
    ? new IntersectionObserver(
        (entries) => {
          if (!entries.some((entry) => entry.isIntersecting)) return;
          observer.disconnect();
          load();
        },
        { rootMargin: "800px 0px" },
      )
    : null;
  const watch = (root = document) => {
    const widgets = [];
    if (root instanceof Element && root.matches("[data-reaction-widget]")) {
      widgets.push(root);
    }
    widgets.push(
      ...(root.querySelectorAll?.("[data-reaction-widget]") ?? []),
    );
    for (const widget of widgets) {
      if (watched.has(widget)) continue;
      watched.add(widget);
      if (observer) observer.observe(widget);
      else load();
    }
  };
  watch();
  new MutationObserver((records) => {
    for (const record of records) {
      for (const node of record.addedNodes) {
        if (node instanceof Element) watch(node);
      }
    }
  }).observe(document.documentElement, { childList: true, subtree: true });
})();
