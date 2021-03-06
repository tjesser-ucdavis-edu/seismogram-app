//
// A super-simple class that stores/retrieves authentication data (user/pass) in/from
// indexeddb via localforage.
//
// This should be a service. However, at the bottom of App.js you'll see that this
// object is used before angular is initialized -- before any services are available.
//
export var Auth = {
  auth: {},

  load: function(cb) {
    window.localforage.getItem("auth").then((v) => {
      if (v !== null) {
        this.auth = v;
      }
      cb();
    }).catch(cb);
  },

  store: function(auth) {
    this.auth = auth;
    return window.localforage.setItem("auth", auth);
  },

  remove: function() {
    this.auth = {};
    return window.localforage.removeItem("auth");
  },

  hasData: function() {
    return Object.keys(this.auth).length === 2;
  }
};
