export default function lookupHelper(name, env) {
  try {
    var view = env.data.view,
        container = view.container;
    return name && container && container.lookup('helper:' + name);
  } catch(e) {
    return; // FML tests mock out container w/o implementing the full API
  }
}