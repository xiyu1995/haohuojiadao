//app.js
var Bmob=require("utils/bmob.js");
var common=require("utils/common.js");
Bmob.initialize("de547ab4b6be454923d4cc1bb2aef41c", "ed631efd827d9fa69e0107ee42ce8fc7");
App({

  onPullDownRefresh:function(){
    wx.stopPullDownRefresh()
  },
  onError: function(msg) {
    
  }
})