
//获取应用实例
var app = getApp()
var that;
var optionId;
var common = require('../template/getCode.js')
var Bmob=require("../../utils/bmob.js");
var commentlist;
Page({
  data:{
      limit:5,
      showImage:false ,
      loading:false,
      isdisabled:false,
      commentLoading:false,
      isdisabled1:false,
      recommentLoading:false,
      commentList:[],
      agree:0
  },
  
  onLoad: function(options) {   
      that=this;
      optionId=options.moodId;
      
  },
  onReady:function(){
     wx.hideToast() 
     
  },
  onShow: function() {  
      var myInterval=setInterval(getReturn,500);
      function getReturn(){
          wx.getStorage({
            key: 'user_id',
            success: function(ress) {
              if(ress.data){
                clearInterval(myInterval)
                var Diary = Bmob.Object.extend("Diary");
                var query = new Bmob.Query(Diary);
                query.equalTo("objectId", optionId);
                query.include("publisher");
                query.find({
                    success: function(result) {
                      var title=result[0].get("title");
                      var content=result[0].get("content");
                      var publisher=result[0].get("publisher");
                     
                      var commentNum=result[0].get("commentNum");
                      var ishide=result[0].get("is_hide");
                     
                      var userNick=publisher.get("nickname");
                      var isPublic;
                      var userPic;
                      var url;
                      if(publisher.get("userPic")){
                          userPic=publisher.get("userPic");
                      }
                      else{
                          userPic=null;
                      }
                      if(result[0].get("pic")){
                        url=result[0].get("pic")._url;
                      }
                      else{
                        url=null;
                      }
                      if(publisher.id==ress.data){
                        that.setData({
                          isMine:true
                        })
                      }
                      if(ishide==0){
                        isPublic=false;
                      }
                      else{
                        isPublic=true;
                      }
                      that.setData({
                        listTitle:title,
                        listContent:content,
                        listPic:url,
                        // agreeNum:agreeNum,
                        commNum:commentNum,
                        ishide:ishide,
                        isPublic:isPublic,
                        userPic:userPic,
                        userNick:userNick,
                        loading: true
                      })
                    
                      that.commentQuery(result[0]);

                    },
                    error: function(error) {
                      
                        that.setData({
                          loading: true
                        })
                        console.log(error)
                    }
                  }); 
                }
                
            } 
          })
      }

  },
  commentQuery:function(mood){
      // 查询评论
      commentlist=new Array();
      var Comments = Bmob.Object.extend("Comments");
      var queryComment = new Bmob.Query(Comments);
      queryComment.equalTo("mood", mood);
      queryComment.include("publisher");
      queryComment.descending("createdAt");
      queryComment.find({
          success: function(result) {
            for(var i=0;i<result.length;i++){
              var id=result[i].id;
              var pid=result[i].get("olderComment");
              var uid=result[i].get("publisher").id;
              var content=result[i].get("content");
              var created_at=result[i].createdAt;
              var olderUserName;
              var userPic=result[i].get("publisher").get("userPic");
              var nickname=result[i].get("publisher").get("nickname");
              if(pid){
                pid=pid.id;
                olderUserName=result[i].get("olderUserName");
              }
              else{
                pid=0;
                olderUserName="";
              }
              var jsonA;
              jsonA='{"id":"'+id+'","content":"'+content+'","pid":"'+pid+'","uid":"'+uid+'","created_at":"'+created_at+'","pusername":"'+olderUserName+'","username":"'+nickname+'","avatar":"'+userPic+'"}'; 
              var jsonB=JSON.parse(jsonA);
              commentlist.push(jsonB)
              that.setData({
                commentList:commentlist,
                loading: true
              })
            }
          },
          error: function(error) {
              common.dataLoading(error,"loading");
              console.log(error)
          }
        }); 

  },


  changeComment:function(){
    that.setData({
      autoFo:true
    })
  },
  changeFocus:function(){
    that.setData({
      autoFo:true
    })
  },
  toResponse:function(event){//去回复
    var commentId=event.target.dataset.id;
    var userId=event.target.dataset.uid;
    var name=event.target.dataset.name;
    if(!name){
      name="";
    }
    if(userId==wx.getStorageSync('user_id')){
      common.dataLoading("不能对自己的评论进行回复","loading");
    }
    else{
      var toggleResponse;
      if(that.data.isToResponse=="true"){
        toggleResponse=false;
      }
      else{
        toggleResponse=true;
      }
      that.setData({
        pid:commentId,
        isToResponse:toggleResponse,
        plaContent:"回复"+name+":",
        resopneName:name
      })
    }
    
  },
  hiddenResponse:function(){
      this.setData({
        isToResponse:false
      })
  },
  deleteThis:function(){//删除商品
    wx.showModal({
      title: '是否删除该商品？',
      content: '删除后将不能恢复哦',
      showCancel:true,
      confirmColor:"#a07c52",
      cancelColor:"#646464",
      success: function(res) {
        if (res.confirm) {
          // 删除此商品后返回上一页
            var Diary = Bmob.Object.extend("Diary");
            var queryDiary = new Bmob.Query(Diary);
            queryDiary.get(optionId, {
                success: function(result) {
                  result.destroy({
                    success: function(myObject) {
                      // 删除成功
                      common.dataLoading("删除成功","success",function(){
                          wx.navigateBack({
                              delta: 1
                          })
                      });
                    },
                    error: function(myObject, error) {
                      // 删除失败
                      console.log(error)
                      // common.dataLoading(error,"loading");
                    }
                  });
                },
                error: function(object, error) {

                }
            });
          
        }
        else{
        }
      }
    })
  },

publishComment:function(e){//留言
  if(e.detail.value.commContent==""){
    common.dataLoading("留言内容不能为空","loading");
  }
  else{
      that.setData({
        isdisabled:true,
        commentLoading:true
      })


      wx.getStorage({
          key: 'user_id',
          success: function(ress) {
            that.setData({
              commentLoading:false
            })
            var queryUser = new Bmob.Query(Bmob.User);
            //查询单条数据，第一个参数是这条数据的objectId值
            queryUser.get(ress.data, {
              success: function(userObject) {
                // 查询成功，调用get方法获取对应属性的值
                var Comments = Bmob.Object.extend("Comments");
                var comment = new Comments();       
                var Diary = Bmob.Object.extend("Diary");
                var diary = new Diary();
                diary.id=optionId;
                var me = new Bmob.User();
                me.id=ress.data;
                comment.set("publisher",me);
                comment.set("mood", diary);
                comment.set("content", e.detail.value.commContent);
                if(that.data.isToResponse){
                  var olderName=that.data.resopneName;
                  var Comments1 = Bmob.Object.extend("Comments");
                  var comment1 = new Comments1();
                  comment1.id=that.data.pid;
                  comment.set("olderUserName",olderName);
                  comment.set("olderComment",comment1);
                }
                //添加数据，第一个入口参数是null
                comment.save(null, {
                  success: function(res) {
                    var queryDiary = new Bmob.Query(Diary);
                          //查询单条数据，第一个参数是这条数据的objectId值
                    queryDiary.get(optionId, {
                      success: function(object) {
                        object.set('commentNum',object.get("commentNum")+1);
                        object.save();
                        that.onShow();
                      },
                      error: function(object, error) {
                        // 查询失败
                      }
                    });
                    that.setData({
                      publishContent:"",
                      isToResponse:false,
                      responeContent:"",
                      isdisabled:false,
                      commentLoading:false
                    })
                  },
                  error: function(gameScore, error) {
                      common.dataLoading(error,"loading");
                      that.setData({
                        publishContent:"",
                        isToResponse:false,
                        responeContent:"",
                        isdisabled:false,
                        commentLoading:false
                      })
                  }
                });

              },
              error: function(object, error) {
                // 查询失败
              }
            });  
         
          } 
        })
    
  }
},
bindKeyInput:function(e){
  this.setData({
    publishContent: e.detail.value
  })
},
  onHide: function() {
      // Do something when hide.
  },
  onUnload:function(event){
    
  },
  onPullDownRefresh:function(){
    wx.stopPullDownRefresh()
  },
  seeBig:function(e){
    wx.previewImage({
      current: that.data.listPic, // 当前显示图片的http链接
      urls: [ that.data.listPic] // 需要预览的图片http链接列表
    })
  }
})
