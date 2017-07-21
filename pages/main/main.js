//index.js
//获取应用实例
var common = require('../../utils/common.js')
var app = getApp()
var Bmob = require("../../utils/bmob.js");
var that;

Page({
  data: {
   
      motto: '好货驾到，小主您里边儿请！',
      userInfo: {},
      imgUrls: ['http://bmob-cdn-12778.b0.upaiyun.com/2017/07/11/b0f9c5b140f2c6b5808a59bf1e3e4cbb.png',
        'http://bmob-cdn-12778.b0.upaiyun.com/2017/07/11/def5ecb040080e7180bcb825ec5fe6d0.jpg',
        'http://bmob-cdn-12778.b0.upaiyun.com/2017/07/11/3d0f3a6c40c5f25d801c5158ac2e4f38.png'],
      indicatorDots: true,
      vertical: false,
      autoplay: true,
      interval: 3000,
      duration: 1000,
   
    moodList: [],//商品列表
    loading: false,
    windowHeight1: 0,
    windowWidth1: 0,
    count: 0,
    scrollTop: {
    scroll_top1: 0,
    goTop_show: false
    }
  },
  onLoad: function (e) {
    that = this;
    that.setData({
      loading: false
    })

  },
  onShow: function () {
    var molist = new Array();
    that = this;
    getReturn(that);
    var Diary = Bmob.Object.extend("Diary");
    var query = new Bmob.Query(Diary);


    //此处查一次总计条数，控制台打印总数
    query.count({
      success: function (results) {
        that.setData({
          count: results
        })
        console.log(that.data.count, results)
      }
    });



    wx.getSystemInfo({
      success: (res) => {
        that.setData({
          windowHeight1: res.windowHeight,
          windowWidth1: res.windowWidth
        })
      }
    })
  },


 
  scrollTopFun: function (e) {
    if (e.detail.scrollTop > 300) {
      this.setData({
        'scrollTop.goTop_show': true
      });
    } else {
      this.setData({
        'scrollTop.goTop_show': false
      });
    }
  },

})


function getReturn() {
   

  that.setData({
    loading: false
  });
  var molist = new Array();
  wx.getStorage({
    key: 'user_id',
    success: function (ress) {
      if (ress.data) {
        // clearInterval(myInterval)
        var Diary = Bmob.Object.extend("Diary");
        var query = new Bmob.Query(Diary);


        //条件查询
        query.equalTo("is_hide", "1");
        query.descending("createdAt");//按发布时间顺序排列
        query.include("publisher");
        // 查询列表中所有商品信息
        query.find({
          success: function (results) {
            that.setData({
              loading: true
            });
            for (var i = 0; i < results.length; i++) {//循环次数为信息的总条数
              var publisherId = results[i].get("publisher").id;
              var title = results[i].get("title");//费用
              var content = results[i].get("content");//详情
              var id = results[i].id;//昵称
              var createdAt = results[i].createdAt;//发布时间
              var _url;
              
              var commentNum = results[i].get("commentNum");//评论数目
              var pic = results[i].get("pic");//发布图片
              if (pic) {
                _url = results[i].get("pic")._url;
              }
              else {
                _url = null;
              }
              var name = results[i].get("publisher").get("nickname");//昵称
              var userPic = results[i].get("publisher").get("userPic");
             
              var jsonA;
              if (pic) {//有图片
                jsonA = {
                  "title": title || '',//
                  "content": content || '',
                  "id": id || '',
                  "avatar": userPic || '',//头像
                  "created_at": createdAt || '',
                  "attachment": _url || '',
                 
                  "comments": commentNum,
                 
                  "username": name || ''
                }
              }
              else {//无图片
                jsonA = {
                  "title": title || '',
                  "content": content || '',
                  "id": id || '',
                  "avatar": userPic || '',
                  "created_at": createdAt || '',
                  "attachment": _url || '',
                 
                  "comments": commentNum,
                 
                  "username": name || ''
                }
              }

              molist.push(jsonA)
              that.setData({
                moodList: molist,
                // loading: true
              })
            }
          },
          error: function (error) {
            common.dataLoading(error, "loading");
      
            console.log(error)
          }
        });

      }

    },
    fail: function (error) {
      console.log("失败")
    }
  })
}