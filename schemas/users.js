var mongoose=require('mongoose');
// 用户的表结构
module.exports=new mongoose.Schema({
    //用户名
    username:String,
    //密码
    password:String,
    nickname:{
        type:String,
        default:'用户'+Date.now()
    },
    // 是否是管理员
    isAdmin:{
        type:Boolean,
        default:false
    }
})
