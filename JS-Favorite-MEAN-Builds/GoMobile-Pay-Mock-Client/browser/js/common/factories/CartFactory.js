app.factory('CartFactory', function ($rootScope){
  return {
    // getItem: function (key) {
    //   return JSON.parse(localStorage.getItem(key));
    // },

    deleteItem: function (key) {
      localStorage.removeItem(key);
    },

    getCart: function(){
      var archive = [],
          keys = Object.keys(localStorage);
      for (var i = 0; i < keys.length; i++) {
        // console.log("keys i = ", typeof localStorage.getItem(keys[i]))
        if (keys[i] === "debug"){
          continue;
        } else {
          var toObj = JSON.parse(localStorage.getItem(keys[i]));
          archive.push(toObj);
        }
      }
      return archive;
    },

    saveCart: function (name, info) {
      localStorage.setItem(name, JSON.stringify(info));
    },

    clearAllinCart: function () {
      localStorage.clear();
    }

  };
});
