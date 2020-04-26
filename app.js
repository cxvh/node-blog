/**
 * 创建于2020-4-21
 * 应用程序的启动---入口文件
 */
//加载express模块
 var express=require('express');
//加载模块
var swig=require('swig');
// 加载body-parser模块，用来处理post请求
var bodyParser=require('body-parser');
// 加载cookies模块
var Cookies=require('cookies');
//创建app应用=》NodeJs Http.createServer()
var app=express();

var User=require('./models/User');

//设置静态文件托管
//当用户访问的url以/public开始,那么直接返回对应__dirname+'/public'下的文件
app.use('/public',express.static(__dirname+'/public'));

//配置应用模板
// 定义当前应用所使用的模板引擎
// 第一个参数：模板引擎的名称，同时也是模板文件的后缀，第二个参数是目录
app.engine('html',swig.renderFile);
// 设置模板文件存放的目录,第一个参数必须是views,第二个参数是目录
app.set('views','./views');
//注册所使用的模板引擎,第一个参数必须是 view engine,第二个参数和app.engine这个方法中定义的模板引擎的名称(第一个参数)是一致的
app.set('view engine','html');//这个html和"app.engine('html',swig.renderFile);"中html是一样的,必须保持一致

//在开发过程中,需要取消模板缓存---------------------------------
swig.setDefaults({cache:false});
//------------------------------------------------------------


//bodyParser设置
app.use(bodyParser.urlencoded({extended:true}))//返回仅解析urlencoded主体并且仅查看Content-Type标头与type选项匹配的请求的中间件。该解析器仅接受主体的UTF-8编码，并支持gzip和deflate编码的自动填充。在中间件（即）之后，将一个body包含已解析数据的新对象填充到该request对象上req.body。该对象将包含键-值对，其中该值可以是一个字符串或阵列（时extended是 false），或任何类型的（当extended是true）。

// 设置cookies
app.use(function(req,res,next){
  req.cookies=new Cookies(req,res);

  // 解析登录用户的cookie信息
  req.userInfo={};
  if(req.cookies.get('userInfo')){
    try{
      req.userInfo=JSON.parse(req.cookies.get('userInfo'));
      
      //获取当前登录用户的类型，是否是管理员
      User.findById(req.userInfo._id).then(function(userInfo){
        req.userInfo.isAdmin=Boolean(userInfo.isAdmin);
        next();
      })
    }catch(e){
      next();
    }
  }else{
    next();
  }
});
 /**
  * 首页
  *     req request对象
  *     res response对象
  *     next函数
  */
//  app.get('/',function(req,res,next){
//      //res.send('<h1>欢迎光临我的博客！</h1>');
//     //  读取views目录下的指定文件,解析并返回给客户端
//     // 第一个参数:表示模板的文件,相对于views目录 views/index.html
//      res.render('index');
//  })
/**
 * 根据不同功能划分模块,注释掉上面app.get代码
 */

app.use('/admin',require('./router/admin'));
app.use('/api',require('./router/api'));
app.use('/',require('./router/main'));
/*************************************/
var mongoose=require('mongoose');


mongoose.connect('mongodb://localhost:26666/blog', function(err) {
  if(err){
    console.log('数据库连接失败')
  }else{
    console.log('数据库连接成功')
    app.listen(80)
  }
});
/*************************************/



//  用户发送http请求->url->解析路由->找到匹配的规则->指定绑定函数,返回对应内容至用户
// /public->静态->直接读取指定目录下的文件->返回给用户
// ->动态->处理业务逻辑,加载模板,解析模板->返回数据给用户
